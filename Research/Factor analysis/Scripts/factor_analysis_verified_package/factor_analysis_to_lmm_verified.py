"""
Verified EFA -> OLS -> Linear Mixed-Effects Model pipeline
==========================================================

Designed for the SonarQube Pull Request dataset used in the thesis.

Core idea
---------
1. Clean the dataset and keep one final snapshot (pr_closed) per valid PR.
2. Build normalized SonarQube indicators.
3. Test whether Exploratory Factor Analysis (EFA) is appropriate.
4. Select the number of factors with Parallel Analysis.
5. Fit maximum-likelihood Factor Analysis with Varimax rotation.
6. Calculate factor scores for every PR.
7. For each factor score, compare:
       - pooled OLS (baseline)
       - OLS with cluster-robust inference by project
       - LMM with random intercept by project
8. Use ML LMM for AIC/BIC/log-likelihood comparisons.
9. Use REML LMM for the final coefficient/variance report.
10. Run a sensitivity analysis restricted to projects with >= 5 PRs.
11. Run an optional alternative size-adjusted EFA sensitivity analysis.

IMPORTANT INTERPRETATION
------------------------
Factor Analysis and LMM are not competing models. EFA extracts latent dimensions;
LMM then models those factor scores while accounting for PRs being nested in projects.
The meaningful model-fit comparison is OLS vs LMM on the SAME factor score.

IMPORTANT LIMITATION
--------------------
This is a two-stage EFA -> regression workflow. Factor scores are estimated and are
then treated as observed outcomes in the LMM. Their measurement uncertainty is not
propagated into the LMM standard errors. A multilevel SEM / latent-variable model
would be required to model both stages simultaneously.

Dependencies
------------
pip install pandas numpy scipy scikit-learn statsmodels matplotlib

Run
---
python factor_analysis_to_lmm_verified.py
"""

from __future__ import annotations

import json
import platform
import warnings
from pathlib import Path
from typing import Any

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import scipy
from scipy.stats import chi2, normaltest
import sklearn
from sklearn.decomposition import FactorAnalysis
from sklearn.preprocessing import StandardScaler
import statsmodels
import statsmodels.formula.api as smf

warnings.filterwarnings("ignore")


# =============================================================================
# CONFIGURATION
# =============================================================================

CSV_PATH = Path("results_to_be_analyzed.csv")
OUT_DIR = Path("factor_analysis_output_verified")

RANDOM_STATE = 42
PARALLEL_ANALYSIS_ITERATIONS = 1000
PARALLEL_ANALYSIS_PERCENTILE = 95

# Interpretation thresholds. These are heuristics, not hard scientific laws.
SALIENT_LOADING_THRESHOLD = 0.40
STRONG_LOADING_THRESHOLD = 0.50
LOW_COMMUNALITY_THRESHOLD = 0.30
CROSS_LOADING_THRESHOLD = 0.32

# A factor supported by fewer than 3 salient indicators is flagged as fragile.
MIN_SALIENT_INDICATORS_FOR_STABLE_FACTOR = 3

# Main EFA uses per-KLOC indicators to preserve continuity with the thesis density
# analysis. An additional size-adjusted EFA sensitivity analysis is recommended
# because multiple per-KLOC indicators share the same denominator.
RUN_SIZE_ADJUSTED_EFA_SENSITIVITY = True

# LMM sensitivity analysis.
MIN_PRS_PER_PROJECT_SENSITIVITY = 5

OUT_DIR.mkdir(parents=True, exist_ok=True)


# =============================================================================
# REPORTING
# =============================================================================

report_lines: list[str] = []


def log(message: str = "") -> None:
    print(message)
    report_lines.append(str(message))


def save_versions() -> None:
    versions = {
        "python": platform.python_version(),
        "pandas": pd.__version__,
        "numpy": np.__version__,
        "scipy": scipy.__version__,
        "scikit_learn": sklearn.__version__,
        "statsmodels": statsmodels.__version__,
        "matplotlib": matplotlib.__version__,
        "random_state": RANDOM_STATE,
        "parallel_analysis_iterations": PARALLEL_ANALYSIS_ITERATIONS,
    }
    with open(OUT_DIR / "software_versions.json", "w", encoding="utf-8") as f:
        json.dump(versions, f, indent=2)

    log("Software / reproducibility information:")
    for key, value in versions.items():
        log(f"  {key}: {value}")


# =============================================================================
# DATA PREPARATION
# =============================================================================


def bucket_category(category: object) -> str | float:
    if pd.isna(category):
        return np.nan

    value = str(category).lower()
    has_quality = "quality" in value
    has_security = "security" in value

    if has_quality and has_security:
        return "both"
    if has_quality:
        return "quality"
    if has_security:
        return "security"
    return np.nan


