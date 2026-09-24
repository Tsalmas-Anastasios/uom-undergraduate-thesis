"""
SonarQube Pull Request Analysis Pipeline
=======================================

Τι κάνει:
1. Διαβάζει CSV με SonarQube αποτελέσματα για PRs.
2. Καθαρίζει/τυποποιεί δεδομένα.
3. Ενώνει τις δύο αναλύσεις κάθε PR: pr_base vs pr_closed.
4. Υπολογίζει deltas και ποσοστιαίες μεταβολές.
5. Παράγει descriptive statistics, missingness, paired tests, effect sizes.
6. Δημιουργεί plots.
7. Τρέχει Mixed Effects Models για να εκτιμήσει αν αλλάζουν τα metrics από το πρώτο στο τελευταίο commit.
8. Εξάγει όλα τα αποτελέσματα σε CSV/Excel/TXT/PNG.

Εγκατάσταση dependencies:
    pip install pandas numpy scipy matplotlib statsmodels openpyxl

Τρέξιμο:
    python sonarqube_pr_analysis.py

Αν το CSV είναι αλλού, άλλαξε το CSV_PATH στο CONFIG.
"""

from __future__ import annotations

import json
import math
import warnings
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable

import numpy as np
import pandas as pd
from scipy import stats

import matplotlib.pyplot as plt

import statsmodels.api as sm
import statsmodels.formula.api as smf
from statsmodels.tools.sm_exceptions import ConvergenceWarning

warnings.simplefilter("ignore", ConvergenceWarning)
warnings.simplefilter("ignore", RuntimeWarning)


# =============================================================================
# 1. CONFIG
# =============================================================================

@dataclass(frozen=True)
class Config:
    csv_path: Path = Path("/mnt/data/output_filtered.csv")
    out_dir: Path = Path("/mnt/data/sonarqube_analysis_outputs")

    role_base: str = "pr_base"
    role_closed: str = "pr_closed"

    # SonarQube metrics που υπάρχουν στο δικό σου CSV.
    metrics: tuple[str, ...] = (
        "bugs",
        "vulnerabilities",
        "codeSmells",
        "securityHotspots",
        "coverage",
        "duplicatedLinesDensity",
        "ncloc",
        "complexity",
        "cognitiveComplexity",
        "softwareQualityReliabilityIssues",
        "softwareQualityMaintainabilityIssues",
        "softwareQualitySecurityIssues",
    )

    # Για τα περισσότερα SonarQube metrics, μείωση = βελτίωση.
    # Για coverage, αύξηση = βελτίωση.
    higher_is_better: tuple[str, ...] = ("coverage",)

    # Metrics που είναι counts και έχει νόημα να κανονικοποιηθούν ανά KLOC.
    count_metrics_for_rates: tuple[str, ...] = (
        "bugs",
        "vulnerabilities",
        "codeSmells",
        "securityHotspots",
        "complexity",
        "cognitiveComplexity",
        "softwareQualityReliabilityIssues",
        "softwareQualityMaintainabilityIssues",
        "softwareQualitySecurityIssues",
    )

    # Ελάχιστες παρατηρήσεις για να τρέξουν στατιστικά τεστ/μοντέλα.
    min_pairs_for_tests: int = 10
    min_rows_for_model: int = 50

    # Το PR-level MixedLM με random intercept ανά PR μπορεί να είναι πολύ αργό
    # όταν έχεις χιλιάδες PRs και δύο παρατηρήσεις ανά PR.
    # Default: False. Αν το θέλεις οπωσδήποτε, άλλαξέ το σε True.
    run_slow_pr_level_phase_mixedlm: bool = False

    # Τα full raw CSVs με JSON payloads μπορεί να είναι μεγάλα και αργά στο γράψιμο.
    # Κράτα False για γρήγορο/σταθερό run. Άλλαξέ το σε True αν θέλεις όλα τα intermediate files.
    save_large_intermediate_csvs: bool = False

    # Excel export σε shared/cloud notebooks μπορεί να είναι πολύ αργό.
    # Τα CSVs είναι πιο ασφαλή και επαναχρησιμοποιήσιμα.
    write_excel_outputs: bool = False

    # Χρήσιμο για μεγάλα datasets. Βάλε None για όλα τα repositories.
    max_repos_for_plot_labels: int = 30


CFG = Config()


# =============================================================================
# 2. ΒΟΗΘΗΤΙΚΕΣ ΣΥΝΑΡΤΗΣΕΙΣ
# =============================================================================

def ensure_out_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)
    (path / "plots").mkdir(parents=True, exist_ok=True)
    (path / "tables").mkdir(parents=True, exist_ok=True)
    (path / "models").mkdir(parents=True, exist_ok=True)


def safe_filename(name: str) -> str:
    return (
        name.replace("/", "_")
        .replace("\\", "_")
        .replace(" ", "_")
        .replace("%", "pct")
        .replace(":", "_")
    )


def first_non_null(s: pd.Series) -> Any:
    s2 = s.dropna()
    return s2.iloc[0] if len(s2) else np.nan


def get_single_numeric_column(df: pd.DataFrame, column: str) -> pd.Series:
    """
    Return one numeric Series even if a DataFrame accidentally contains duplicate column labels.

    This makes the modeling code robust in notebooks/Colab, where reruns or list-based
    selections can sometimes produce duplicate labels such as ncloc_base twice.
    """
    obj = df[column]
    if isinstance(obj, pd.DataFrame):
        obj = obj.iloc[:, 0]
    return pd.to_numeric(obj, errors="coerce")


def unique_join(s: pd.Series) -> str:
    values = sorted({str(x) for x in s.dropna().astype(str) if str(x).strip()})
    return ", ".join(values) if values else ""


def to_bool(series: pd.Series) -> pd.Series:
    if series.dtype == bool:
        return series
    return series.astype(str).str.lower().map({
        "true": True,
        "1": True,
        "yes": True,
        "false": False,
        "0": False,
        "no": False,
        "nan": np.nan,
        "none": np.nan,
    })


