"""
SonarQube PR Mixed-Effects Analysis for normalized CSV
======================================================

This script is tailored for `output_filtered_normalized.csv`.
It analyzes SonarQube metrics for each Pull Request using the two PR snapshots:

- pr_base   = first / initial PR commit analysis
- pr_closed = final / closing PR commit analysis

Main research question:
    Did quality/security metrics change from the first to the last PR commit,
    while accounting for the fact that PRs are nested inside repositories?

Primary model:
    Delta mixed-effects model

    delta_metric ~ baseline_metric + log(ncloc_base + 1) + merged_status + (1 | repository)

where:
    delta_metric = metric_at_pr_closed - metric_at_pr_base

Supporting model:
    GEE repeated-measures phase model clustered by PR:

    metric ~ phase_closed + log(ncloc + 1) + merged_status

Why both?
    - The mixed model gives you a true random-effect model by repository.
    - The GEE model is a robust supporting analysis for the repeated base/closed structure.

Colab usage:
    1. Upload output_filtered_normalized.csv to Colab.
    2. Edit the USER CONFIGURATION section below if your paths are different.
    3. Run:

       !pip install pandas numpy scipy matplotlib statsmodels openpyxl
       !python sonarqube_normalized_mixed_effects_configured.py

This version intentionally configures the input CSV path and output directory inside the code,
so you do not need to pass --csv or --out command-line arguments.
"""

from __future__ import annotations

import json
import math
import warnings
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from scipy import stats

import matplotlib.pyplot as plt

import statsmodels.api as sm
import statsmodels.formula.api as smf
from statsmodels.tools.sm_exceptions import ConvergenceWarning

warnings.simplefilter("ignore", ConvergenceWarning)
warnings.simplefilter("ignore", RuntimeWarning)
warnings.simplefilter("ignore", FutureWarning)


# =============================================================================
# Configuration
# =============================================================================

# =============================================================================
# USER CONFIGURATION - EDIT THESE PATHS IN GOOGLE COLAB
# =============================================================================

# In Google Colab, uploaded files are usually placed directly under /content.
# Example after files.upload(): /content/output_filtered_normalized.csv
INPUT_CSV_PATH: Path = Path("/content/output_filtered_normalized.csv")

# All generated tables, models, plots, and README files will be written here.
OUTPUT_DIR: Path = Path("/content/sonarqube_normalized_mixed_effects_outputs")

# Keep True for your normalized CSV.
INCLUDE_NORMALIZED_METRICS: bool = True

# Set True only if you also want the original raw SonarQube metrics analyzed.
# For the thesis, normalized metrics are usually the better default because they control for code size.
INCLUDE_RAW_METRICS: bool = False

# Set False if you want only CSV outputs and want to avoid Excel creation.
WRITE_EXCEL: bool = True

# Set False if you want a faster run without PNG plots.
MAKE_PLOTS: bool = True

# Maximum safe thresholds for the attached normalized CSV.
# The normalized metrics have 3,899 complete base/closed PR pairs.
# Setting these values above 3,899 would skip all normalized metrics.
MIN_PAIRS_FOR_TESTS: int = 3899

# Maximum safe model-row threshold for the attached normalized CSV.
# Each selected normalized metric has 3,899 complete PR-level rows for delta MixedLM.
MIN_ROWS_FOR_MODEL: int = 3899

# Optional fallback: this makes the same script work in this ChatGPT sandbox too.
# In Colab, INPUT_CSV_PATH should already exist, so the fallback is not used.
if not INPUT_CSV_PATH.exists() and Path("/mnt/data/output_filtered_normalized.csv").exists():
    INPUT_CSV_PATH = Path("/mnt/data/output_filtered_normalized.csv")
    OUTPUT_DIR = Path("/mnt/data/sonarqube_normalized_mixed_effects_outputs")