def prepare_dataset(csv_path: Path) -> pd.DataFrame:
    log("=" * 100)
    log("1. LOAD AND CLEAN DATA")
    log("=" * 100)

    if not csv_path.exists():
        raise FileNotFoundError(
            f"CSV not found: {csv_path.resolve()}\n"
            "Set CSV_PATH at the top of the script to the correct file."
        )

    df = pd.read_csv(csv_path)

    required_columns = {
        "repositoryName",
        "pullRequestNumber",
        "analysisRole",
        "Category",
        "ncloc",
        "complexity",
        "cognitiveComplexity",
        "securityHotspots",
        "duplicatedLinesDensity",
        "softwareQualityReliabilityIssues",
        "softwareQualityMaintainabilityIssues",
        "softwareQualitySecurityIssues",
    }

    missing = sorted(required_columns.difference(df.columns))
    if missing:
        raise ValueError(
            "CSV is missing required columns:\n  - " + "\n  - ".join(missing)
        )

    log(f"Original rows: {len(df):,}")
    log(f"Original projects: {df['repositoryName'].nunique():,}")
    log(f"Original unique PRs: {df[['repositoryName', 'pullRequestNumber']].drop_duplicates().shape[0]:,}")

    df["pr_key"] = (
        df["repositoryName"].astype(str)
        + "#"
        + df["pullRequestNumber"].astype(str)
    )

    # Strict pair validation: exactly one base and exactly one closed row.
    role_lists = df.groupby("pr_key")["analysisRole"].agg(list)
    valid_pr_keys = role_lists[
        role_lists.apply(
            lambda roles: (
                len(roles) == 2
                and roles.count("pr_base") == 1
                and roles.count("pr_closed") == 1
            )
        )
    ].index

    log(f"Valid base/closed PR pairs: {len(valid_pr_keys):,}")

    paired = df[df["pr_key"].isin(valid_pr_keys)].copy()
    snap = paired[paired["analysisRole"] == "pr_closed"].copy()

    if snap["pr_key"].duplicated().any():
        raise RuntimeError("Duplicate pr_closed rows remain after strict pair validation.")

    log(f"Closed snapshots before ncloc filter: {len(snap):,}")

    # Required for rates/densities.
    snap = snap[snap["ncloc"] > 0].copy()
    log(f"After ncloc > 0: {len(snap):,}")

    snap["category_bucket"] = snap["Category"].apply(bucket_category)
    before_category = len(snap)
    snap = snap.dropna(subset=["category_bucket"]).copy()
    log(f"Dropped unsupported/missing categories: {before_category - len(snap):,}")

    snap["project"] = snap["repositoryName"].astype("category")
    snap["log_ncloc"] = np.log1p(snap["ncloc"].astype(float))

    # Defensive finite-value check on core variables.
    core_numeric = [
        "ncloc",
        "complexity",
        "cognitiveComplexity",
        "securityHotspots",
        "duplicatedLinesDensity",
        "softwareQualityReliabilityIssues",
        "softwareQualityMaintainabilityIssues",
        "softwareQualitySecurityIssues",
    ]
    for col in core_numeric:
        values = pd.to_numeric(snap[col], errors="coerce")
        if (~np.isfinite(values)).any():
            raise ValueError(f"Non-finite values found in required column: {col}")
        if (values < 0).any():
            raise ValueError(f"Negative values found in non-negative metric: {col}")

    project_sizes = snap.groupby("repositoryName").size()
    snap["n_prs_in_project"] = snap["repositoryName"].map(project_sizes)

    log(
        f"Final sample: {len(snap):,} PRs in "
        f"{snap['repositoryName'].nunique():,} projects"
    )
    log(
        "PRs/project: "
        f"median={project_sizes.median():.0f}, "
        f"min={project_sizes.min()}, max={project_sizes.max()}"
    )
    log("Category distribution:")
    log(snap["category_bucket"].value_counts().to_string())

    return snap


# =============================================================================
# INDICATORS
# =============================================================================


def build_per_kloc_indicators(snap: pd.DataFrame) -> pd.DataFrame:
    """Primary EFA indicators, expressed as rates/densities."""
    kloc = snap["ncloc"].astype(float) / 1000.0

    indicators = pd.DataFrame(index=snap.index)
    indicators["reliability_issues_per_kloc"] = (
        snap["softwareQualityReliabilityIssues"].astype(float) / kloc
    )
    indicators["maintainability_issues_per_kloc"] = (
        snap["softwareQualityMaintainabilityIssues"].astype(float) / kloc
    )
    indicators["security_issues_per_kloc"] = (
        snap["softwareQualitySecurityIssues"].astype(float) / kloc
    )
    indicators["security_hotspots_per_kloc"] = (
        snap["securityHotspots"].astype(float) / kloc
    )
    indicators["complexity_per_kloc"] = snap["complexity"].astype(float) / kloc
    indicators["cognitive_complexity_per_kloc"] = (
        snap["cognitiveComplexity"].astype(float) / kloc
    )
    indicators["duplicated_lines_density"] = snap["duplicatedLinesDensity"].astype(float)

    return clean_indicator_frame(indicators, "per_kloc")