def add_repository_slug(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if "repositoryUrl" in df.columns:
        # π.χ. https://github.com/apache/accumulo -> apache/accumulo
        df["repository_slug"] = (
            df["repositoryUrl"]
            .astype(str)
            .str.replace("https://github.com/", "", regex=False)
            .str.strip("/")
        )
    elif {"username", "repositoryName"}.issubset(df.columns):
        df["repository_slug"] = df["username"].astype(str) + "/" + df["repositoryName"].astype(str)
    else:
        df["repository_slug"] = "unknown_repository"
    return df


def add_pr_uid(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if {"repository_slug", "pullRequestNumber"}.issubset(df.columns):
        df["pr_uid"] = df["repository_slug"].astype(str) + "#" + df["pullRequestNumber"].astype(str)
    else:
        raise ValueError("Χρειάζονται οι στήλες repository_slug και pullRequestNumber για PR identifier.")
    return df


def coerce_numeric(df: pd.DataFrame, cols: list[str] | tuple[str, ...]) -> pd.DataFrame:
    df = df.copy()
    for c in cols:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce")
    return df


def normality_label(p: float | None) -> str:
    if p is None or pd.isna(p):
        return "not_tested"
    return "approximately_normal" if p >= 0.05 else "non_normal"


def improvement_direction(metric: str, delta: pd.Series, higher_is_better: set[str]) -> pd.Series:
    """True όπου το metric βελτιώθηκε από base σε closed."""
    if metric in higher_is_better:
        return delta > 0
    return delta < 0


def signed_effect_size_cohens_dz(delta: pd.Series) -> float:
    d = delta.dropna()
    if len(d) < 2 or d.std(ddof=1) == 0:
        return np.nan
    return d.mean() / d.std(ddof=1)


def cliffs_delta_paired(delta: pd.Series) -> float:
    """
    Απλή paired εκδοχή: αναλογία θετικών - αναλογία αρνητικών διαφορών.
    Τιμές κοντά στο 0 => μικρό πρακτικό effect.
    """
    d = delta.dropna()
    if len(d) == 0:
        return np.nan
    return ((d > 0).sum() - (d < 0).sum()) / len(d)


def try_shapiro(delta: pd.Series, max_n: int = 5000) -> tuple[float, float] | tuple[np.nan, np.nan]:
    d = delta.dropna()
    if len(d) < 3:
        return np.nan, np.nan

    # Avoid scipy warning: Shapiro is not meaningful when every delta is identical.
    if d.nunique(dropna=True) <= 1:
        return np.nan, np.nan

    if len(d) > max_n:
        d = d.sample(max_n, random_state=42)
    try:
        stat, p = stats.shapiro(d)
        return float(stat), float(p)
    except Exception:
        return np.nan, np.nan


def save_text(path: Path, text: str) -> None:
    path.write_text(text, encoding="utf-8")


# =============================================================================
# 3. LOAD / CLEAN / COLLAPSE
# =============================================================================

def load_and_clean(cfg: Config) -> pd.DataFrame:
    df = pd.read_csv(cfg.csv_path)

    # Τυποποίηση ημερομηνιών, όπου υπάρχουν.
    for c in ["createdAt", "updatedAt"]:
        if c in df.columns:
            df[c] = pd.to_datetime(df[c], errors="coerce", utc=True)

    # Boolean columns.
    for c in ["pullRequestMerged", "deleted"]:
        if c in df.columns:
            df[c] = to_bool(df[c])

    df = add_repository_slug(df)
    df = add_pr_uid(df)
    df = coerce_numeric(df, cfg.metrics)

    # Κρατάμε μόνο τις δύο αναλύσεις που μας ενδιαφέρουν.
    df = df[df["analysisRole"].isin([cfg.role_base, cfg.role_closed])].copy()

    # Καθαρισμός deleted rows αν υπάρχουν.
    if "deleted" in df.columns:
        df = df[df["deleted"].fillna(False) == False].copy()  # noqa: E712

    return df


def collapse_duplicate_pr_role_rows(df: pd.DataFrame, cfg: Config) -> pd.DataFrame:
    """
    Αν το ίδιο PR/analysisRole υπάρχει πάνω από μία φορά, το συμπτύσσουμε.
    Αυτό είναι σημαντικό για να μην διπλομετράμε PRs.

    Για numeric metrics παίρνουμε median.
    Για metadata παίρνουμε first non-null.
    Για Category ενώνουμε τις μοναδικές κατηγορίες.
    """
    group_cols = ["pr_uid", "analysisRole"]

    numeric_cols = [c for c in cfg.metrics if c in df.columns]
    metadata_cols = [
        c for c in df.columns
        if c not in numeric_cols + group_cols + ["issuesSummaryJson"]
    ]

    agg: dict[str, Callable | str] = {}
    for c in numeric_cols:
        agg[c] = "median"
    for c in metadata_cols:
        if c == "Category":
            agg[c] = unique_join
        else:
            agg[c] = first_non_null

    collapsed = df.groupby(group_cols, as_index=False).agg(agg)
    return collapsed


def add_rate_metrics(df: pd.DataFrame, cfg: Config) -> tuple[pd.DataFrame, list[str]]:
    """Προσθέτει metrics ανά 1000 γραμμές κώδικα όπου έχει νόημα."""
    df = df.copy()
    rate_cols: list[str] = []
    if "ncloc" not in df.columns:
        return df, rate_cols

    denom = df["ncloc"].replace(0, np.nan) / 1000.0
    for c in cfg.count_metrics_for_rates:
        if c in df.columns and c != "ncloc":
            rate_col = f"{c}_per_kloc"
            df[rate_col] = df[c] / denom
            rate_cols.append(rate_col)
    return df, rate_cols


def make_wide_pairs(df: pd.DataFrame, cfg: Config, all_metrics: list[str]) -> pd.DataFrame:
    base = df[df["analysisRole"] == cfg.role_base].set_index("pr_uid")
    closed = df[df["analysisRole"] == cfg.role_closed].set_index("pr_uid")

    common_prs = base.index.intersection(closed.index)
    base = base.loc[common_prs].copy()
    closed = closed.loc[common_prs].copy()

    metadata_cols = [
        "repository_slug", "username", "repositoryName", "repositoryUrl",
        "pullRequestNumber", "pullRequestTitle", "pullRequestUrl",
        "pullRequestState", "pullRequestMerged", "baseBranchName", "headBranchName",
        "Category", "qualityGateStatus", "ncloc"
    ]
    metadata_cols = [c for c in metadata_cols if c in base.columns]

    # Build all columns in dictionaries/lists first and concatenate once.
    # This avoids pandas DataFrame fragmentation warnings caused by many repeated inserts.
    parts: list[pd.DataFrame] = []

    meta = base[metadata_cols].copy() if metadata_cols else pd.DataFrame(index=common_prs)
    parts.append(meta)

    if "qualityGateStatus" in closed.columns:
        qg = pd.DataFrame(index=common_prs)
        qg["qualityGateStatus_closed"] = closed["qualityGateStatus"]
        if "qualityGateStatus" in meta.columns:
            qg["qualityGate_changed"] = meta["qualityGateStatus"].astype(str) + " -> " + qg["qualityGateStatus_closed"].astype(str)
        parts.append(qg)

    metric_frames: list[pd.DataFrame] = []
    for m in all_metrics:
        if m in base.columns and m in closed.columns:
            b = pd.to_numeric(base[m], errors="coerce")
            c = pd.to_numeric(closed[m], errors="coerce")
            delta = c - b
            metric_frames.append(pd.DataFrame({
                f"{m}_base": b,
                f"{m}_closed": c,
                f"{m}_delta": delta,
                f"{m}_abs_delta": delta.abs(),
                f"{m}_pct_delta": np.where(b.abs() > 0, delta / b.abs() * 100, np.nan),
            }, index=common_prs))

    if metric_frames:
        parts.append(pd.concat(metric_frames, axis=1))

    wide = pd.concat(parts, axis=1).copy()
    wide.index.name = "pr_uid"
    wide = wide.reset_index()
    return wide


# =============================================================================
# 4. ISSUE SUMMARY JSON EXTRACTION
# =============================================================================

def extract_issue_summary_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Από το issuesSummaryJson βγάζει ενδεικτικά:
    - total issues
    - counts ανά severity
    - counts ανά type
    - effortTotal, αν υπάρχει

    Δεν αποτυγχάνει αν το JSON είναι κακοσχηματισμένο.
    """
    if "issuesSummaryJson" not in df.columns:
        return df

    rows = []
    for raw in df["issuesSummaryJson"].fillna(""):
        features = {
            "issues_json_total": np.nan,
            "issues_effort_total": np.nan,
            "sev_BLOCKER": 0,
            "sev_CRITICAL": 0,
            "sev_MAJOR": 0,
            "sev_MINOR": 0,
            "sev_INFO": 0,
            "type_CODE_SMELL": 0,
            "type_BUG": 0,
            "type_VULNERABILITY": 0,
        }
        try:
            obj = json.loads(raw)
            features["issues_json_total"] = obj.get("total", np.nan)
            features["issues_effort_total"] = obj.get("effortTotal", np.nan)

            for facet in obj.get("facets", []):
                prop = facet.get("property")
                for v in facet.get("values", []):
                    val = v.get("val")
                    count = v.get("count", 0)
                    if prop == "severities" and f"sev_{val}" in features:
                        features[f"sev_{val}"] = count
                    if prop == "types" and f"type_{val}" in features:
                        features[f"type_{val}"] = count
        except Exception:
            pass
        rows.append(features)

    features_df = pd.DataFrame(rows, index=df.index)
    return pd.concat([df, features_df], axis=1)


# =============================================================================
# 5. EDA TABLES
# =============================================================================

def produce_eda_tables(raw: pd.DataFrame, collapsed: pd.DataFrame, wide: pd.DataFrame, cfg: Config, all_metrics: list[str]) -> dict[str, pd.DataFrame]:
    tables: dict[str, pd.DataFrame] = {}

    tables["dataset_overview"] = pd.DataFrame({
        "item": [
            "raw_rows",
            "collapsed_rows",
            "paired_prs",
            "repositories",
            "analysis_roles",
            "merged_prs_in_pairs",
        ],
        "value": [
            len(raw),
            len(collapsed),
            len(wide),
            wide["repository_slug"].nunique() if "repository_slug" in wide.columns else np.nan,
            ", ".join(sorted(collapsed["analysisRole"].dropna().unique().astype(str))),
            int(wide["pullRequestMerged"].sum()) if "pullRequestMerged" in wide.columns else np.nan,
        ],
    })

    missing = raw.isna().mean().mul(100).sort_values(ascending=False).reset_index()
    missing.columns = ["column", "missing_pct"]
    tables["missingness_raw"] = missing

    role_counts = collapsed["analysisRole"].value_counts(dropna=False).reset_index()
    role_counts.columns = ["analysisRole", "rows"]
    tables["analysis_role_counts"] = role_counts

    if "repository_slug" in wide.columns:
        repo_counts = wide["repository_slug"].value_counts().reset_index()
        repo_counts.columns = ["repository_slug", "paired_prs"]
        tables["repository_pr_counts"] = repo_counts

    metrics_existing = [m for m in all_metrics if m in collapsed.columns]
    if metrics_existing:
        desc_by_role = collapsed.groupby("analysisRole")[metrics_existing].describe().T.reset_index()
        tables["descriptive_by_role"] = desc_by_role

    delta_cols = [f"{m}_delta" for m in all_metrics if f"{m}_delta" in wide.columns]
    if delta_cols:
        tables["delta_descriptive"] = wide[delta_cols].describe().T.reset_index().rename(columns={"index": "delta_metric"})

    if "qualityGate_changed" in wide.columns:
        q = wide["qualityGate_changed"].value_counts(dropna=False).reset_index()
        q.columns = ["transition", "prs"]
        tables["quality_gate_transitions"] = q

    return tables


def save_tables(tables: dict[str, pd.DataFrame], cfg: Config) -> None:
    table_dir = cfg.out_dir / "tables"
    for name, table in tables.items():
        table.to_csv(table_dir / f"{safe_filename(name)}.csv", index=False)

    # Optional Excel workbook. Disabled by default because it can be slow for large outputs.
    if cfg.write_excel_outputs:
        with pd.ExcelWriter(cfg.out_dir / "sonarqube_analysis_tables.xlsx", engine="openpyxl") as writer:
            for name, table in tables.items():
                sheet = safe_filename(name)[:31]
                table.to_excel(writer, sheet_name=sheet, index=False)


# =============================================================================
# 6. PAIRED TESTS / EFFECT SIZES
# =============================================================================

def paired_tests(wide: pd.DataFrame, cfg: Config, all_metrics: list[str]) -> pd.DataFrame:
    results = []
    higher = set(cfg.higher_is_better)

    for m in all_metrics:
        b = f"{m}_base"
        c = f"{m}_closed"
        dcol = f"{m}_delta"
        if not {b, c, dcol}.issubset(wide.columns):
            continue

        sub = wide[[b, c, dcol]].dropna()
        n = len(sub)
        if n < cfg.min_pairs_for_tests:
            continue

        delta = sub[dcol]
        shapiro_stat, shapiro_p = try_shapiro(delta)

        # Paired t-test: ευαίσθητο σε non-normal deltas, αλλά χρήσιμο συμπληρωματικά.
        try:
            t_stat, t_p = stats.ttest_rel(sub[c], sub[b], nan_policy="omit")
        except Exception:
            t_stat, t_p = np.nan, np.nan

        # Wilcoxon: μη παραμετρικό paired test.
        try:
            nonzero = delta[delta != 0]
            if len(nonzero) >= cfg.min_pairs_for_tests:
                w_stat, w_p = stats.wilcoxon(nonzero)
            else:
                w_stat, w_p = np.nan, np.nan
        except Exception:
            w_stat, w_p = np.nan, np.nan

        improved = improvement_direction(m, delta, higher)

        results.append({
            "metric": m,
            "n_pairs": n,
            "base_mean": sub[b].mean(),
            "closed_mean": sub[c].mean(),
            "mean_delta_closed_minus_base": delta.mean(),
            "median_delta_closed_minus_base": delta.median(),
            "pct_improved": improved.mean() * 100,
            "pct_worsened": ((~improved) & (delta != 0)).mean() * 100,
            "pct_unchanged": (delta == 0).mean() * 100,
            "cohens_dz_delta": signed_effect_size_cohens_dz(delta),
            "paired_cliffs_delta_sign": cliffs_delta_paired(delta),
            "shapiro_delta_stat": shapiro_stat,
            "shapiro_delta_p": shapiro_p,
            "delta_normality_label": normality_label(shapiro_p),
            "paired_t_stat": t_stat,
            "paired_t_p": t_p,
            "wilcoxon_stat": w_stat,
            "wilcoxon_p": w_p,
        })

    res = pd.DataFrame(results)
    if not res.empty:
        # Benjamini-Hochberg FDR correction για πολλαπλά tests.
        for pcol in ["paired_t_p", "wilcoxon_p"]:
            valid = res[pcol].notna()
            if valid.any():
                pvals = res.loc[valid, pcol].values
                order = np.argsort(pvals)
                ranked = np.empty_like(order, dtype=float)
                mtests = len(pvals)
                prev = 1.0
                for rank_idx in range(mtests - 1, -1, -1):
                    i = order[rank_idx]
                    bh = pvals[i] * mtests / (rank_idx + 1)
                    prev = min(prev, bh)
                    ranked[i] = min(prev, 1.0)
                res.loc[valid, f"{pcol}_bh_fdr"] = ranked
    return res


# =============================================================================
# 7. PLOTS
# =============================================================================

def plot_histograms_by_role(collapsed: pd.DataFrame, cfg: Config, all_metrics: list[str]) -> None:
    plot_dir = cfg.out_dir / "plots"

    for m in all_metrics:
        if m not in collapsed.columns:
            continue
        sub = collapsed[["analysisRole", m]].dropna()
        if sub.empty:
            continue

        plt.figure(figsize=(9, 5))
        for role in [cfg.role_base, cfg.role_closed]:
            vals = sub.loc[sub["analysisRole"] == role, m].dropna()
            if len(vals) == 0:
                continue
            # Για πολύ skewed count metrics, log1p κάνει τα histograms πιο αναγνώσιμα.
            vals_plot = np.log1p(vals) if vals.min() >= 0 and vals.max() > 20 else vals
            label = f"{role} ({'log1p' if vals.min() >= 0 and vals.max() > 20 else 'raw'})"
            plt.hist(vals_plot, bins=40, alpha=0.45, label=label)

        plt.title(f"Distribution by analysisRole: {m}")
        plt.xlabel(m)
        plt.ylabel("Frequency")
        plt.legend()
        plt.tight_layout()
        plt.savefig(plot_dir / f"hist_by_role_{safe_filename(m)}.png", dpi=160)
        plt.close()


def plot_delta_boxplots(wide: pd.DataFrame, cfg: Config, all_metrics: list[str]) -> None:
    plot_dir = cfg.out_dir / "plots"
    delta_cols = [f"{m}_delta" for m in all_metrics if f"{m}_delta" in wide.columns]
    if not delta_cols:
        return

    data = []
    labels = []
    for dc in delta_cols:
        vals = wide[dc].dropna()
        if len(vals) > 0:
            # Winsorized-ish display: κόβουμε μόνο για visualization, όχι για analysis.
            low, high = vals.quantile([0.01, 0.99])
            vals = vals.clip(lower=low, upper=high)
            data.append(vals)
            labels.append(dc.replace("_delta", ""))

    if not data:
        return

    plt.figure(figsize=(max(10, len(data) * 0.9), 6))
    plt.boxplot(data, tick_labels=labels, showfliers=False)
    plt.axhline(0, linestyle="--", linewidth=1)
    plt.title("Closed - Base deltas per metric, clipped to 1st/99th percentile for display")
    plt.ylabel("Delta")
    plt.xticks(rotation=60, ha="right")
    plt.tight_layout()
    plt.savefig(plot_dir / "delta_boxplots.png", dpi=160)
    plt.close()


def plot_base_vs_closed_scatter(wide: pd.DataFrame, cfg: Config, all_metrics: list[str]) -> None:
    plot_dir = cfg.out_dir / "plots"

    for m in all_metrics:
        b = f"{m}_base"
        c = f"{m}_closed"
        if not {b, c}.issubset(wide.columns):
            continue
        sub = wide[[b, c]].dropna()
        if len(sub) < 5:
            continue

        plt.figure(figsize=(6, 6))
        x = sub[b]
        y = sub[c]
        if x.min() >= 0 and y.min() >= 0 and max(x.max(), y.max()) > 20:
            x = np.log1p(x)
            y = np.log1p(y)
            axis_label = f"log1p({m})"
        else:
            axis_label = m
        plt.scatter(x, y, s=10, alpha=0.35)
        lo = min(x.min(), y.min())
        hi = max(x.max(), y.max())
        plt.plot([lo, hi], [lo, hi], linestyle="--", linewidth=1)
        plt.title(f"Base vs Closed: {m}")
        plt.xlabel(f"Base {axis_label}")
        plt.ylabel(f"Closed {axis_label}")
        plt.tight_layout()
        plt.savefig(plot_dir / f"scatter_base_vs_closed_{safe_filename(m)}.png", dpi=160)
        plt.close()


def plot_repository_mean_deltas(wide: pd.DataFrame, cfg: Config, metrics: list[str]) -> None:
    if "repository_slug" not in wide.columns:
        return
    plot_dir = cfg.out_dir / "plots"

    for m in metrics:
        dcol = f"{m}_delta"
        if dcol not in wide.columns:
            continue
        sub = wide[["repository_slug", dcol]].dropna()
        if sub.empty:
            continue
        repo = (
            sub.groupby("repository_slug")[dcol]
            .agg(["mean", "count"])
            .query("count >= 3")
            .sort_values("mean")
        )
        if repo.empty:
            continue

        # Εμφάνιση των πιο έντονων mean deltas.
        top_neg = repo.head(cfg.max_repos_for_plot_labels // 2)
        top_pos = repo.tail(cfg.max_repos_for_plot_labels // 2)
        display = pd.concat([top_neg, top_pos]).drop_duplicates()

        plt.figure(figsize=(10, max(6, len(display) * 0.25)))
        plt.barh(display.index, display["mean"])
        plt.axvline(0, linestyle="--", linewidth=1)
        plt.title(f"Repository-level mean delta: {m}")
        plt.xlabel("Mean closed - base")
        plt.ylabel("Repository")
        plt.tight_layout()
        plt.savefig(plot_dir / f"repo_mean_delta_{safe_filename(m)}.png", dpi=160)
        plt.close()


def plot_quality_gate_transition(wide: pd.DataFrame, cfg: Config) -> None:
    if not {"qualityGateStatus", "qualityGateStatus_closed"}.issubset(wide.columns):
        return
    plot_dir = cfg.out_dir / "plots"
    tab = pd.crosstab(wide["qualityGateStatus"], wide["qualityGateStatus_closed"])
    if tab.empty:
        return

    plt.figure(figsize=(6, 5))
    plt.imshow(tab.values, aspect="auto")
    plt.xticks(range(tab.shape[1]), tab.columns, rotation=45, ha="right")
    plt.yticks(range(tab.shape[0]), tab.index)
    for i in range(tab.shape[0]):
        for j in range(tab.shape[1]):
            plt.text(j, i, str(tab.values[i, j]), ha="center", va="center")
    plt.title("Quality Gate transition: base -> closed")
    plt.xlabel("Closed")
    plt.ylabel("Base")
    plt.tight_layout()
    plt.savefig(plot_dir / "quality_gate_transition_heatmap.png", dpi=160)
    plt.close()


def produce_plots(collapsed: pd.DataFrame, wide: pd.DataFrame, cfg: Config, all_metrics: list[str]) -> None:
    plot_histograms_by_role(collapsed, cfg, all_metrics)
    plot_delta_boxplots(wide, cfg, all_metrics)
    plot_base_vs_closed_scatter(wide, cfg, all_metrics)
    plot_repository_mean_deltas(wide, cfg, ["bugs", "codeSmells", "vulnerabilities", "coverage", "complexity", "cognitiveComplexity"])
    plot_quality_gate_transition(wide, cfg)


# =============================================================================
# 8. MIXED EFFECTS MODELS
# =============================================================================

def prepare_long_model_data(collapsed: pd.DataFrame, cfg: Config, metric: str) -> pd.DataFrame:
    needed = ["pr_uid", "repository_slug", "analysisRole", metric]
    optional = ["pullRequestMerged", "ncloc", "Category", "qualityGateStatus"]

    # IMPORTANT:
    # When metric == "ncloc", the metric appears both in `needed` and `optional`.
    # Pandas allows duplicate column names in a selection, and then data[metric]
    # returns a DataFrame instead of a Series. That caused:
    # ValueError: Cannot set a DataFrame with multiple columns to the single column y_raw
    cols = list(dict.fromkeys(c for c in needed + optional if c in collapsed.columns))

    data = collapsed.loc[:, cols].dropna(subset=[metric, "pr_uid", "repository_slug", "analysisRole"]).copy()
    data["phase_closed"] = (data["analysisRole"] == cfg.role_closed).astype(int)
    data["y_raw"] = pd.to_numeric(data[metric], errors="coerce")

    # Μετασχηματισμός dependent variable.
    # Counts/skewed θετικά metrics: log1p.
    # coverage/duplicated density: raw scale, αλλά μπορείς να αλλάξεις σε logit αν θέλεις.
    if metric in {"coverage", "duplicatedLinesDensity"}:
        data["y"] = data["y_raw"]
        y_transform = "raw"
    else:
        data["y"] = np.log1p(data["y_raw"].clip(lower=0))
        y_transform = "log1p"

    if "ncloc" in data.columns:
        data["log_ncloc"] = np.log1p(data["ncloc"].clip(lower=0))
    else:
        data["log_ncloc"] = np.nan

    if "pullRequestMerged" in data.columns:
        data["pullRequestMerged_num"] = data["pullRequestMerged"].astype(float)
    else:
        data["pullRequestMerged_num"] = np.nan

    data.attrs["y_transform"] = y_transform
    return data


def fit_mixedlm_with_fallback(formula: str, data: pd.DataFrame, groups: str, re_formula: str | None = "1"):
    methods = ["lbfgs", "powell", "cg"]
    last_err = None
    for method in methods:
        try:
            model = smf.mixedlm(
                formula=formula,
                data=data,
                groups=data[groups],
                re_formula=re_formula,
            )
            result = model.fit(method=method, reml=False, maxiter=500, disp=False)
            return result
        except Exception as e:
            last_err = e
    raise last_err


def run_phase_mixed_models(collapsed: pd.DataFrame, cfg: Config, all_metrics: list[str]) -> pd.DataFrame:
    """
    Μοντέλο τύπου:
        y ~ phase_closed + log_ncloc + pullRequestMerged_num + (1 | pr_uid)

    Ερμηνεία phase_closed:
        Η μέση διαφορά του metric στο τελευταίο commit σε σχέση με το πρώτο commit,
        αφού ελέγξουμε για μέγεθος κώδικα και merged status.

    Χρησιμοποιούμε random intercept ανά PR, επειδή κάθε PR έχει δύο επαναλαμβανόμενες μετρήσεις.
    """
    model_rows = []
    model_dir = cfg.out_dir / "models"

    for metric in all_metrics:
        if metric not in collapsed.columns:
            continue
        data = prepare_long_model_data(collapsed, cfg, metric)

        # Κρατάμε PRs με ακριβώς και τις δύο φάσεις.
        pr_phase_counts = data.groupby("pr_uid")["analysisRole"].nunique()
        complete_prs = pr_phase_counts[pr_phase_counts == 2].index
        data = data[data["pr_uid"].isin(complete_prs)].copy()

        # Drop rows required by formula.
        formula_terms = ["phase_closed"]
        if "log_ncloc" in data.columns and data["log_ncloc"].notna().sum() >= cfg.min_rows_for_model:
            formula_terms.append("log_ncloc")
        if "pullRequestMerged_num" in data.columns and data["pullRequestMerged_num"].nunique(dropna=True) > 1:
            formula_terms.append("pullRequestMerged_num")

        data = data.dropna(subset=["y", "pr_uid"] + formula_terms)
        if len(data) < cfg.min_rows_for_model or data["phase_closed"].nunique() < 2:
            continue

        formula = "y ~ " + " + ".join(formula_terms)

        try:
            result = fit_mixedlm_with_fallback(formula, data, groups="pr_uid", re_formula="1")
            save_text(model_dir / f"mixedlm_phase_{safe_filename(metric)}.txt", result.summary().as_text())

            coef = result.params.get("phase_closed", np.nan)
            pval = result.pvalues.get("phase_closed", np.nan)
            ci = result.conf_int().loc["phase_closed"].tolist() if "phase_closed" in result.params.index else [np.nan, np.nan]

            model_rows.append({
                "model_type": "Linear Mixed Effects Model",
                "model_name": "phase_effect_random_intercept_pr",
                "metric": metric,
                "dependent_variable_transform": data.attrs.get("y_transform", "unknown"),
                "formula": formula + " + (1 | pr_uid)",
                "n_rows": len(data),
                "n_prs": data["pr_uid"].nunique(),
                "n_repositories": data["repository_slug"].nunique() if "repository_slug" in data.columns else np.nan,
                "phase_closed_coef": coef,
                "phase_closed_ci_low": ci[0],
                "phase_closed_ci_high": ci[1],
                "phase_closed_p": pval,
                "aic": result.aic,
                "bic": result.bic,
                "converged": getattr(result, "converged", np.nan),
                "interpretation": interpret_phase_coef(metric, coef, data.attrs.get("y_transform", "unknown"), cfg),
            })
        except Exception as e:
            model_rows.append({
                "model_type": "Linear Mixed Effects Model",
                "model_name": "phase_effect_random_intercept_pr",
                "metric": metric,
                "formula": formula + " + (1 | pr_uid)",
                "n_rows": len(data),
                "error": repr(e),
            })

    return pd.DataFrame(model_rows)


def interpret_phase_coef(metric: str, coef: float, transform: str, cfg: Config) -> str:
    if pd.isna(coef):
        return "No coefficient available."

    if transform == "log1p":
        pct = (math.exp(coef) - 1) * 100
        direction = "increase" if pct > 0 else "decrease"
        quality = "improvement" if ((metric in cfg.higher_is_better and pct > 0) or (metric not in cfg.higher_is_better and pct < 0)) else "worsening"
        return f"Closed phase is associated with an approximate {abs(pct):.2f}% {direction} in {metric}; for this metric that suggests {quality}."

    direction = "increase" if coef > 0 else "decrease"
    quality = "improvement" if ((metric in cfg.higher_is_better and coef > 0) or (metric not in cfg.higher_is_better and coef < 0)) else "worsening"
    return f"Closed phase is associated with an average {abs(coef):.4f} unit {direction} in {metric}; for this metric that suggests {quality}."



def run_phase_gee_models(collapsed: pd.DataFrame, cfg: Config, all_metrics: list[str]) -> pd.DataFrame:
    """
    Fast repeated-measures phase model:
        y ~ phase_closed + log_ncloc + pullRequestMerged_num
        clustered by pr_uid

    This is not a mixed-effects model, but it directly handles the two correlated
    observations per PR and is much faster than a PR-level MixedLM on large data.
    Use it as the practical phase-effect model, together with the repository-level
    delta MixedLM below.
    """
    rows = []
    model_dir = cfg.out_dir / "models"

    for metric in all_metrics:
        if metric not in collapsed.columns:
            continue

        data = prepare_long_model_data(collapsed, cfg, metric)

        # Keep PRs that have both base and closed rows.
        pr_phase_counts = data.groupby("pr_uid")["analysisRole"].nunique()
        complete_prs = pr_phase_counts[pr_phase_counts == 2].index
        data = data[data["pr_uid"].isin(complete_prs)].copy()

        terms = ["phase_closed"]
        if "log_ncloc" in data.columns and data["log_ncloc"].notna().sum() >= cfg.min_rows_for_model and metric != "ncloc":
            terms.append("log_ncloc")
        if "pullRequestMerged_num" in data.columns and data["pullRequestMerged_num"].nunique(dropna=True) > 1:
            terms.append("pullRequestMerged_num")

        data = data.dropna(subset=["y", "pr_uid"] + terms)
        if len(data) < cfg.min_rows_for_model or data["phase_closed"].nunique() < 2:
            continue

        formula = "y ~ " + " + ".join(terms)

        try:
            model = smf.gee(
                formula=formula,
                groups="pr_uid",
                data=data,
                family=sm.families.Gaussian(),
                cov_struct=sm.cov_struct.Exchangeable(),
            )
            result = model.fit()
            save_text(model_dir / f"gee_phase_{safe_filename(metric)}.txt", result.summary().as_text())

            coef = result.params.get("phase_closed", np.nan)
            pval = result.pvalues.get("phase_closed", np.nan)
            ci = result.conf_int().loc["phase_closed"].tolist() if "phase_closed" in result.params.index else [np.nan, np.nan]

            rows.append({
                "model_type": "GEE Gaussian, clustered by PR",
                "model_name": "phase_effect_repeated_measures_pr",
                "metric": metric,
                "dependent_variable_transform": data.attrs.get("y_transform", "unknown"),
                "formula": formula + ", clusters=pr_uid",
                "n_rows": len(data),
                "n_prs": data["pr_uid"].nunique(),
                "n_repositories": data["repository_slug"].nunique() if "repository_slug" in data.columns else np.nan,
                "phase_closed_coef": coef,
                "phase_closed_ci_low": ci[0],
                "phase_closed_ci_high": ci[1],
                "phase_closed_p": pval,
                "interpretation": interpret_phase_coef(metric, coef, data.attrs.get("y_transform", "unknown"), cfg),
            })
        except Exception as e:
            rows.append({
                "model_type": "GEE Gaussian, clustered by PR",
                "model_name": "phase_effect_repeated_measures_pr",
                "metric": metric,
                "formula": formula + ", clusters=pr_uid",
                "n_rows": len(data),
                "error": repr(e),
            })

    return pd.DataFrame(rows)

def run_delta_mixed_models(wide: pd.DataFrame, cfg: Config, all_metrics: list[str]) -> pd.DataFrame:
    """
    PR-level model:
        delta_metric ~ base_metric + log_ncloc_base + pullRequestMerged + (1 | repository)

    Γιατί είναι χρήσιμο:
    - Η dependent variable είναι απευθείας η αλλαγή μέσα στο PR.
    - Το random intercept ανά repository ελέγχει ότι κάποια repositories είναι γενικά πιο καθαρά/προβληματικά.
    - Το base_metric ελέγχει regression-to-the-mean: PRs με πολλά αρχικά issues έχουν περισσότερα περιθώρια μείωσης.
    """
    rows = []
    model_dir = cfg.out_dir / "models"

    for metric in all_metrics:
        b = f"{metric}_base"
        d = f"{metric}_delta"
        if not {b, d, "repository_slug"}.issubset(wide.columns):
            continue

        cols = ["repository_slug", b, d]
        if "ncloc_base" in wide.columns:
            cols.append("ncloc_base")
        if "pullRequestMerged" in wide.columns:
            cols.append("pullRequestMerged")
        if "qualityGateStatus" in wide.columns:
            cols.append("qualityGateStatus")

        # Important: for metric == "ncloc", b is also "ncloc_base".
        # Deduplicate the selected columns; otherwise pandas returns a DataFrame
        # when we access data[b], which causes "truth value of a Series is ambiguous".
        cols = list(dict.fromkeys(cols))
        data = wide.loc[:, cols].copy()

        base_series = get_single_numeric_column(data, b)
        delta_series = get_single_numeric_column(data, d)

        if base_series.min(skipna=True) >= 0:
            data["base_log1p"] = np.log1p(base_series.clip(lower=0))
        else:
            data["base_log1p"] = base_series
        data["delta_y"] = delta_series

        # Για skewed count metrics, χρησιμοποιούμε log ratio ως εναλλακτική dependent variable.
        c = f"{metric}_closed"
        if c in wide.columns and metric not in {"coverage", "duplicatedLinesDensity"}:
            closed_series = get_single_numeric_column(wide, c)
            wide_base_series = get_single_numeric_column(wide, b)
            data["delta_y"] = np.log1p(closed_series.clip(lower=0)) - np.log1p(wide_base_series.clip(lower=0))
            dep_transform = "log1p_closed_minus_log1p_base"
        else:
            dep_transform = "raw_delta"

        formula_terms = ["base_log1p"]
        # Do not add ncloc_base as an additional control when ncloc itself is
        # the metric being modeled; it would duplicate base_log1p.
        if "ncloc_base" in wide.columns and b != "ncloc_base":
            ncloc_series = get_single_numeric_column(data, "ncloc_base")
            data["log_ncloc_base"] = np.log1p(ncloc_series.clip(lower=0))
            formula_terms.append("log_ncloc_base")
        if "pullRequestMerged" in data.columns and data["pullRequestMerged"].nunique(dropna=True) > 1:
            data["pullRequestMerged_num"] = data["pullRequestMerged"].astype(float)
            formula_terms.append("pullRequestMerged_num")

        data = data.dropna(subset=["delta_y", "repository_slug"] + formula_terms)
        # Κρατάμε repositories με τουλάχιστον 2 PRs για random effect.
        repo_counts = data["repository_slug"].value_counts()
        data = data[data["repository_slug"].isin(repo_counts[repo_counts >= 2].index)].copy()

        if len(data) < cfg.min_rows_for_model or data["repository_slug"].nunique() < 2:
            continue

        formula = "delta_y ~ " + " + ".join(formula_terms)

        try:
            result = fit_mixedlm_with_fallback(formula, data, groups="repository_slug", re_formula="1")
            save_text(model_dir / f"mixedlm_delta_{safe_filename(metric)}.txt", result.summary().as_text())

            intercept = result.params.get("Intercept", np.nan)
            intercept_p = result.pvalues.get("Intercept", np.nan)
            ci = result.conf_int().loc["Intercept"].tolist() if "Intercept" in result.params.index else [np.nan, np.nan]

            rows.append({
                "model_type": "Linear Mixed Effects Model",
                "model_name": "pr_delta_random_intercept_repository",
                "metric": metric,
                "dependent_variable_transform": dep_transform,
                "formula": formula + " + (1 | repository_slug)",
                "n_rows": len(data),
                "n_repositories": data["repository_slug"].nunique(),
                "intercept_mean_adjusted_delta": intercept,
                "intercept_ci_low": ci[0],
                "intercept_ci_high": ci[1],
                "intercept_p": intercept_p,
                "aic": result.aic,
                "bic": result.bic,
                "converged": getattr(result, "converged", np.nan),
                "interpretation": interpret_delta_intercept(metric, intercept, dep_transform, cfg),
            })
        except Exception as e:
            rows.append({
                "model_type": "Linear Mixed Effects Model",
                "model_name": "pr_delta_random_intercept_repository",
                "metric": metric,
                "formula": formula + " + (1 | repository_slug)",
                "n_rows": len(data),
                "error": repr(e),
            })

    return pd.DataFrame(rows)


def interpret_delta_intercept(metric: str, intercept: float, transform: str, cfg: Config) -> str:
    if pd.isna(intercept):
        return "No intercept available."

    if transform == "log1p_closed_minus_log1p_base":
        pct = (math.exp(intercept) - 1) * 100
        direction = "increase" if pct > 0 else "decrease"
        quality = "improvement" if ((metric in cfg.higher_is_better and pct > 0) or (metric not in cfg.higher_is_better and pct < 0)) else "worsening"
        return f"After controls, PR closing is associated with approx. {abs(pct):.2f}% {direction} in {metric}; interpreted as {quality}."

    direction = "increase" if intercept > 0 else "decrease"
    quality = "improvement" if ((metric in cfg.higher_is_better and intercept > 0) or (metric not in cfg.higher_is_better and intercept < 0)) else "worsening"
    return f"After controls, adjusted mean delta is {intercept:.4f}, i.e. {direction}; interpreted as {quality}."


def run_quality_gate_models(collapsed: pd.DataFrame, cfg: Config) -> pd.DataFrame:
    """
    Για binary outcome quality gate OK/ERROR.

    Εδώ δίνω πρακτική λύση με GEE logistic model:
        quality_gate_ok ~ phase_closed + log_ncloc + pullRequestMerged
        clustered by pr_uid

    Σημείωση:
    - Το GEE δεν είναι mixed-effects model, αλλά είναι πολύ πρακτικό για correlated repeated measurements.
    - Για αυστηρό GLMM σε Python μπορείς να χρησιμοποιήσεις BinomialBayesMixedGLM, αλλά είναι πιο αργό/ευαίσθητο.
    """
    if "qualityGateStatus" not in collapsed.columns:
        return pd.DataFrame()

    data = collapsed[[
        c for c in ["pr_uid", "repository_slug", "analysisRole", "qualityGateStatus", "ncloc", "pullRequestMerged"]
        if c in collapsed.columns
    ]].dropna(subset=["pr_uid", "analysisRole", "qualityGateStatus"]).copy()

    data["quality_gate_ok"] = (data["qualityGateStatus"].astype(str).str.upper() == "OK").astype(int)
    data["phase_closed"] = (data["analysisRole"] == cfg.role_closed).astype(int)
    if "ncloc" in data.columns:
        data["log_ncloc"] = np.log1p(pd.to_numeric(data["ncloc"], errors="coerce").clip(lower=0))
    if "pullRequestMerged" in data.columns:
        data["pullRequestMerged_num"] = data["pullRequestMerged"].astype(float)

    terms = ["phase_closed"]
    if "log_ncloc" in data.columns and data["log_ncloc"].notna().sum() >= cfg.min_rows_for_model:
        terms.append("log_ncloc")
    if "pullRequestMerged_num" in data.columns and data["pullRequestMerged_num"].nunique(dropna=True) > 1:
        terms.append("pullRequestMerged_num")

    data = data.dropna(subset=["quality_gate_ok", "pr_uid"] + terms)
    if len(data) < cfg.min_rows_for_model or data["quality_gate_ok"].nunique() < 2:
        return pd.DataFrame()

    formula = "quality_gate_ok ~ " + " + ".join(terms)
    rows = []

    try:
        model = smf.gee(
            formula,
            groups="pr_uid",
            data=data,
            family=sm.families.Binomial(),
            cov_struct=sm.cov_struct.Exchangeable(),
        )
        res = model.fit()
        save_text(cfg.out_dir / "models" / "gee_quality_gate_ok.txt", res.summary().as_text())

        coef = res.params.get("phase_closed", np.nan)
        pval = res.pvalues.get("phase_closed", np.nan)
        odds_ratio = math.exp(coef) if not pd.isna(coef) else np.nan

        rows.append({
            "model_type": "GEE Logistic, clustered by PR",
            "model_name": "quality_gate_ok_phase_effect",
            "formula": formula + ", clusters=pr_uid",
            "n_rows": len(data),
            "n_prs": data["pr_uid"].nunique(),
            "phase_closed_log_odds_coef": coef,
            "phase_closed_odds_ratio": odds_ratio,
            "phase_closed_p": pval,
            "interpretation": f"Odds ratio {odds_ratio:.3f}: values > 1 mean higher odds of OK quality gate at PR closed phase; values < 1 mean lower odds.",
        })
    except Exception as e:
        rows.append({
            "model_type": "GEE Logistic, clustered by PR",
            "model_name": "quality_gate_ok_phase_effect",
            "formula": formula + ", clusters=pr_uid",
            "n_rows": len(data),
            "error": repr(e),
        })

    return pd.DataFrame(rows)


def run_all_models(collapsed: pd.DataFrame, wide: pd.DataFrame, cfg: Config, all_metrics: list[str]) -> dict[str, pd.DataFrame]:
    models = {
        # Fast repeated-measures model for base vs closed.
        "gee_phase_effects": run_phase_gee_models(collapsed, cfg, all_metrics),

        # Actual mixed-effects model at PR-delta level with repository random intercept.
        "mixedlm_delta_effects": run_delta_mixed_models(wide, cfg, all_metrics),

        # Binary/correlated quality-gate model.
        "gee_quality_gate": run_quality_gate_models(collapsed, cfg),
    }

    if cfg.run_slow_pr_level_phase_mixedlm:
        models["mixedlm_phase_effects_slow_pr_random_intercept"] = run_phase_mixed_models(collapsed, cfg, all_metrics)

    for name, table in models.items():
        if not table.empty:
            table.to_csv(cfg.out_dir / "models" / f"{safe_filename(name)}.csv", index=False)
    return models


# =============================================================================
# 9. CORRELATIONS / EXTRA ANALYSES
# =============================================================================

def delta_correlation_matrix(wide: pd.DataFrame, cfg: Config, all_metrics: list[str]) -> pd.DataFrame:
    delta_cols = [f"{m}_delta" for m in all_metrics if f"{m}_delta" in wide.columns]
    if len(delta_cols) < 2:
        return pd.DataFrame()
    corr = wide[delta_cols].corr(method="spearman")
    corr.to_csv(cfg.out_dir / "tables" / "spearman_delta_correlations.csv")
    return corr


def repository_summary(wide: pd.DataFrame, cfg: Config, all_metrics: list[str]) -> pd.DataFrame:
    if "repository_slug" not in wide.columns:
        return pd.DataFrame()

    agg_dict = {"pr_uid": "count"}
    for m in all_metrics:
        d = f"{m}_delta"
        if d in wide.columns:
            agg_dict[d] = ["mean", "median", "std"]

    repo = wide.groupby("repository_slug").agg(agg_dict)
    repo.columns = ["_".join([str(x) for x in col if str(x)]) for col in repo.columns]
    repo = repo.rename(columns={"pr_uid_count": "paired_prs"}).reset_index()
    repo.to_csv(cfg.out_dir / "tables" / "repository_level_summary.csv", index=False)
    return repo


def category_summary(wide: pd.DataFrame, cfg: Config, all_metrics: list[str]) -> pd.DataFrame:
    if "Category" not in wide.columns:
        return pd.DataFrame()

    # Explode multi-category strings ώστε κάθε PR να συμβάλλει σε κάθε category του.
    tmp = wide.copy()
    tmp["Category_exploded"] = tmp["Category"].fillna("unknown").astype(str).str.split(",")
    tmp = tmp.explode("Category_exploded")
    tmp["Category_exploded"] = tmp["Category_exploded"].str.strip().replace("", "unknown")

    rows = []
    for cat, g in tmp.groupby("Category_exploded"):
        row = {"Category": cat, "paired_prs": g["pr_uid"].nunique()}
        for m in all_metrics:
            d = f"{m}_delta"
            if d in g.columns:
                row[f"{m}_mean_delta"] = g[d].mean()
                row[f"{m}_median_delta"] = g[d].median()
        rows.append(row)

    res = pd.DataFrame(rows).sort_values("paired_prs", ascending=False)
    res.to_csv(cfg.out_dir / "tables" / "category_level_summary.csv", index=False)
    return res


# =============================================================================
# 10. MAIN PIPELINE
# =============================================================================

def main(cfg: Config = CFG) -> None:
    ensure_out_dir(cfg.out_dir)

    print("Loading dataset...")
    raw = load_and_clean(cfg)
    raw = extract_issue_summary_features(raw)

    # Προσθέτουμε extracted JSON metrics στα metrics, αν δημιουργήθηκαν.
    json_metrics = [
        c for c in [
            "issues_json_total", "issues_effort_total",
            "sev_BLOCKER", "sev_CRITICAL", "sev_MAJOR", "sev_MINOR", "sev_INFO",
            "type_CODE_SMELL", "type_BUG", "type_VULNERABILITY",
        ]
        if c in raw.columns
    ]

    # Ενημερώνουμε προσωρινό cfg-like metric list χωρίς να αλλάξουμε το frozen dataclass.
    base_metrics = [m for m in cfg.metrics if m in raw.columns]
    raw_for_rates, rate_cols = add_rate_metrics(raw, cfg)
    all_metrics = base_metrics + json_metrics + rate_cols
    all_metrics = list(dict.fromkeys([m for m in all_metrics if m in raw_for_rates.columns]))

    print("Collapsing duplicate PR-role rows...")
    collapsed = collapse_duplicate_pr_role_rows(raw_for_rates, cfg)

    # Αν τα rate metrics προστέθηκαν μετά την αρχική cfg.metrics, πρέπει να τα κρατήσουμε.
    # Τα δημιουργούμε ξανά μετά το collapse για ασφάλεια.
    collapsed, rate_cols_after = add_rate_metrics(collapsed, cfg)
    all_metrics = list(dict.fromkeys(base_metrics + json_metrics + rate_cols_after))

    print("Creating paired wide dataset...")
    wide = make_wide_pairs(collapsed, cfg, all_metrics)

    # Save useful datasets. The raw-with-JSON file can be large/slow, so it is optional.
    if cfg.save_large_intermediate_csvs:
        raw_for_rates.to_csv(cfg.out_dir / "tables" / "01_raw_cleaned_with_features.csv", index=False)
    collapsed.to_csv(cfg.out_dir / "tables" / "02_collapsed_pr_role.csv", index=False)
    wide.to_csv(cfg.out_dir / "tables" / "03_paired_pr_deltas_wide.csv", index=False)

    print("Producing EDA tables...")
    tables = produce_eda_tables(raw_for_rates, collapsed, wide, cfg, all_metrics)
    tests = paired_tests(wide, cfg, all_metrics)
    tables["paired_tests_effect_sizes"] = tests

    corr = delta_correlation_matrix(wide, cfg, all_metrics)
    if not corr.empty:
        tables["spearman_delta_correlations"] = corr.reset_index().rename(columns={"index": "metric"})

    repo = repository_summary(wide, cfg, all_metrics)
    if not repo.empty:
        tables["repository_level_summary"] = repo

    cat = category_summary(wide, cfg, all_metrics)
    if not cat.empty:
        tables["category_level_summary"] = cat

    save_tables(tables, cfg)

    print("Producing plots...")
    produce_plots(collapsed, wide, cfg, all_metrics)

    print("Running mixed-effects / correlated models...")
    model_tables = run_all_models(collapsed, wide, cfg, all_metrics)

    # Optional Excel with model summaries. CSVs are always produced.
    if cfg.write_excel_outputs:
        with pd.ExcelWriter(cfg.out_dir / "models" / "model_results.xlsx", engine="openpyxl") as writer:
            for name, table in model_tables.items():
                if not table.empty:
                    table.to_excel(writer, sheet_name=safe_filename(name)[:31], index=False)

    # Executive summary txt.
    overview = tables.get("dataset_overview", pd.DataFrame())
    summary_lines = [
        "SonarQube PR Analysis completed.",
        "",
        f"Input CSV: {cfg.csv_path}",
        f"Output directory: {cfg.out_dir}",
        "",
        "Dataset overview:",
        overview.to_string(index=False) if not overview.empty else "No overview available.",
        "",
        "Main files:",
        "- tables/03_paired_pr_deltas_wide.csv: one row per PR with base/closed/delta metrics",
        "- tables/paired_tests_effect_sizes.csv: paired statistical tests and effect sizes",
        "- models/gee_phase_effects.csv: fast repeated-measures phase models clustered by PR",
        "- models/mixedlm_delta_effects.csv: PR-delta mixed models with repository random intercept",
        "- plots/: diagnostic and descriptive plots",
    ]
    save_text(cfg.out_dir / "README_RESULTS.txt", "\n".join(summary_lines))

    print("Done.")
    print(f"Outputs written to: {cfg.out_dir}")


if __name__ == "__main__":
    main()