RAW_METRICS: tuple[str, ...] = (
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

NORMALIZED_METRICS: tuple[str, ...] = (
    "bugsPerLineOfCode",
    "vulnerabilitiesPerLineOfCode",
    "codeSmellsPerLineOfCode",
    "securityHotspotsPerLineOfCode",
    "duplicatedLinesDensityPerLineOfCode",
    "complexityPerLineOfCode",
    "cognitiveComplexityPerLineOfCode",
    "softwareQualityReliabilityIssuesPerLineOfCode",
    "softwareQualityMaintainabilityIssuesPerLineOfCode",
    "softwareQualitySecurityIssuesPerLineOfCode",
)

# These columns may exist in the normalized CSV, but they are not useful outcomes.
# - nclocPerLineOfCode is ncloc / ncloc = 1 whenever ncloc > 0.
# - coveragePerLineOfCode is not an interpretable quality metric; in this dataset it is constant/non-informative.
DEFAULT_EXCLUDED_OUTCOMES: tuple[str, ...] = (
    "nclocPerLineOfCode",
    "coveragePerLineOfCode",
)

HIGHER_IS_BETTER: tuple[str, ...] = (
    "coverage",
)


@dataclass(frozen=True)
class AnalysisConfig:
    csv_path: Path
    out_dir: Path
    role_base: str = "pr_base"
    role_closed: str = "pr_closed"
    min_pairs_for_tests: int = 10
    min_rows_for_model: int = 50
    include_raw_metrics: bool = False
    include_normalized_metrics: bool = True
    write_excel: bool = True
    make_plots: bool = True


# =============================================================================
# Basic helpers
# =============================================================================

def ensure_dirs(out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "tables").mkdir(parents=True, exist_ok=True)
    (out_dir / "models").mkdir(parents=True, exist_ok=True)
    (out_dir / "plots").mkdir(parents=True, exist_ok=True)


def safe_filename(name: str) -> str:
    return (
        str(name)
        .replace("/", "_")
        .replace("\\", "_")
        .replace(" ", "_")
        .replace("%", "pct")
        .replace(":", "_")
        .replace("#", "_")
    )


def first_non_null(s: pd.Series) -> Any:
    s2 = s.dropna()
    return s2.iloc[0] if len(s2) else np.nan


def unique_join(s: pd.Series) -> str:
    values = sorted({str(x) for x in s.dropna().astype(str) if str(x).strip()})
    return ", ".join(values) if values else ""


def to_bool(series: pd.Series) -> pd.Series:
    if series.dtype == bool:
        return series
    return series.astype(str).str.strip().str.lower().map(
        {
            "true": True,
            "1": True,
            "yes": True,
            "y": True,
            "false": False,
            "0": False,
            "no": False,
            "n": False,
            "nan": np.nan,
            "none": np.nan,
            "": np.nan,
        }
    )


def get_numeric_column(df: pd.DataFrame, column: str) -> pd.Series:
    """Return a numeric Series even if duplicate labels accidentally exist."""
    obj = df[column]
    if isinstance(obj, pd.DataFrame):
        obj = obj.iloc[:, 0]
    return pd.to_numeric(obj, errors="coerce")


def add_repository_slug(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if "repositoryUrl" in df.columns:
        df["repository_slug"] = (
            df["repositoryUrl"]
            .astype(str)
            .str.replace("https://github.com/", "", regex=False)
            .str.strip("/")
        )
    elif {"username", "repositoryName"}.issubset(df.columns):
        df["repository_slug"] = df["username"].astype(str) + "/" + df["repositoryName"].astype(str)
    elif "repositoryName" in df.columns:
        df["repository_slug"] = df["repositoryName"].astype(str)
    else:
        raise ValueError("Cannot create repository_slug. Need repositoryUrl or username/repositoryName.")
    return df


def add_pr_uid(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if not {"repository_slug", "pullRequestNumber"}.issubset(df.columns):
        raise ValueError("Need repository_slug and pullRequestNumber to identify PRs.")
    df["pr_uid"] = df["repository_slug"].astype(str) + "#" + df["pullRequestNumber"].astype(str)
    return df


def improvement_direction(metric: str, delta: pd.Series) -> pd.Series:
    if metric in set(HIGHER_IS_BETTER):
        return delta > 0
    return delta < 0


def apply_fdr_bh(p_values: pd.Series) -> pd.Series:
    """Benjamini-Hochberg adjusted p-values without extra dependencies."""
    p = pd.to_numeric(p_values, errors="coerce")
    out = pd.Series(np.nan, index=p.index, dtype="float64")
    valid = p.dropna()
    if valid.empty:
        return out
    order = valid.sort_values().index
    ranked = valid.loc[order]
    m = len(ranked)
    adjusted = ranked * m / np.arange(1, m + 1)
    adjusted = adjusted.iloc[::-1].cummin().iloc[::-1].clip(upper=1.0)
    out.loc[order] = adjusted.values
    return out


# =============================================================================
# Load and prepare data
# =============================================================================

def choose_outcomes(df: pd.DataFrame, cfg: AnalysisConfig) -> list[str]:
    outcomes: list[str] = []

    if cfg.include_normalized_metrics:
        outcomes.extend([m for m in NORMALIZED_METRICS if m in df.columns])

    if cfg.include_raw_metrics:
        outcomes.extend([m for m in RAW_METRICS if m in df.columns])

    # Drop explicitly excluded columns if they appear.
    outcomes = [m for m in outcomes if m not in set(DEFAULT_EXCLUDED_OUTCOMES)]

    # Preserve order and remove duplicates.
    outcomes = list(dict.fromkeys(outcomes))
    return outcomes


def load_and_clean(cfg: AnalysisConfig) -> tuple[pd.DataFrame, list[str], pd.DataFrame]:
    df = pd.read_csv(cfg.csv_path, low_memory=False)
    df.columns = [str(c).strip() for c in df.columns]

    diagnostics_rows: list[dict[str, Any]] = []
    diagnostics_rows.append({"item": "raw_rows", "value": len(df)})
    diagnostics_rows.append({"item": "raw_columns", "value": len(df.columns)})

    required = {"analysisRole", "pullRequestNumber"}
    missing_required = sorted(required - set(df.columns))
    if missing_required:
        raise ValueError(f"Missing required columns: {missing_required}")

    df = add_repository_slug(df)
    df = add_pr_uid(df)

    if "deleted" in df.columns:
        deleted_bool = to_bool(df["deleted"])
        before = len(df)
        df = df[~deleted_bool.fillna(False)].copy()
        diagnostics_rows.append({"item": "deleted_rows_removed", "value": before - len(df)})

    df = df[df["analysisRole"].isin([cfg.role_base, cfg.role_closed])].copy()
    diagnostics_rows.append({"item": "rows_after_role_filter", "value": len(df)})
    diagnostics_rows.append({"item": "repositories", "value": df["repository_slug"].nunique()})
    diagnostics_rows.append({"item": "unique_prs", "value": df["pr_uid"].nunique()})
    diagnostics_rows.append({"item": "base_rows", "value": int((df["analysisRole"] == cfg.role_base).sum())})
    diagnostics_rows.append({"item": "closed_rows", "value": int((df["analysisRole"] == cfg.role_closed).sum())})

    if "pullRequestMerged" in df.columns:
        df["pullRequestMerged_bool"] = to_bool(df["pullRequestMerged"])
        df["pullRequestMerged_num"] = df["pullRequestMerged_bool"].astype("float")
    else:
        df["pullRequestMerged_num"] = np.nan

    if "qualityGateStatus" in df.columns:
        df["quality_gate_ok"] = (df["qualityGateStatus"].astype(str).str.upper() == "OK").astype(int)

    outcomes = choose_outcomes(df, cfg)
    if not outcomes:
        raise ValueError("No analyzable outcome metrics were found in the CSV.")

    numeric_cols = list(dict.fromkeys(outcomes + ["ncloc"]))
    for c in numeric_cols:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce")

    # Drop outcomes with no variation or insufficient observations early.
    usable_outcomes: list[str] = []
    outcome_diag: list[dict[str, Any]] = []
    for m in outcomes:
        s = pd.to_numeric(df[m], errors="coerce")
        non_missing = int(s.notna().sum())
        unique = int(s.nunique(dropna=True))
        missing_pct = float(s.isna().mean() * 100)
        is_constant = unique <= 1
        outcome_diag.append(
            {
                "metric": m,
                "non_missing_rows": non_missing,
                "missing_pct": missing_pct,
                "unique_values": unique,
                "min": s.min(skipna=True),
                "max": s.max(skipna=True),
                "excluded_reason": "constant_or_single_value" if is_constant else "",
            }
        )
        if not is_constant and non_missing >= cfg.min_rows_for_model:
            usable_outcomes.append(m)

    outcome_diagnostics = pd.DataFrame(outcome_diag)
    diagnostics = pd.DataFrame(diagnostics_rows)

    return df, usable_outcomes, diagnostics.merge(
        pd.DataFrame({"item": ["usable_outcome_metrics"], "value": [len(usable_outcomes)]}),
        how="outer",
    ), outcome_diagnostics


# =============================================================================
# Collapse duplicates and build paired dataset
# =============================================================================

def collapse_pr_role_rows(df: pd.DataFrame, outcomes: list[str]) -> pd.DataFrame:
    group_cols = ["pr_uid", "analysisRole"]

    numeric_candidates = list(dict.fromkeys(outcomes + ["ncloc", "pullRequestMerged_num", "quality_gate_ok"]))
    numeric_cols = [c for c in numeric_candidates if c in df.columns]

    metadata_candidates = [
        "repository_slug",
        "repositoryName",
        "repositoryUrl",
        "username",
        "pullRequestNumber",
        "pullRequestTitle",
        "pullRequestUrl",
        "pullRequestState",
        "baseBranchName",
        "headBranchName",
        "Category",
        "qualityGateStatus",
    ]
    metadata_cols = [c for c in metadata_candidates if c in df.columns and c not in group_cols]

    agg: dict[str, Any] = {c: "median" for c in numeric_cols}
    for c in metadata_cols:
        agg[c] = unique_join if c == "Category" else first_non_null

    collapsed = df.groupby(group_cols, as_index=False).agg(agg)
    return collapsed


def create_paired_wide(collapsed: pd.DataFrame, outcomes: list[str], cfg: AnalysisConfig) -> tuple[pd.DataFrame, pd.DataFrame]:
    base = collapsed[collapsed["analysisRole"] == cfg.role_base].set_index("pr_uid")
    closed = collapsed[collapsed["analysisRole"] == cfg.role_closed].set_index("pr_uid")

    common_prs = base.index.intersection(closed.index)
    base = base.loc[common_prs].copy()
    closed = closed.loc[common_prs].copy()

    wide_parts: list[pd.DataFrame] = []

    metadata_cols = [
        "repository_slug",
        "repositoryName",
        "repositoryUrl",
        "username",
        "pullRequestNumber",
        "pullRequestTitle",
        "pullRequestUrl",
        "pullRequestState",
        "baseBranchName",
        "headBranchName",
        "Category",
        "pullRequestMerged_num",
    ]
    metadata_cols = [c for c in metadata_cols if c in base.columns]
    meta = base[metadata_cols].copy()
    wide_parts.append(meta)

    if "quality_gate_ok" in base.columns and "quality_gate_ok" in closed.columns:
        qg = pd.DataFrame(index=common_prs)
        qg["quality_gate_ok_base"] = base["quality_gate_ok"]
        qg["quality_gate_ok_closed"] = closed["quality_gate_ok"]
        qg["quality_gate_delta"] = qg["quality_gate_ok_closed"] - qg["quality_gate_ok_base"]
        wide_parts.append(qg)

    for m in outcomes:
        if m not in base.columns or m not in closed.columns:
            continue
        b = pd.to_numeric(base[m], errors="coerce")
        c = pd.to_numeric(closed[m], errors="coerce")
        delta = c - b
        block = pd.DataFrame(index=common_prs)
        block[f"{m}_base"] = b
        block[f"{m}_closed"] = c
        block[f"{m}_delta"] = delta
        block[f"{m}_abs_delta"] = delta.abs()
        block[f"{m}_pct_delta"] = np.where(b.replace(0, np.nan).notna(), delta / b.replace(0, np.nan) * 100, np.nan)
        block[f"{m}_improved"] = improvement_direction(m, delta).astype("float")
        wide_parts.append(block)

    wide = pd.concat(wide_parts, axis=1).reset_index().rename(columns={"index": "pr_uid"})

    pair_rows: list[dict[str, Any]] = []
    for m in outcomes:
        b = f"{m}_base"
        c = f"{m}_closed"
        d = f"{m}_delta"
        if b not in wide.columns or c not in wide.columns:
            continue
        pair_data = wide[[b, c, d]].dropna()
        pair_rows.append(
            {
                "metric": m,
                "complete_pairs": len(pair_data),
                "base_non_missing": int(wide[b].notna().sum()),
                "closed_non_missing": int(wide[c].notna().sum()),
                "delta_mean": pair_data[d].mean() if len(pair_data) else np.nan,
                "delta_median": pair_data[d].median() if len(pair_data) else np.nan,
                "delta_std": pair_data[d].std() if len(pair_data) else np.nan,
                "delta_unique_values": int(pair_data[d].nunique(dropna=True)) if len(pair_data) else 0,
                "improved_pct": float((pair_data[d] < 0).mean() * 100) if len(pair_data) and m not in HIGHER_IS_BETTER else float((pair_data[d] > 0).mean() * 100) if len(pair_data) else np.nan,
            }
        )
    pair_counts = pd.DataFrame(pair_rows).sort_values("complete_pairs", ascending=False)
    return wide, pair_counts


# =============================================================================
# Descriptive paired tests
# =============================================================================

def paired_tests(wide: pd.DataFrame, outcomes: list[str], cfg: AnalysisConfig) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    for m in outcomes:
        b = f"{m}_base"
        c = f"{m}_closed"
        d = f"{m}_delta"
        if not {b, c, d}.issubset(wide.columns):
            continue
        data = wide[[b, c, d]].dropna()
        n = len(data)
        if n < cfg.min_pairs_for_tests:
            rows.append({"metric": m, "n_pairs": n, "status": "skipped_too_few_pairs"})
            continue
        delta = data[d]
        row: dict[str, Any] = {
            "metric": m,
            "n_pairs": n,
            "base_mean": data[b].mean(),
            "closed_mean": data[c].mean(),
            "delta_mean": delta.mean(),
            "delta_median": delta.median(),
            "delta_std": delta.std(ddof=1),
            "improved_n": int(improvement_direction(m, delta).sum()),
            "improved_pct": float(improvement_direction(m, delta).mean() * 100),
            "status": "ok",
        }

        if delta.nunique(dropna=True) <= 1:
            row.update(
                {
                    "paired_t_p": np.nan,
                    "wilcoxon_p": np.nan,
                    "cohens_dz": np.nan,
                    "normality_shapiro_p": np.nan,
                    "normality_label": "constant_delta",
                }
            )
        else:
            t_res = stats.ttest_rel(data[c], data[b], nan_policy="omit")
            row["paired_t_stat"] = float(t_res.statistic)
            row["paired_t_p"] = float(t_res.pvalue)

            try:
                w_res = stats.wilcoxon(data[c], data[b], zero_method="wilcox", alternative="two-sided")
                row["wilcoxon_stat"] = float(w_res.statistic)
                row["wilcoxon_p"] = float(w_res.pvalue)
            except ValueError:
                row["wilcoxon_stat"] = np.nan
                row["wilcoxon_p"] = np.nan

            if 3 <= n <= 5000:
                try:
                    sh = stats.shapiro(delta.sample(n=min(n, 5000), random_state=42))
                    row["normality_shapiro_p"] = float(sh.pvalue)
                    row["normality_label"] = "approximately_normal" if sh.pvalue >= 0.05 else "non_normal"
                except Exception:
                    row["normality_shapiro_p"] = np.nan
                    row["normality_label"] = "not_tested"
            else:
                row["normality_shapiro_p"] = np.nan
                row["normality_label"] = "not_tested_large_n"

            sd = delta.std(ddof=1)
            row["cohens_dz"] = float(delta.mean() / sd) if sd and not np.isclose(sd, 0) else np.nan

        rows.append(row)

    result = pd.DataFrame(rows)
    if not result.empty and "paired_t_p" in result.columns:
        result["paired_t_p_fdr_bh"] = apply_fdr_bh(result["paired_t_p"])
    if not result.empty and "wilcoxon_p" in result.columns:
        result["wilcoxon_p_fdr_bh"] = apply_fdr_bh(result["wilcoxon_p"])
    return result


# =============================================================================
# Mixed-effects and correlated models
# =============================================================================

def transform_for_model(metric: str, values: pd.Series) -> pd.Series:
    """
    Keep normalized rates/densities on their native scale.
    For large non-negative raw counts, log1p stabilizes variance.
    """
    y = pd.to_numeric(values, errors="coerce")

    normalized_or_density = metric.endswith("PerLineOfCode") or metric in {
        "coverage",
        "duplicatedLinesDensity",
    }

    if normalized_or_density:
        return y

    if y.min(skipna=True) >= 0:
        return np.log1p(y)

    return y


def fit_mixedlm_with_fallback(formula: str, data: pd.DataFrame, group_col: str, summary_path: Path) -> tuple[str, Any, str]:
    """
    Fit MixedLM. If it fails, fit cluster-robust OLS fallback.
    Returns: model_type, fitted_result, warning_text
    """
    warning_text = ""

    try:
        with warnings.catch_warnings(record=True) as caught:
            warnings.simplefilter("always")
            model = smf.mixedlm(formula, data=data, groups=data[group_col], re_formula="1")
            result = model.fit(method="lbfgs", reml=False, maxiter=300, disp=False)
            warning_text = " | ".join(sorted({str(w.message) for w in caught}))

        with open(summary_path, "w", encoding="utf-8") as f:
            f.write(str(result.summary()))
            if warning_text:
                f.write("\n\nWarnings:\n")
                f.write(warning_text)

        return "MixedLM", result, warning_text

    except Exception as exc:
        warning_text = f"MixedLM failed: {type(exc).__name__}: {exc}. Used cluster-robust OLS fallback."
        ols = smf.ols(formula, data=data).fit(cov_type="cluster", cov_kwds={"groups": data[group_col]})
        with open(summary_path, "w", encoding="utf-8") as f:
            f.write(warning_text)
            f.write("\n\n")
            f.write(str(ols.summary()))
        return "OLS_cluster_fallback", ols, warning_text


def extract_term(result: Any, term: str) -> dict[str, float]:
    params = getattr(result, "params", pd.Series(dtype=float))
    bse = getattr(result, "bse", pd.Series(dtype=float))
    pvalues = getattr(result, "pvalues", pd.Series(dtype=float))
    conf = result.conf_int() if hasattr(result, "conf_int") else pd.DataFrame()

    out = {
        "coef": np.nan,
        "std_error": np.nan,
        "p_value": np.nan,
        "ci_low": np.nan,
        "ci_high": np.nan,
    }
    if term in params.index:
        out["coef"] = float(params.loc[term])
    if term in bse.index:
        out["std_error"] = float(bse.loc[term])
    if term in pvalues.index:
        out["p_value"] = float(pvalues.loc[term])
    if isinstance(conf, pd.DataFrame) and term in conf.index:
        out["ci_low"] = float(conf.loc[term].iloc[0])
        out["ci_high"] = float(conf.loc[term].iloc[1])
    return out


def run_delta_mixed_models(wide: pd.DataFrame, outcomes: list[str], cfg: AnalysisConfig) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []

    for m in outcomes:
        b = f"{m}_base"
        d = f"{m}_delta"
        if not {"repository_slug", b, d}.issubset(wide.columns):
            continue

        cols = ["repository_slug", b, d]
        if "ncloc_base" in wide.columns and b != "ncloc_base":
            cols.append("ncloc_base")
        if "pullRequestMerged_num" in wide.columns:
            cols.append("pullRequestMerged_num")
        cols = list(dict.fromkeys(cols))

        data = wide.loc[:, cols].copy()
        data["base_y"] = transform_for_model(m, get_numeric_column(data, b))

        # For raw non-negative counts, model log-difference.
        # For normalized rates/densities, model arithmetic difference.
        if not (m.endswith("PerLineOfCode") or m in {"coverage", "duplicatedLinesDensity"}):
            closed_col = f"{m}_closed"
            if closed_col in wide.columns:
                data["delta_y"] = transform_for_model(m, wide[closed_col]) - transform_for_model(m, wide[b])
            else:
                data["delta_y"] = get_numeric_column(data, d)
        else:
            data["delta_y"] = get_numeric_column(data, d)

        formula_terms = ["base_y"]
        if "ncloc_base" in data.columns and b != "ncloc_base":
            ncloc_s = get_numeric_column(data, "ncloc_base")
            data["log_ncloc_base"] = np.log1p(ncloc_s.clip(lower=0))
            formula_terms.append("log_ncloc_base")

        if "pullRequestMerged_num" in data.columns and data["pullRequestMerged_num"].notna().sum() >= cfg.min_rows_for_model:
            formula_terms.append("pullRequestMerged_num")

        data = data[["repository_slug", "delta_y"] + formula_terms].replace([np.inf, -np.inf], np.nan).dropna()
        data = data[data["repository_slug"].notna()].copy()

        n_rows = len(data)
        n_groups = data["repository_slug"].nunique()
        if n_rows < cfg.min_rows_for_model or n_groups < 2 or data["delta_y"].nunique(dropna=True) <= 1:
            rows.append(
                {
                    "metric": m,
                    "model": "delta_mixedlm",
                    "model_type": "skipped",
                    "n_rows": n_rows,
                    "n_repository_groups": n_groups,
                    "coef_base_y": np.nan,
                    "p_base_y": np.nan,
                    "status": "skipped_too_few_rows_or_constant_delta",
                }
            )
            continue

        formula = "delta_y ~ " + " + ".join(formula_terms)
        summary_path = cfg.out_dir / "models" / f"mixedlm_delta_{safe_filename(m)}.txt"
        model_type, result, warn = fit_mixedlm_with_fallback(formula, data, "repository_slug", summary_path)

        base_effect = extract_term(result, "base_y")
        size_effect = extract_term(result, "log_ncloc_base")
        merged_effect = extract_term(result, "pullRequestMerged_num")

        row = {
            "metric": m,
            "model": "delta_mixedlm_repository_random_intercept",
            "model_type": model_type,
            "n_rows": n_rows,
            "n_repository_groups": n_groups,
            "formula": formula,
            "delta_mean_model_sample": float(data["delta_y"].mean()),
            "delta_median_model_sample": float(data["delta_y"].median()),
            "coef_base_y": base_effect["coef"],
            "se_base_y": base_effect["std_error"],
            "p_base_y": base_effect["p_value"],
            "ci_low_base_y": base_effect["ci_low"],
            "ci_high_base_y": base_effect["ci_high"],
            "coef_log_ncloc_base": size_effect["coef"],
            "p_log_ncloc_base": size_effect["p_value"],
            "coef_pullRequestMerged_num": merged_effect["coef"],
            "p_pullRequestMerged_num": merged_effect["p_value"],
            "warnings_or_notes": warn,
            "status": "ok",
        }
        rows.append(row)

    result = pd.DataFrame(rows)
    if not result.empty and "p_base_y" in result.columns:
        result["p_base_y_fdr_bh"] = apply_fdr_bh(result["p_base_y"])
    return result


def prepare_long_data(collapsed: pd.DataFrame, metric: str, cfg: AnalysisConfig) -> pd.DataFrame:
    cols = ["pr_uid", "repository_slug", "analysisRole", metric]
    if "ncloc" in collapsed.columns and metric != "ncloc":
        cols.append("ncloc")
    if "pullRequestMerged_num" in collapsed.columns:
        cols.append("pullRequestMerged_num")
    cols = list(dict.fromkeys([c for c in cols if c in collapsed.columns]))

    data = collapsed.loc[:, cols].copy()
    data["phase_closed"] = (data["analysisRole"] == cfg.role_closed).astype(int)
    data["y"] = transform_for_model(metric, get_numeric_column(data, metric))

    formula_terms = ["phase_closed"]
    if "ncloc" in data.columns and metric != "ncloc":
        data["log_ncloc"] = np.log1p(get_numeric_column(data, "ncloc").clip(lower=0))
        formula_terms.append("log_ncloc")
    if "pullRequestMerged_num" in data.columns and data["pullRequestMerged_num"].notna().sum() >= cfg.min_rows_for_model:
        formula_terms.append("pullRequestMerged_num")

    keep = ["pr_uid", "repository_slug", "phase_closed", "y"] + formula_terms
    keep = list(dict.fromkeys([c for c in keep if c in data.columns]))
    data = data[keep].replace([np.inf, -np.inf], np.nan).dropna()
    return data


def run_phase_gee_models(collapsed: pd.DataFrame, outcomes: list[str], cfg: AnalysisConfig) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []

    for m in outcomes:
        if m not in collapsed.columns:
            continue
        data = prepare_long_data(collapsed, m, cfg)
        n_rows = len(data)
        n_prs = data["pr_uid"].nunique() if "pr_uid" in data.columns else 0

        if n_rows < cfg.min_rows_for_model or n_prs < cfg.min_rows_for_model or data["y"].nunique(dropna=True) <= 1:
            rows.append(
                {
                    "metric": m,
                    "model": "gee_phase_pr_cluster",
                    "n_rows": n_rows,
                    "n_pr_groups": n_prs,
                    "coef_phase_closed": np.nan,
                    "p_phase_closed": np.nan,
                    "status": "skipped_too_few_rows_or_constant_outcome",
                }
            )
            continue

        formula_terms = ["phase_closed"]
        if "log_ncloc" in data.columns:
            formula_terms.append("log_ncloc")
        if "pullRequestMerged_num" in data.columns:
            formula_terms.append("pullRequestMerged_num")
        formula = "y ~ " + " + ".join(formula_terms)

        try:
            with warnings.catch_warnings(record=True) as caught:
                warnings.simplefilter("always")
                model = smf.gee(
                    formula,
                    groups="pr_uid",
                    data=data,
                    family=sm.families.Gaussian(),
                    cov_struct=sm.cov_struct.Exchangeable(),
                )
                result = model.fit(maxiter=200)
                warn = " | ".join(sorted({str(w.message) for w in caught}))

            summary_path = cfg.out_dir / "models" / f"gee_phase_{safe_filename(m)}.txt"
            with open(summary_path, "w", encoding="utf-8") as f:
                f.write(str(result.summary()))
                if warn:
                    f.write("\n\nWarnings:\n")
                    f.write(warn)

            phase = extract_term(result, "phase_closed")
            rows.append(
                {
                    "metric": m,
                    "model": "gee_phase_pr_cluster",
                    "n_rows": n_rows,
                    "n_pr_groups": n_prs,
                    "formula": formula,
                    "coef_phase_closed": phase["coef"],
                    "se_phase_closed": phase["std_error"],
                    "p_phase_closed": phase["p_value"],
                    "ci_low_phase_closed": phase["ci_low"],
                    "ci_high_phase_closed": phase["ci_high"],
                    "warnings_or_notes": warn,
                    "status": "ok",
                }
            )
        except Exception as exc:
            rows.append(
                {
                    "metric": m,
                    "model": "gee_phase_pr_cluster",
                    "n_rows": n_rows,
                    "n_pr_groups": n_prs,
                    "coef_phase_closed": np.nan,
                    "p_phase_closed": np.nan,
                    "status": f"failed: {type(exc).__name__}: {exc}",
                }
            )

    result = pd.DataFrame(rows)
    if not result.empty and "p_phase_closed" in result.columns:
        result["p_phase_closed_fdr_bh"] = apply_fdr_bh(result["p_phase_closed"])
    return result


def run_quality_gate_gee(collapsed: pd.DataFrame, cfg: AnalysisConfig) -> pd.DataFrame:
    if "quality_gate_ok" not in collapsed.columns:
        return pd.DataFrame([{"model": "gee_quality_gate", "status": "skipped_no_quality_gate_column"}])

    cols = ["pr_uid", "analysisRole", "quality_gate_ok"]
    if "ncloc" in collapsed.columns:
        cols.append("ncloc")
    if "pullRequestMerged_num" in collapsed.columns:
        cols.append("pullRequestMerged_num")
    cols = list(dict.fromkeys(cols))

    data = collapsed.loc[:, cols].copy()
    data["phase_closed"] = (data["analysisRole"] == cfg.role_closed).astype(int)
    if "ncloc" in data.columns:
        data["log_ncloc"] = np.log1p(get_numeric_column(data, "ncloc").clip(lower=0))

    terms = ["phase_closed"]
    if "log_ncloc" in data.columns:
        terms.append("log_ncloc")
    if "pullRequestMerged_num" in data.columns:
        terms.append("pullRequestMerged_num")

    keep = ["pr_uid", "quality_gate_ok"] + terms
    data = data[keep].replace([np.inf, -np.inf], np.nan).dropna()

    if len(data) < cfg.min_rows_for_model or data["quality_gate_ok"].nunique() < 2:
        return pd.DataFrame(
            [
                {
                    "model": "gee_quality_gate_logistic",
                    "n_rows": len(data),
                    "status": "skipped_too_few_rows_or_single_class",
                }
            ]
        )

    formula = "quality_gate_ok ~ " + " + ".join(terms)
    try:
        model = smf.gee(
            formula,
            groups="pr_uid",
            data=data,
            family=sm.families.Binomial(),
            cov_struct=sm.cov_struct.Exchangeable(),
        )
        result = model.fit(maxiter=200)
        summary_path = cfg.out_dir / "models" / "gee_quality_gate_logistic.txt"
        with open(summary_path, "w", encoding="utf-8") as f:
            f.write(str(result.summary()))

        phase = extract_term(result, "phase_closed")
        coef = phase["coef"]
        return pd.DataFrame(
            [
                {
                    "model": "gee_quality_gate_logistic_pr_cluster",
                    "n_rows": len(data),
                    "n_pr_groups": data["pr_uid"].nunique(),
                    "formula": formula,
                    "coef_phase_closed_log_odds": coef,
                    "odds_ratio_phase_closed": math.exp(coef) if pd.notna(coef) else np.nan,
                    "p_phase_closed": phase["p_value"],
                    "ci_low_phase_closed": phase["ci_low"],
                    "ci_high_phase_closed": phase["ci_high"],
                    "status": "ok",
                }
            ]
        )
    except Exception as exc:
        return pd.DataFrame(
            [
                {
                    "model": "gee_quality_gate_logistic_pr_cluster",
                    "n_rows": len(data),
                    "status": f"failed: {type(exc).__name__}: {exc}",
                }
            ]
        )


# =============================================================================
# Plots and interpretation helpers
# =============================================================================

def make_plots(wide: pd.DataFrame, pair_counts: pd.DataFrame, outcomes: list[str], cfg: AnalysisConfig) -> None:
    if not cfg.make_plots:
        return

    plot_metrics = pair_counts[pair_counts["complete_pairs"] >= cfg.min_pairs_for_tests]["metric"].head(12).tolist()

    for m in plot_metrics:
        b = f"{m}_base"
        c = f"{m}_closed"
        d = f"{m}_delta"
        if not {b, c, d}.issubset(wide.columns):
            continue
        data = wide[[b, c, d]].dropna()
        if data.empty:
            continue

        plt.figure(figsize=(7, 4))
        plt.hist(data[d], bins=40)
        plt.title(f"Delta distribution: {m}\nclosed - base")
        plt.xlabel("Delta")
        plt.ylabel("PR count")
        plt.tight_layout()
        plt.savefig(cfg.out_dir / "plots" / f"delta_hist_{safe_filename(m)}.png", dpi=160)
        plt.close()

        plt.figure(figsize=(5, 5))
        sample = data.sample(n=min(len(data), 3000), random_state=42)
        plt.scatter(sample[b], sample[c], alpha=0.35, s=12)
        lo = np.nanmin([sample[b].min(), sample[c].min()])
        hi = np.nanmax([sample[b].max(), sample[c].max()])
        if np.isfinite(lo) and np.isfinite(hi):
            plt.plot([lo, hi], [lo, hi], linestyle="--")
        plt.title(f"Base vs closed: {m}")
        plt.xlabel("Base")
        plt.ylabel("Closed")
        plt.tight_layout()
        plt.savefig(cfg.out_dir / "plots" / f"base_vs_closed_{safe_filename(m)}.png", dpi=160)
        plt.close()

    # Compact boxplot for the top normalized metrics.
    normalized_top = [m for m in plot_metrics if m.endswith("PerLineOfCode")][:10]
    if normalized_top:
        data_for_box = []
        labels = []
        for m in normalized_top:
            d = f"{m}_delta"
            vals = wide[d].dropna() if d in wide.columns else pd.Series(dtype=float)
            if len(vals) >= cfg.min_pairs_for_tests and vals.nunique() > 1:
                data_for_box.append(vals)
                labels.append(m.replace("PerLineOfCode", "/LOC"))
        if data_for_box:
            plt.figure(figsize=(12, 5))
            plt.boxplot(data_for_box, tick_labels=labels, showfliers=False)
            plt.xticks(rotation=40, ha="right")
            plt.title("Delta distributions for normalized metrics")
            plt.ylabel("Closed - base")
            plt.tight_layout()
            plt.savefig(cfg.out_dir / "plots" / "normalized_metric_delta_boxplots.png", dpi=160)
            plt.close()


def create_interpretation_guide(cfg: AnalysisConfig) -> None:
    text = """
Interpretation guide
====================

1. paired_tests.csv
-------------------
Use this table to describe simple before/after differences between pr_base and pr_closed.

Important columns:
- delta_mean: average closed - base difference.
- improved_pct: percentage of PRs that improved for that metric.
- paired_t_p_fdr_bh and wilcoxon_p_fdr_bh: multiple-testing-corrected p-values.

For most SonarQube issue metrics, negative delta means improvement.
For coverage, positive delta means improvement.

2. mixedlm_delta_effects.csv
----------------------------
This is the main mixed-effects analysis.

Model:
    delta_metric ~ baseline_metric + log(ncloc_base + 1) + merged_status + (1 | repository)

Meaning:
- The outcome is the PR-level change from first to last commit.
- The random intercept allows each repository to have its own baseline tendency for metric change.
- This is appropriate because PRs are not independent across repositories.

Important columns:
- delta_mean_model_sample: average modeled change.
- coef_base_y: association between the baseline value and the later change.
- p_base_y_fdr_bh: corrected p-value for the baseline effect.
- model_type: MixedLM if the mixed model succeeded; OLS_cluster_fallback if MixedLM failed and a cluster-robust fallback was used.

How to use in the thesis:
- If delta_mean_model_sample is negative for issue/rate metrics, the metric generally improves by PR closure.
- If the repository random-effect model is singular, that usually means repository-level variance is near zero for that metric. This is not necessarily bad; it means repositories may not differ strongly after controls.

3. gee_phase_effects.csv
------------------------
This is a supporting repeated-measures analysis clustered by PR.

Model:
    metric ~ phase_closed + log(ncloc + 1) + merged_status

Important column:
- coef_phase_closed: estimated average difference between pr_closed and pr_base.

For normalized metrics:
- Negative coef_phase_closed means fewer issues per line of code at PR closure.
- Positive coef_phase_closed means more issues per line of code at PR closure.

4. gee_quality_gate.csv
-----------------------
This analyzes whether the probability of Quality Gate OK changes at PR closure.

Important columns:
- coef_phase_closed_log_odds
- odds_ratio_phase_closed

If odds_ratio_phase_closed > 1, pr_closed is associated with higher odds of Quality Gate OK.
If odds_ratio_phase_closed < 1, pr_closed is associated with lower odds of Quality Gate OK.

5. Important note about the normalized CSV
------------------------------------------
The script excludes these outcomes by default:
- nclocPerLineOfCode
- coveragePerLineOfCode

Reason:
- nclocPerLineOfCode is mathematically constant when ncloc > 0.
- coveragePerLineOfCode is not an interpretable coverage metric and is constant/non-informative in this dataset.

Use raw coverage instead if coverage has variation. If coverage is constant, the script skips it automatically.
""".strip()

    with open(cfg.out_dir / "README_INTERPRETATION.txt", "w", encoding="utf-8") as f:
        f.write(text)


# =============================================================================
# Main pipeline
# =============================================================================

def save_table(df: pd.DataFrame, path: Path) -> None:
    df.to_csv(path, index=False)


def main(cfg: AnalysisConfig) -> None:
    ensure_dirs(cfg.out_dir)

    print("Loading and validating normalized CSV...")
    raw, outcomes, dataset_diagnostics, outcome_diagnostics = load_and_clean(cfg)

    print(f"Usable outcome metrics: {len(outcomes)}")
    print("Collapsing duplicate PR-role rows...")
    collapsed = collapse_pr_role_rows(raw, outcomes)

    print("Creating paired PR dataset...")
    wide, pair_counts = create_paired_wide(collapsed, outcomes, cfg)

    print("Running paired tests...")
    paired = paired_tests(wide, outcomes, cfg)

    print("Running delta mixed-effects models...")
    mixed_delta = run_delta_mixed_models(wide, outcomes, cfg)

    print("Running supporting GEE phase models...")
    gee_phase = run_phase_gee_models(collapsed, outcomes, cfg)

    print("Running quality gate GEE model...")
    gee_quality = run_quality_gate_gee(collapsed, cfg)

    print("Saving outputs...")
    save_table(dataset_diagnostics, cfg.out_dir / "tables" / "dataset_diagnostics.csv")
    save_table(outcome_diagnostics, cfg.out_dir / "tables" / "outcome_diagnostics.csv")
    save_table(collapsed, cfg.out_dir / "tables" / "collapsed_pr_role.csv")
    save_table(wide, cfg.out_dir / "tables" / "paired_pr_deltas_wide.csv")
    save_table(pair_counts, cfg.out_dir / "tables" / "outcome_pair_counts.csv")
    save_table(paired, cfg.out_dir / "tables" / "paired_tests.csv")
    save_table(mixed_delta, cfg.out_dir / "models" / "mixedlm_delta_effects.csv")
    save_table(gee_phase, cfg.out_dir / "models" / "gee_phase_effects.csv")
    save_table(gee_quality, cfg.out_dir / "models" / "gee_quality_gate.csv")

    if cfg.write_excel:
        excel_path = cfg.out_dir / "sonarqube_normalized_mixed_effects_results.xlsx"
        with pd.ExcelWriter(excel_path, engine="openpyxl") as writer:
            dataset_diagnostics.to_excel(writer, sheet_name="dataset_diagnostics", index=False)
            outcome_diagnostics.to_excel(writer, sheet_name="outcome_diagnostics", index=False)
            pair_counts.to_excel(writer, sheet_name="outcome_pair_counts", index=False)
            paired.to_excel(writer, sheet_name="paired_tests", index=False)
            mixed_delta.to_excel(writer, sheet_name="mixedlm_delta", index=False)
            gee_phase.to_excel(writer, sheet_name="gee_phase", index=False)
            gee_quality.to_excel(writer, sheet_name="quality_gate", index=False)

    print("Creating plots...")
    make_plots(wide, pair_counts, outcomes, cfg)
    create_interpretation_guide(cfg)

    print("Done.")
    print(f"Outputs written to: {cfg.out_dir}")
    print("Main files:")
    print(f"- {cfg.out_dir / 'tables' / 'paired_tests.csv'}")
    print(f"- {cfg.out_dir / 'models' / 'mixedlm_delta_effects.csv'}")
    print(f"- {cfg.out_dir / 'models' / 'gee_phase_effects.csv'}")
    print(f"- {cfg.out_dir / 'README_INTERPRETATION.txt'}")


def build_config_from_code() -> AnalysisConfig:
    """Build the analysis configuration from the USER CONFIGURATION constants above."""
    return AnalysisConfig(
        csv_path=INPUT_CSV_PATH,
        out_dir=OUTPUT_DIR,
        include_raw_metrics=INCLUDE_RAW_METRICS,
        include_normalized_metrics=INCLUDE_NORMALIZED_METRICS,
        write_excel=WRITE_EXCEL,
        make_plots=MAKE_PLOTS,
        min_pairs_for_tests=MIN_PAIRS_FOR_TESTS,
        min_rows_for_model=MIN_ROWS_FOR_MODEL,
    )


if __name__ == "__main__":
    cfg = build_config_from_code()
    print("Configured input CSV:", cfg.csv_path)
    print("Configured output directory:", cfg.out_dir)

    if not cfg.csv_path.exists():
        raise FileNotFoundError(
            f"Input CSV was not found: {cfg.csv_path}\n"
            "Edit INPUT_CSV_PATH in the USER CONFIGURATION section of this script. "
            "In Google Colab, uploaded files are usually under /content/."
        )

    main(cfg)