def build_size_adjusted_indicators(snap: pd.DataFrame) -> pd.DataFrame:
    """
    Sensitivity EFA that avoids a shared KLOC denominator.

    For each raw metric:
        log1p(metric) = a + b * log1p(ncloc) + residual

    The residual is the size-adjusted indicator used in EFA.
    This asks whether the factor structure remains similar after removing the
    linear association with codebase size before factor extraction.
    """
    source_columns = [
        "softwareQualityReliabilityIssues",
        "softwareQualityMaintainabilityIssues",
        "softwareQualitySecurityIssues",
        "securityHotspots",
        "complexity",
        "cognitiveComplexity",
        "duplicatedLinesDensity",
    ]

    log_size = np.log1p(snap["ncloc"].astype(float).to_numpy())
    design = np.column_stack([np.ones(len(snap)), log_size])

    adjusted = pd.DataFrame(index=snap.index)

    for column in source_columns:
        y = np.log1p(snap[column].astype(float).to_numpy())
        beta, *_ = np.linalg.lstsq(design, y, rcond=None)
        residual = y - design @ beta
        adjusted[f"{column}_size_adjusted"] = residual

    return clean_indicator_frame(adjusted, "size_adjusted")


def clean_indicator_frame(indicators: pd.DataFrame, label: str) -> pd.DataFrame:
    indicators = indicators.replace([np.inf, -np.inf], np.nan)

    all_missing = indicators.columns[indicators.isna().all()].tolist()
    zero_variance = indicators.columns[
        indicators.nunique(dropna=True) <= 1
    ].tolist()
    drop_columns = sorted(set(all_missing + zero_variance))

    if drop_columns:
        log(f"[{label}] Dropping unusable indicators: {drop_columns}")
        indicators = indicators.drop(columns=drop_columns)

    if indicators.shape[1] < 3:
        raise ValueError(f"[{label}] Fewer than 3 usable EFA indicators remain.")

    missing_counts = indicators.isna().sum()
    if missing_counts.sum() > 0:
        log(f"[{label}] Missing values found; median imputation will be used:")
        log(missing_counts[missing_counts > 0].to_string())
        indicators = indicators.fillna(indicators.median(numeric_only=True))

    if not np.isfinite(indicators.to_numpy(dtype=float)).all():
        raise ValueError(f"[{label}] Non-finite values remain after cleaning.")

    return indicators


# =============================================================================
# FACTOR-ANALYSIS SUITABILITY TESTS
# =============================================================================


def kmo_test(z: np.ndarray) -> tuple[float, np.ndarray]:
    corr = np.corrcoef(z, rowvar=False)
    inv_corr = np.linalg.pinv(corr)

    diagonal = np.sqrt(np.outer(np.diag(inv_corr), np.diag(inv_corr)))
    partial = -inv_corr / diagonal
    np.fill_diagonal(partial, 1.0)

    corr_sq = corr ** 2
    partial_sq = partial ** 2
    np.fill_diagonal(corr_sq, 0.0)
    np.fill_diagonal(partial_sq, 0.0)

    denom_var = corr_sq.sum(axis=0) + partial_sq.sum(axis=0)
    denom_total = corr_sq.sum() + partial_sq.sum()

    if np.any(denom_var == 0) or denom_total == 0:
        raise ValueError("KMO cannot be calculated because the correlation structure is degenerate.")

    per_variable = corr_sq.sum(axis=0) / denom_var
    overall = corr_sq.sum() / denom_total
    return float(overall), per_variable


def bartlett_sphericity_test(z: np.ndarray) -> tuple[float, int, float]:
    n, p = z.shape
    corr = np.corrcoef(z, rowvar=False)

    sign, logdet = np.linalg.slogdet(corr)
    if sign <= 0:
        raise ValueError(
            "Correlation matrix is not positive definite; Bartlett's test is not reliable."
        )

    statistic = -(n - 1 - (2 * p + 5) / 6) * logdet
    df = p * (p - 1) // 2
    p_value = chi2.sf(statistic, df)
    return float(statistic), int(df), float(p_value)


# =============================================================================
# PARALLEL ANALYSIS
# =============================================================================


def parallel_analysis(
    z: np.ndarray,
    *,
    iterations: int = PARALLEL_ANALYSIS_ITERATIONS,
    percentile: float = PARALLEL_ANALYSIS_PERCENTILE,
    random_state: int = RANDOM_STATE,
) -> tuple[np.ndarray, np.ndarray, int]:
    rng = np.random.default_rng(random_state)

    observed = np.linalg.eigvalsh(np.corrcoef(z, rowvar=False))[::-1]
    random_eigs = np.empty((iterations, z.shape[1]), dtype=float)

    for i in range(iterations):
        random_data = rng.normal(size=z.shape)
        random_corr = np.corrcoef(random_data, rowvar=False)
        random_eigs[i] = np.linalg.eigvalsh(random_corr)[::-1]

    threshold = np.percentile(random_eigs, percentile, axis=0)
    n_factors = int(np.sum(observed > threshold))

    if n_factors < 1:
        raise RuntimeError(
            "Parallel Analysis retained zero factors. EFA should not be forced on these data."
        )

    return observed, threshold, n_factors


def save_scree_plot(
    observed: np.ndarray,
    threshold: np.ndarray,
    output_path: Path,
    title: str,
) -> None:
    x = np.arange(1, len(observed) + 1)
    fig, ax = plt.subplots(figsize=(9, 5))
    ax.plot(x, observed, marker="o", label="Observed eigenvalues")
    ax.plot(x, threshold, marker="o", label="Parallel-analysis 95th percentile")
    ax.axhline(1.0, linestyle="--", label="Eigenvalue = 1")
    ax.set_xlabel("Component / factor number")
    ax.set_ylabel("Eigenvalue")
    ax.set_title(title)
    ax.set_xticks(x)
    ax.legend()
    fig.tight_layout()
    fig.savefig(output_path, dpi=180)
    plt.close(fig)


# =============================================================================
# EFA
# =============================================================================


def orient_factor_signs(
    loadings: pd.DataFrame,
    scores: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Factor signs are mathematically arbitrary. For stable/readable output,
    orient every factor so its largest absolute loading is positive.
    """
    loadings = loadings.copy()
    scores = scores.copy()

    for factor in loadings.columns:
        anchor = loadings[factor].abs().idxmax()
        if loadings.loc[anchor, factor] < 0:
            loadings[factor] *= -1
            scores[factor] *= -1

    return loadings, scores


def diagnose_factor_solution(
    loadings: pd.DataFrame,
    communalities: pd.Series,
    label: str,
) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []

    for factor in loadings.columns:
        abs_load = loadings[factor].abs()
        salient = abs_load[abs_load >= SALIENT_LOADING_THRESHOLD]
        strong = abs_load[abs_load >= STRONG_LOADING_THRESHOLD]

        stable = len(salient) >= MIN_SALIENT_INDICATORS_FOR_STABLE_FACTOR
        rows.append(
            {
                "analysis": label,
                "factor": factor,
                "n_salient_loadings_ge_0_40": int(len(salient)),
                "n_strong_loadings_ge_0_50": int(len(strong)),
                "largest_abs_loading": float(abs_load.max()),
                "stable_by_3_indicator_rule": bool(stable),
                "warning": (
                    "" if stable else
                    "FRAGILE: fewer than 3 indicators have |loading| >= 0.40"
                ),
            }
        )

    diagnostics = pd.DataFrame(rows)

    low_communality = communalities[communalities < LOW_COMMUNALITY_THRESHOLD]
    if not low_communality.empty:
        log(f"[{label}] Variables with communality < {LOW_COMMUNALITY_THRESHOLD:.2f}:")
        log(low_communality.round(3).to_string())

    # Cross-loading diagnostic.
    cross_loading_counts = (loadings.abs() >= CROSS_LOADING_THRESHOLD).sum(axis=1)
    cross_loaded = cross_loading_counts[cross_loading_counts >= 2]
    if not cross_loaded.empty:
        log(f"[{label}] Potential cross-loading indicators (>=2 loadings |loading| >= {CROSS_LOADING_THRESHOLD:.2f}):")
        log(cross_loaded.to_string())

    for _, row in diagnostics.iterrows():
        if row["warning"]:
            log(f"[{label}] {row['factor']}: {row['warning']}")

    return diagnostics


def run_efa(
    indicators: pd.DataFrame,
    *,
    label: str,
    log_transform: bool,
) -> dict[str, Any]:
    log("\n" + "=" * 100)
    log(f"EFA: {label}")
    log("=" * 100)

    X = indicators.astype(float).copy()

    if log_transform:
        if (X < 0).any().any():
            raise ValueError(f"[{label}] log1p requested but negative indicator values exist.")
        X = np.log1p(X)

    scaler = StandardScaler()
    z = scaler.fit_transform(X)

    corr = pd.DataFrame(
        np.corrcoef(z, rowvar=False),
        index=indicators.columns,
        columns=indicators.columns,
    )
    corr.to_csv(OUT_DIR / f"{label}_correlation_matrix.csv")

    kmo_overall, kmo_per_var = kmo_test(z)
    bartlett_chi2, bartlett_df, bartlett_p = bartlett_sphericity_test(z)

    kmo_series = pd.Series(kmo_per_var, index=indicators.columns, name="KMO")
    kmo_series.to_csv(OUT_DIR / f"{label}_kmo_per_indicator.csv")

    suitability = pd.DataFrame(
        [
            {"test": "KMO_overall", "value": kmo_overall},
            {"test": "Bartlett_chi2", "value": bartlett_chi2},
            {"test": "Bartlett_df", "value": bartlett_df},
            {"test": "Bartlett_p", "value": bartlett_p},
        ]
    )
    suitability.to_csv(OUT_DIR / f"{label}_suitability_tests.csv", index=False)

    log(f"[{label}] KMO overall: {kmo_overall:.3f}")
    log(f"[{label}] Bartlett: chi2={bartlett_chi2:.3f}, df={bartlett_df}, p={bartlett_p:.6g}")

    if kmo_overall < 0.50:
        raise RuntimeError(
            f"[{label}] KMO={kmo_overall:.3f} < 0.50. Factor analysis is not defensible."
        )
    if bartlett_p >= 0.05:
        raise RuntimeError(
            f"[{label}] Bartlett p={bartlett_p:.4g} is not significant. Factor analysis is not defensible."
        )
    if kmo_overall < 0.60:
        log(f"[{label}] WARNING: KMO is below 0.60; interpret factor structure cautiously.")

    observed, threshold, n_factors = parallel_analysis(z)
    eig_table = pd.DataFrame(
        {
            "factor_number": np.arange(1, len(observed) + 1),
            "observed_eigenvalue": observed,
            "parallel_95pct_eigenvalue": threshold,
            "retain": observed > threshold,
        }
    )
    eig_table.to_csv(OUT_DIR / f"{label}_parallel_analysis.csv", index=False)
    save_scree_plot(
        observed,
        threshold,
        OUT_DIR / f"{label}_parallel_analysis_scree.png",
        f"Parallel Analysis — {label}",
    )

    log(f"[{label}] Parallel Analysis retained: {n_factors} factor(s)")

    # Exact LAPACK SVD is deterministic and preferable here because p is tiny.
    fa = FactorAnalysis(
        n_components=n_factors,
        rotation="varimax",
        svd_method="lapack",
        random_state=RANDOM_STATE,
        max_iter=5000,
        tol=1e-4,
    )

    raw_scores_array = fa.fit_transform(z)
    factor_names = [f"factor_{i + 1}" for i in range(n_factors)]

    loadings = pd.DataFrame(
        fa.components_.T,
        index=indicators.columns,
        columns=factor_names,
    )
    scores = pd.DataFrame(
        raw_scores_array,
        index=indicators.index,
        columns=factor_names,
    )

    loadings, scores = orient_factor_signs(loadings, scores)

    communalities = (loadings ** 2).sum(axis=1).rename("communality")
    uniqueness = pd.Series(
        fa.noise_variance_,
        index=indicators.columns,
        name="uniqueness",
    )

    loading_output = loadings.copy()
    loading_output["communality"] = communalities
    loading_output["uniqueness"] = uniqueness
    loading_output.to_csv(OUT_DIR / f"{label}_factor_loadings.csv")

    # Save raw factor scores, then standardize them for regression interpretability.
    scores.to_csv(OUT_DIR / f"{label}_factor_scores_raw.csv")

    score_scaler = StandardScaler()
    scores_std = pd.DataFrame(
        score_scaler.fit_transform(scores),
        index=scores.index,
        columns=scores.columns,
    )
    scores_std.to_csv(OUT_DIR / f"{label}_factor_scores_standardized.csv")

    diagnostics = diagnose_factor_solution(loadings, communalities, label)
    diagnostics.to_csv(OUT_DIR / f"{label}_factor_diagnostics.csv", index=False)

    log(f"[{label}] Rotated loadings:")
    log(loadings.round(3).to_string())
    log(f"[{label}] Communalities:")
    log(communalities.round(3).to_string())

    # Heatmap.
    fig, ax = plt.subplots(
        figsize=(max(7, n_factors * 2.4), max(5, len(loadings) * 0.7))
    )
    image = ax.imshow(loadings.values, aspect="auto")
    ax.set_xticks(np.arange(len(loadings.columns)))
    ax.set_xticklabels(loadings.columns)
    ax.set_yticks(np.arange(len(loadings.index)))
    ax.set_yticklabels(loadings.index)
    ax.set_title(f"Rotated EFA Loadings — {label}")

    for row in range(loadings.shape[0]):
        for col in range(loadings.shape[1]):
            ax.text(col, row, f"{loadings.iloc[row, col]:.2f}", ha="center", va="center")

    fig.colorbar(image, ax=ax, label="Loading")
    fig.tight_layout()
    fig.savefig(OUT_DIR / f"{label}_factor_loadings_heatmap.png", dpi=180)
    plt.close(fig)

    return {
        "label": label,
        "n_factors": n_factors,
        "kmo": kmo_overall,
        "bartlett_p": bartlett_p,
        "loadings": loadings,
        "communalities": communalities,
        "scores_standardized": scores_std,
        "diagnostics": diagnostics,
    }


# =============================================================================
# MIXED MODEL FITTING
# =============================================================================


def fit_mixedlm_with_fallback(formula: str, data: pd.DataFrame, *, reml: bool):
    methods = ["lbfgs", "bfgs", "powell"]
    errors: list[str] = []

    for method in methods:
        try:
            result = smf.mixedlm(
                formula,
                data=data,
                groups=data["repositoryName"],
            ).fit(
                reml=reml,
                method=method,
                maxiter=3000,
                disp=False,
            )
            if result.converged:
                return result, method
            errors.append(f"{method}: did not converge")
        except Exception as exc:  # noqa: BLE001 - report all optimizer failures
            errors.append(f"{method}: {type(exc).__name__}: {exc}")

    raise RuntimeError(
        "MixedLM failed with all optimizers:\n  - " + "\n  - ".join(errors)
    )


def extract_fixed_effect_table(model, model_label: str, factor: str) -> pd.DataFrame:
    ci = model.conf_int()
    rows = []
    for parameter in model.fe_params.index:
        rows.append(
            {
                "factor": factor,
                "model": model_label,
                "parameter": parameter,
                "estimate": float(model.fe_params[parameter]),
                "std_error": float(model.bse_fe[parameter]),
                "z_value": float(model.tvalues[parameter]),
                "p_value": float(model.pvalues[parameter]),
                "ci_95_low": float(ci.loc[parameter, 0]),
                "ci_95_high": float(ci.loc[parameter, 1]),
            }
        )
    return pd.DataFrame(rows)


def save_lmm_residual_diagnostics(model, factor: str, suffix: str) -> dict[str, float]:
    fitted = np.asarray(model.fittedvalues, dtype=float)
    residuals = np.asarray(model.resid, dtype=float)

    # Residual vs fitted.
    fig, ax = plt.subplots(figsize=(7, 5))
    ax.scatter(fitted, residuals, s=8, alpha=0.35)
    ax.axhline(0.0, linestyle="--")
    ax.set_xlabel("Fitted values")
    ax.set_ylabel("Residuals")
    ax.set_title(f"Residuals vs Fitted — {factor} ({suffix})")
    fig.tight_layout()
    fig.savefig(OUT_DIR / f"{factor}_{suffix}_residuals_vs_fitted.png", dpi=160)
    plt.close(fig)

    # Normal Q-Q plot using statsmodels helper through scipy quantiles manually.
    sorted_resid = np.sort(residuals)
    n = len(sorted_resid)
    probabilities = (np.arange(1, n + 1) - 0.5) / n
    from scipy.stats import norm
    theoretical = norm.ppf(probabilities)

    fig, ax = plt.subplots(figsize=(6, 6))
    ax.scatter(theoretical, sorted_resid, s=8, alpha=0.35)
    slope, intercept = np.polyfit(theoretical, sorted_resid, 1)
    ax.plot(theoretical, intercept + slope * theoretical, linestyle="--")
    ax.set_xlabel("Theoretical normal quantiles")
    ax.set_ylabel("Observed residual quantiles")
    ax.set_title(f"Residual Q-Q — {factor} ({suffix})")
    fig.tight_layout()
    fig.savefig(OUT_DIR / f"{factor}_{suffix}_residual_qq.png", dpi=160)
    plt.close(fig)

    # With N>20 normality tests become very sensitive; save as diagnostic only.
    normality_stat, normality_p = normaltest(residuals)
    return {
        "residual_mean": float(residuals.mean()),
        "residual_sd": float(residuals.std(ddof=1)),
        "normaltest_statistic": float(normality_stat),
        "normaltest_p": float(normality_p),
    }


def fit_factor_models(
    snap: pd.DataFrame,
    factor_scores: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    log("\n" + "=" * 100)
    log("3. SAME FACTOR SCORE: OLS BASELINE VS PROJECT-RANDOM-INTERCEPT LMM")
    log("=" * 100)

    data = snap.copy()
    for factor in factor_scores.columns:
        data[factor] = factor_scores[factor]

    comparison_rows: list[dict[str, Any]] = []
    fixed_effect_tables: list[pd.DataFrame] = []
    summary_text: list[str] = []
    residual_diagnostics_rows: list[dict[str, Any]] = []

    for factor in factor_scores.columns:
        formula = (
            f"{factor} ~ C(category_bucket, Treatment('quality')) + log_ncloc"
        )

        log(f"\n[{factor}] {formula}")

        # Plain Gaussian OLS likelihood for AIC/BIC/LL comparison.
        ols_ml = smf.ols(formula, data=data).fit()

        # Same OLS coefficients, but cluster-robust inference for the baseline report.
        ols_cluster = ols_ml.get_robustcov_results(
            cov_type="cluster",
            groups=data["repositoryName"],
            use_correction=True,
        )

        # ML LMM is used for likelihood/AIC/BIC comparison.
        lmm_ml, ml_method = fit_mixedlm_with_fallback(formula, data, reml=False)

        # REML LMM is used for the main coefficient/variance report.
        lmm_reml, reml_method = fit_mixedlm_with_fallback(formula, data, reml=True)

        project_variance = float(lmm_reml.cov_re.iloc[0, 0])
        residual_variance = float(lmm_reml.scale)
        icc = project_variance / (project_variance + residual_variance)

        comparison_rows.append(
            {
                "factor": factor,
                "n_obs": int(lmm_ml.nobs),
                "n_projects": int(data["repositoryName"].nunique()),
                "ols_loglikelihood": float(ols_ml.llf),
                "ols_aic": float(ols_ml.aic),
                "ols_bic": float(ols_ml.bic),
                "lmm_ml_loglikelihood": float(lmm_ml.llf),
                "lmm_ml_aic": float(lmm_ml.aic),
                "lmm_ml_bic": float(lmm_ml.bic),
                "delta_aic_ols_minus_lmm": float(ols_ml.aic - lmm_ml.aic),
                "delta_bic_ols_minus_lmm": float(ols_ml.bic - lmm_ml.bic),
                "reml_project_variance": project_variance,
                "reml_residual_variance": residual_variance,
                "reml_icc": icc,
                "ml_optimizer": ml_method,
                "reml_optimizer": reml_method,
                "ml_converged": bool(lmm_ml.converged),
                "reml_converged": bool(lmm_reml.converged),
            }
        )

        fixed_effect_tables.append(
            extract_fixed_effect_table(lmm_reml, "LMM_REML", factor)
        )

        residual_diag = save_lmm_residual_diagnostics(lmm_reml, factor, "lmm_reml")
        residual_diag["factor"] = factor
        residual_diagnostics_rows.append(residual_diag)

        log(
            f"[{factor}] OLS: LL={ols_ml.llf:.3f}, AIC={ols_ml.aic:.3f}, BIC={ols_ml.bic:.3f}"
        )
        log(
            f"[{factor}] LMM-ML: LL={lmm_ml.llf:.3f}, AIC={lmm_ml.aic:.3f}, "
            f"BIC={lmm_ml.bic:.3f}, optimizer={ml_method}"
        )
        log(
            f"[{factor}] LMM-REML: project variance={project_variance:.4f}, "
            f"residual variance={residual_variance:.4f}, ICC={icc:.1%}, "
            f"optimizer={reml_method}"
        )

        summary_text.append(
            "\n" + "=" * 100
            + f"\nOLS CLUSTER-ROBUST BASELINE — {factor}\n"
            + "=" * 100 + "\n"
            + ols_cluster.summary().as_text()
            + "\n\n" + "=" * 100
            + f"\nLMM ML (FOR MODEL-FIT COMPARISON) — {factor}\n"
            + "=" * 100 + "\n"
            + lmm_ml.summary().as_text()
            + "\n\n" + "=" * 100
            + f"\nLMM REML (MAIN INFERENCE) — {factor}\n"
            + "=" * 100 + "\n"
            + lmm_reml.summary().as_text()
        )

    comparison = pd.DataFrame(comparison_rows)
    fixed_effects = pd.concat(fixed_effect_tables, ignore_index=True)
    residual_diagnostics = pd.DataFrame(residual_diagnostics_rows)

    comparison.to_csv(OUT_DIR / "factor_ols_vs_lmm_comparison.csv", index=False)
    fixed_effects.to_csv(OUT_DIR / "factor_lmm_reml_fixed_effects.csv", index=False)
    residual_diagnostics.to_csv(OUT_DIR / "factor_lmm_residual_diagnostics.csv", index=False)

    with open(OUT_DIR / "factor_model_summaries.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(summary_text))

    log("\nModel comparison:")
    log(comparison.round(4).to_string(index=False))

    return comparison, fixed_effects


# =============================================================================
# SENSITIVITY: PROJECTS WITH >= 5 PRs
# =============================================================================


def run_project_size_sensitivity(
    snap: pd.DataFrame,
    factor_scores: pd.DataFrame,
) -> pd.DataFrame:
    log("\n" + "=" * 100)
    log(f"4. SENSITIVITY: PROJECTS WITH >= {MIN_PRS_PER_PROJECT_SENSITIVITY} PRs")
    log("=" * 100)

    data = snap.copy()
    for factor in factor_scores.columns:
        data[factor] = factor_scores[factor]

    subset = data[
        data["n_prs_in_project"] >= MIN_PRS_PER_PROJECT_SENSITIVITY
    ].copy()

    log(
        f"Sensitivity sample: {len(subset):,} PRs in "
        f"{subset['repositoryName'].nunique():,} projects"
    )

    rows: list[dict[str, Any]] = []

    for factor in factor_scores.columns:
        formula = (
            f"{factor} ~ C(category_bucket, Treatment('quality')) + log_ncloc"
        )
        model, method = fit_mixedlm_with_fallback(formula, subset, reml=True)
        project_variance = float(model.cov_re.iloc[0, 0])
        residual_variance = float(model.scale)
        icc = project_variance / (project_variance + residual_variance)

        for parameter in model.fe_params.index:
            rows.append(
                {
                    "factor": factor,
                    "parameter": parameter,
                    "estimate": float(model.fe_params[parameter]),
                    "std_error": float(model.bse_fe[parameter]),
                    "p_value": float(model.pvalues[parameter]),
                    "icc": icc,
                    "n_obs": int(model.nobs),
                    "n_projects": int(subset["repositoryName"].nunique()),
                    "optimizer": method,
                    "converged": bool(model.converged),
                }
            )

    result = pd.DataFrame(rows)
    result.to_csv(OUT_DIR / "factor_lmm_projects_ge_5_sensitivity.csv", index=False)
    return result


# =============================================================================
# FINAL DATASET
# =============================================================================


def save_analysis_dataset(snap: pd.DataFrame, scores: pd.DataFrame) -> None:
    output = snap.copy()
    for factor in scores.columns:
        output[factor] = scores[factor]

    output.drop(columns=["issuesSummaryJson"], errors="ignore").to_csv(
        OUT_DIR / "analysis_dataset_with_factor_scores.csv",
        index=False,
    )


# =============================================================================
# MAIN
# =============================================================================


def main() -> None:
    save_versions()

    snap = prepare_dataset(CSV_PATH)

    # -------------------------------------------------------------------------
    # Primary EFA: rates/densities per KLOC.
    # -------------------------------------------------------------------------
    log("\n" + "=" * 100)
    log("2. PRIMARY EFA INDICATORS: PER-KLOC / DENSITY METRICS")
    log("=" * 100)
    log(
        "Caution: several indicators share KLOC as denominator. "
        "A separate size-adjusted EFA sensitivity analysis is therefore included."
    )

    per_kloc = build_per_kloc_indicators(snap)
    per_kloc.to_csv(OUT_DIR / "primary_per_kloc_indicators.csv")

    primary = run_efa(
        per_kloc,
        label="primary_per_kloc",
        log_transform=True,
    )

    # -------------------------------------------------------------------------
    # Alternative EFA sensitivity: size-adjusted log metrics, no common ratio.
    # -------------------------------------------------------------------------
    if RUN_SIZE_ADJUSTED_EFA_SENSITIVITY:
        size_adjusted = build_size_adjusted_indicators(snap)
        size_adjusted.to_csv(OUT_DIR / "sensitivity_size_adjusted_indicators.csv")

        sensitivity_efa = run_efa(
            size_adjusted,
            label="sensitivity_size_adjusted",
            log_transform=False,  # residuals can be negative
        )

        comparison = pd.DataFrame(
            [
                {
                    "analysis": "primary_per_kloc",
                    "n_factors": primary["n_factors"],
                    "KMO": primary["kmo"],
                    "Bartlett_p": primary["bartlett_p"],
                },
                {
                    "analysis": "sensitivity_size_adjusted",
                    "n_factors": sensitivity_efa["n_factors"],
                    "KMO": sensitivity_efa["kmo"],
                    "Bartlett_p": sensitivity_efa["bartlett_p"],
                },
            ]
        )
        comparison.to_csv(OUT_DIR / "efa_primary_vs_size_adjusted_sensitivity.csv", index=False)

        log("\nEFA robustness comparison:")
        log(comparison.to_string(index=False))

        if primary["n_factors"] != sensitivity_efa["n_factors"]:
            log(
                "WARNING: the number of retained factors changes after size adjustment. "
                "Treat the primary factor structure as exploratory rather than definitive."
            )

    # -------------------------------------------------------------------------
    # OLS vs LMM on SAME standardized primary factor scores.
    # -------------------------------------------------------------------------
    primary_scores = primary["scores_standardized"]
    fit_factor_models(snap, primary_scores)
    run_project_size_sensitivity(snap, primary_scores)
    save_analysis_dataset(snap, primary_scores)

    with open(OUT_DIR / "full_verified_report.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))

    log("\n" + "=" * 100)
    log("DONE")
    log("=" * 100)
    log(f"Outputs saved in: {OUT_DIR.resolve()}")
    log("Key files:")
    log("  - primary_per_kloc_factor_loadings.csv")
    log("  - primary_per_kloc_factor_diagnostics.csv")
    log("  - primary_per_kloc_parallel_analysis.csv")
    log("  - sensitivity_size_adjusted_factor_loadings.csv")
    log("  - efa_primary_vs_size_adjusted_sensitivity.csv")
    log("  - factor_ols_vs_lmm_comparison.csv")
    log("  - factor_lmm_reml_fixed_effects.csv")
    log("  - factor_lmm_projects_ge_5_sensitivity.csv")
    log("  - factor_lmm_residual_diagnostics.csv")
    log("  - analysis_dataset_with_factor_scores.csv")
    log("  - full_verified_report.txt")


if __name__ == "__main__":
    main()
