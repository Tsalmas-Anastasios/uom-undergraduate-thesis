"""
Verified PCA -> OLS -> Linear Mixed-Effects Model pipeline
==========================================================

Designed for the SonarQube Pull Request dataset used in the thesis.

PURPOSE
-------
This script provides a Principal Component Analysis (PCA) workflow that is
methodologically comparable to the verified EFA workflow used on the same data.

Pipeline:
    1. Clean the dataset exactly as in the EFA/LMM analysis.
    2. Keep one final snapshot (pr_closed) per valid PR and require ncloc > 0.
    3. Build the SAME seven primary per-KLOC / density indicators used in EFA.
    4. log1p-transform skewed non-negative indicators and standardize them.
    5. Fit a full PCA using exact LAPACK SVD.
    6. Report explained variance, cumulative explained variance, Kaiser criterion,
       Parallel Analysis, component weights, correlation loadings and scores.
    7. Retain the number of PCs suggested by Parallel Analysis for the main
       downstream analysis (default), so PCA and EFA use the same retention rule.
    8. For each retained standardized PC score compare:
           - pooled OLS (likelihood baseline)
           - cluster-robust OLS inference by project
           - LMM with random intercept by project
       ML LMM is used for AIC/BIC/log-likelihood comparisons;
       REML LMM is used for final coefficient/variance reporting.
    9. Run a sensitivity analysis restricted to projects with >= 5 PRs.
   10. Run a second PCA after size-adjusting raw metrics, avoiding the common
       KLOC denominator used by the primary indicators.
   11. Optionally compare PCA with the outputs of the verified EFA script when
       the EFA output directory is available.

IMPORTANT INTERPRETATION
------------------------
PCA, EFA and LMM are NOT three competing models of the same kind.

PCA:
    Finds orthogonal linear combinations that preserve as much TOTAL observed
    variance as possible. It is primarily a dimensionality-reduction method.

EFA:
    Models SHARED variance using latent factors and separates common variance
    from variable-specific uniqueness/error. It is a latent-variable model.

LMM:
    Models an outcome while explicitly accounting for grouped observations
    (here: PRs nested in projects).

Therefore:
    - PCA vs EFA: compare dimensional structure, loadings, score correlations,
      retained dimensions, interpretability and robustness.
    - OLS vs LMM: compare model fit on the SAME PC score (or same factor score).
    - Do NOT compare AIC/BIC between a PCA-PC LMM and an EFA-factor LMM when the
      dependent variables are different.

WHY STANDARDIZE BEFORE PCA?
---------------------------
PCA in scikit-learn centers features but does not automatically scale them.
The SonarQube indicators have very different numerical scales, so StandardScaler
is applied before PCA. This makes the PCA equivalent to a PCA of the correlation
matrix rather than allowing high-variance units to dominate.

DEPENDENCIES
------------
pip install pandas numpy scipy scikit-learn statsmodels matplotlib

RUN
---
python pca_to_lmm_verified.py
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
from scipy.optimize import linear_sum_assignment
from scipy.stats import normaltest, norm
import sklearn
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import statsmodels
import statsmodels.formula.api as smf

warnings.filterwarnings("ignore")


# =============================================================================
# CONFIGURATION
# =============================================================================

CSV_PATH = Path("results_to_be_analyzed.csv")
OUT_DIR = Path("pca_analysis_output_verified")

# Optional: if the verified EFA output exists, PCA/EFA comparison tables are made.
EFA_OUTPUT_DIR = Path("factor_analysis_output_verified")

RANDOM_STATE = 42
PARALLEL_ANALYSIS_ITERATIONS = 1000
PARALLEL_ANALYSIS_PERCENTILE = 95

# Main retention rule. "parallel" is recommended because the EFA pipeline also
# uses Parallel Analysis and this gives the fairest structural comparison.
COMPONENT_RETENTION_RULE = "parallel"

# PCA cumulative-variance thresholds are still reported even though the main
# retained PC count is selected by Parallel Analysis.
VARIANCE_THRESHOLDS = (0.70, 0.80, 0.90, 0.95)

RUN_SIZE_ADJUSTED_PCA_SENSITIVITY = True
MIN_PRS_PER_PROJECT_SENSITIVITY = 5

OUT_DIR.mkdir(parents=True, exist_ok=True)


# =============================================================================
# REPORTING / REPRODUCIBILITY
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
        "parallel_analysis_percentile": PARALLEL_ANALYSIS_PERCENTILE,
        "component_retention_rule": COMPONENT_RETENTION_RULE,
    }
    with open(OUT_DIR / "software_versions.json", "w", encoding="utf-8") as f:
        json.dump(versions, f, indent=2)

    log("Software / reproducibility information:")
    for key, value in versions.items():
        log(f"  {key}: {value}")


# =============================================================================
# DATA PREPARATION -- SAME LOGIC AS VERIFIED EFA SCRIPT
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
    log(
        "Original unique PRs: "
        f"{df[['repositoryName', 'pullRequestNumber']].drop_duplicates().shape[0]:,}"
    )

    df["pr_key"] = (
        df["repositoryName"].astype(str)
        + "#"
        + df["pullRequestNumber"].astype(str)
    )

    # Exactly one pr_base and one pr_closed per PR.
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

    # Required for rates / densities.
    snap = snap[snap["ncloc"] > 0].copy()
    log(f"After ncloc > 0: {len(snap):,}")

    snap["category_bucket"] = snap["Category"].apply(bucket_category)
    before_category = len(snap)
    snap = snap.dropna(subset=["category_bucket"]).copy()
    log(f"Dropped unsupported/missing categories: {before_category - len(snap):,}")

    snap["project"] = snap["repositoryName"].astype("category")
    snap["log_ncloc"] = np.log1p(snap["ncloc"].astype(float))

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

    for column in core_numeric:
        values = pd.to_numeric(snap[column], errors="coerce")
        if (~np.isfinite(values)).any():
            raise ValueError(f"Non-finite values found in required column: {column}")
        if (values < 0).any():
            raise ValueError(f"Negative values found in non-negative metric: {column}")

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
# INDICATORS -- SAME INPUT SPACE AS VERIFIED EFA
# =============================================================================


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

    if indicators.shape[1] < 2:
        raise ValueError(f"[{label}] Fewer than 2 usable PCA indicators remain.")

    missing_counts = indicators.isna().sum()
    if missing_counts.sum() > 0:
        log(f"[{label}] Missing values found; median imputation will be used:")
        log(missing_counts[missing_counts > 0].to_string())
        indicators = indicators.fillna(indicators.median(numeric_only=True))

    if not np.isfinite(indicators.to_numpy(dtype=float)).all():
        raise ValueError(f"[{label}] Non-finite values remain after cleaning.")

    return indicators


def build_per_kloc_indicators(snap: pd.DataFrame) -> pd.DataFrame:
    """Primary PCA indicators: exactly the same seven indicators used in EFA."""
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
    indicators["complexity_per_kloc"] = (
        snap["complexity"].astype(float) / kloc
    )
    indicators["cognitive_complexity_per_kloc"] = (
        snap["cognitiveComplexity"].astype(float) / kloc
    )
    indicators["duplicated_lines_density"] = (
        snap["duplicatedLinesDensity"].astype(float)
    )

    return clean_indicator_frame(indicators, "per_kloc")


def build_size_adjusted_indicators(snap: pd.DataFrame) -> pd.DataFrame:
    """
    Sensitivity PCA without a common KLOC denominator.

    For every raw metric:
        log1p(metric) = a + b * log1p(ncloc) + residual

    PCA is then performed on standardized residuals. This tests whether the
    dimensional structure is robust when size is removed before PCA instead of
    dividing several variables by the same KLOC denominator.
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


# =============================================================================
# PARALLEL ANALYSIS FOR PCA
# =============================================================================


def parallel_analysis(
    z: np.ndarray,
    *,
    iterations: int = PARALLEL_ANALYSIS_ITERATIONS,
    percentile: float = PARALLEL_ANALYSIS_PERCENTILE,
    random_state: int = RANDOM_STATE,
) -> tuple[np.ndarray, np.ndarray, int]:
    """
    Horn-style Parallel Analysis on the correlation matrix.

    Retain an observed component when its eigenvalue is larger than the chosen
    percentile of eigenvalues generated from random normal data of the same
    dimensions.
    """
    rng = np.random.default_rng(random_state)

    observed = np.linalg.eigvalsh(np.corrcoef(z, rowvar=False))[::-1]
    random_eigs = np.empty((iterations, z.shape[1]), dtype=float)

    for i in range(iterations):
        random_data = rng.normal(size=z.shape)
        random_corr = np.corrcoef(random_data, rowvar=False)
        random_eigs[i] = np.linalg.eigvalsh(random_corr)[::-1]

    threshold = np.percentile(random_eigs, percentile, axis=0)
    n_components = int(np.sum(observed > threshold))

    if n_components < 1:
        raise RuntimeError(
            "Parallel Analysis retained zero principal components. "
            "Do not force a dimensionality-reduction interpretation."
        )

    return observed, threshold, n_components


def components_for_variance_thresholds(
    cumulative_ratio: np.ndarray,
) -> dict[str, int]:
    result: dict[str, int] = {}
    for threshold in VARIANCE_THRESHOLDS:
        n = int(np.searchsorted(cumulative_ratio, threshold, side="left") + 1)
        result[f"components_for_{int(threshold * 100)}pct"] = n
    return result


# =============================================================================
# PCA
# =============================================================================


def orient_components(
    weights: pd.DataFrame,
    corr_loadings: pd.DataFrame,
    scores: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    PCA signs are mathematically arbitrary. For reproducible interpretation,
    orient each retained PC so the variable with the largest absolute
    correlation loading has a positive loading.
    """
    weights = weights.copy()
    corr_loadings = corr_loadings.copy()
    scores = scores.copy()

    for pc in corr_loadings.columns:
        anchor = corr_loadings[pc].abs().idxmax()
        if corr_loadings.loc[anchor, pc] < 0:
            weights[pc] *= -1
            corr_loadings[pc] *= -1
            scores[pc] *= -1

    return weights, corr_loadings, scores


def save_explained_variance_plot(
    variance_table: pd.DataFrame,
    output_path: Path,
    title: str,
) -> None:
    x = variance_table["component"].to_numpy()

    fig, ax = plt.subplots(figsize=(9, 5))
    ax.plot(
        x,
        variance_table["explained_variance_ratio"].to_numpy() * 100,
        marker="o",
        label="Individual explained variance",
    )
    ax.plot(
        x,
        variance_table["cumulative_explained_variance_ratio"].to_numpy() * 100,
        marker="o",
        label="Cumulative explained variance",
    )
    ax.axhline(80, linestyle="--", label="80% cumulative variance")
    ax.set_xlabel("Principal component")
    ax.set_ylabel("Explained variance (%)")
    ax.set_title(title)
    ax.set_xticks(x)
    ax.legend()
    fig.tight_layout()
    fig.savefig(output_path, dpi=180)
    plt.close(fig)


def save_parallel_scree_plot(
    observed: np.ndarray,
    random_threshold: np.ndarray,
    output_path: Path,
    title: str,
) -> None:
    x = np.arange(1, len(observed) + 1)

    fig, ax = plt.subplots(figsize=(9, 5))
    ax.plot(x, observed, marker="o", label="Observed eigenvalues")
    ax.plot(
        x,
        random_threshold,
        marker="o",
        label=f"Random {PARALLEL_ANALYSIS_PERCENTILE}th percentile",
    )
    ax.axhline(1.0, linestyle="--", label="Kaiser eigenvalue = 1")
    ax.set_xlabel("Principal component")
    ax.set_ylabel("Eigenvalue")
    ax.set_title(title)
    ax.set_xticks(x)
    ax.legend()
    fig.tight_layout()
    fig.savefig(output_path, dpi=180)
    plt.close(fig)


def save_loading_heatmap(
    loadings: pd.DataFrame,
    output_path: Path,
    title: str,
) -> None:
    fig, ax = plt.subplots(
        figsize=(max(7, loadings.shape[1] * 2.2), max(5, loadings.shape[0] * 0.7))
    )
    image = ax.imshow(loadings.values, aspect="auto")
    ax.set_xticks(np.arange(loadings.shape[1]))
    ax.set_xticklabels(loadings.columns)
    ax.set_yticks(np.arange(loadings.shape[0]))
    ax.set_yticklabels(loadings.index)
    ax.set_title(title)

    for row in range(loadings.shape[0]):
        for col in range(loadings.shape[1]):
            ax.text(
                col,
                row,
                f"{loadings.iloc[row, col]:.2f}",
                ha="center",
                va="center",
            )

    fig.colorbar(image, ax=ax, label="Correlation loading")
    fig.tight_layout()
    fig.savefig(output_path, dpi=180)
    plt.close(fig)


def save_pc1_pc2_scatter(
    snap: pd.DataFrame,
    scores_std: pd.DataFrame,
    output_path: Path,
    title: str,
) -> None:
    if scores_std.shape[1] < 2:
        return

    fig, ax = plt.subplots(figsize=(8, 6))
    data = snap.loc[scores_std.index, ["category_bucket"]].copy()
    data["PC1"] = scores_std.iloc[:, 0]
    data["PC2"] = scores_std.iloc[:, 1]

    markers = {"quality": "o", "security": "s", "both": "^"}
    for category in ["quality", "security", "both"]:
        subset = data[data["category_bucket"] == category]
        if subset.empty:
            continue
        ax.scatter(
            subset["PC1"],
            subset["PC2"],
            s=12,
            alpha=0.35,
            marker=markers[category],
            label=category,
        )

    ax.axhline(0, linestyle="--", linewidth=0.8)
    ax.axvline(0, linestyle="--", linewidth=0.8)
    ax.set_xlabel("PC1 standardized score")
    ax.set_ylabel("PC2 standardized score")
    ax.set_title(title)
    ax.legend()
    fig.tight_layout()
    fig.savefig(output_path, dpi=180)
    plt.close(fig)


def run_pca(
    indicators: pd.DataFrame,
    *,
    label: str,
    log_transform: bool,
) -> dict[str, Any]:
    log("\n" + "=" * 100)
    log(f"PCA: {label}")
    log("=" * 100)

    X = indicators.astype(float).copy()

    if log_transform:
        if (X < 0).any().any():
            raise ValueError(f"[{label}] log1p requested but negative values exist.")
        X = np.log1p(X)

    # sklearn PCA centers but does not scale, so scale explicitly.
    scaler = StandardScaler()
    z = scaler.fit_transform(X)

    corr = pd.DataFrame(
        np.corrcoef(z, rowvar=False),
        index=indicators.columns,
        columns=indicators.columns,
    )
    corr.to_csv(OUT_DIR / f"{label}_correlation_matrix.csv")

    # Full exact PCA so every eigenvalue/component is available for diagnostics.
    pca = PCA(svd_solver="full")
    all_scores_array = pca.fit_transform(z)

    explained_ratio = pca.explained_variance_ratio_
    cumulative_ratio = np.cumsum(explained_ratio)

    # Use eigenvalues of the actual correlation matrix for PCA reporting and
    # the Kaiser criterion. sklearn's explained_variance_ uses an (n-1) sample
    # covariance convention while StandardScaler uses population SD (ddof=0),
    # producing a tiny n/(n-1) scaling difference. Correlation-matrix
    # eigenvalues avoid that bookkeeping mismatch and sum exactly to p.
    observed_parallel, random_threshold, n_parallel = parallel_analysis(z)
    eigenvalues = observed_parallel.copy()
    n_kaiser = int(np.sum(eigenvalues > 1.0))
    threshold_counts = components_for_variance_thresholds(cumulative_ratio)

    if COMPONENT_RETENTION_RULE == "parallel":
        n_retained = n_parallel
    elif COMPONENT_RETENTION_RULE == "kaiser":
        n_retained = max(1, n_kaiser)
    elif COMPONENT_RETENTION_RULE == "variance_80":
        n_retained = threshold_counts["components_for_80pct"]
    else:
        raise ValueError(
            "COMPONENT_RETENTION_RULE must be 'parallel', 'kaiser' or 'variance_80'."
        )

    component_names_all = [f"PC{i + 1}" for i in range(z.shape[1])]
    component_names_retained = component_names_all[:n_retained]

    variance_table = pd.DataFrame(
        {
            "component": np.arange(1, len(eigenvalues) + 1),
            "eigenvalue": eigenvalues,
            "explained_variance_ratio": explained_ratio,
            "cumulative_explained_variance_ratio": cumulative_ratio,
            "kaiser_retain_eigenvalue_gt_1": eigenvalues > 1.0,
            "parallel_observed_eigenvalue": observed_parallel,
            "parallel_random_threshold": random_threshold,
            "parallel_retain": observed_parallel > random_threshold,
            "main_retained": np.arange(1, len(eigenvalues) + 1) <= n_retained,
        }
    )
    variance_table.to_csv(OUT_DIR / f"{label}_explained_variance.csv", index=False)

    retention_summary = {
        "analysis": label,
        "n_variables": int(z.shape[1]),
        "parallel_components": n_parallel,
        "kaiser_components": n_kaiser,
        "main_retention_rule": COMPONENT_RETENTION_RULE,
        "main_retained_components": n_retained,
        "cumulative_variance_main_retained": float(cumulative_ratio[n_retained - 1]),
        **threshold_counts,
    }

    pd.DataFrame([retention_summary]).to_csv(
        OUT_DIR / f"{label}_retention_summary.csv",
        index=False,
    )

    save_explained_variance_plot(
        variance_table,
        OUT_DIR / f"{label}_explained_variance.png",
        f"PCA Explained Variance — {label}",
    )
    save_parallel_scree_plot(
        observed_parallel,
        random_threshold,
        OUT_DIR / f"{label}_parallel_analysis_scree.png",
        f"PCA Parallel Analysis — {label}",
    )

    # Eigenvector weights: coefficients used to form PCs from standardized vars.
    weights_all = pd.DataFrame(
        pca.components_.T,
        index=indicators.columns,
        columns=component_names_all,
    )

    # Correlation loadings for standardized variables:
    # corr(variable_j, PC_k) = eigenvector_jk * sqrt(correlation eigenvalue_k).
    # Using correlation-matrix eigenvalues keeps this exactly aligned with the
    # standardized/correlation-PCA interpretation.
    corr_loadings_all = pd.DataFrame(
        pca.components_.T * np.sqrt(eigenvalues),
        index=indicators.columns,
        columns=component_names_all,
    )

    scores_all = pd.DataFrame(
        all_scores_array,
        index=indicators.index,
        columns=component_names_all,
    )

    # Orient retained components for readable/reproducible signs.
    weights_retained = weights_all[component_names_retained].copy()
    corr_loadings_retained = corr_loadings_all[component_names_retained].copy()
    scores_retained = scores_all[component_names_retained].copy()

    weights_retained, corr_loadings_retained, scores_retained = orient_components(
        weights_retained,
        corr_loadings_retained,
        scores_retained,
    )

    weights_retained.to_csv(OUT_DIR / f"{label}_component_weights.csv")
    corr_loadings_retained.to_csv(
        OUT_DIR / f"{label}_correlation_loadings.csv"
    )
    scores_retained.to_csv(OUT_DIR / f"{label}_pc_scores_raw.csv")

    # Standardize PC scores for comparable downstream regression coefficients.
    score_scaler = StandardScaler()
    scores_std = pd.DataFrame(
        score_scaler.fit_transform(scores_retained),
        index=scores_retained.index,
        columns=scores_retained.columns,
    )
    scores_std.to_csv(OUT_DIR / f"{label}_pc_scores_standardized.csv")

    # Reconstruction error for the retained PC subspace in standardized space.
    retained_indices = np.arange(n_retained)
    reconstructed_z = (
        all_scores_array[:, retained_indices]
        @ pca.components_[retained_indices, :]
        + pca.mean_
    )
    reconstruction_mse = float(np.mean((z - reconstructed_z) ** 2))

    pd.DataFrame(
        [
            {
                **retention_summary,
                "reconstruction_mse_standardized_space": reconstruction_mse,
            }
        ]
    ).to_csv(OUT_DIR / f"{label}_pca_diagnostics.csv", index=False)

    save_loading_heatmap(
        corr_loadings_retained,
        OUT_DIR / f"{label}_correlation_loadings_heatmap.png",
        f"PCA Correlation Loadings — {label}",
    )

    log(f"[{label}] Parallel Analysis retained: {n_parallel} PC(s)")
    log(f"[{label}] Kaiser criterion retained: {n_kaiser} PC(s)")
    for key, value in threshold_counts.items():
        log(f"[{label}] {key}: {value}")
    log(
        f"[{label}] Main retained PCs ({COMPONENT_RETENTION_RULE}): {n_retained}; "
        f"cumulative explained variance={cumulative_ratio[n_retained - 1]:.1%}"
    )
    log(f"[{label}] Reconstruction MSE (standardized space): {reconstruction_mse:.4f}")
    log(f"[{label}] Correlation loadings:")
    log(corr_loadings_retained.round(3).to_string())

    return {
        "label": label,
        "n_parallel": n_parallel,
        "n_kaiser": n_kaiser,
        "n_retained": n_retained,
        "variance_table": variance_table,
        "retention_summary": retention_summary,
        "weights": weights_retained,
        "correlation_loadings": corr_loadings_retained,
        "scores_standardized": scores_std,
        "cumulative_variance_retained": float(cumulative_ratio[n_retained - 1]),
        "reconstruction_mse": reconstruction_mse,
    }


# =============================================================================
# MIXED MODELS ON PC SCORES
# =============================================================================


def fit_mixedlm_with_fallback(
    formula: str,
    data: pd.DataFrame,
    *,
    reml: bool,
):
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
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{method}: {type(exc).__name__}: {exc}")

    raise RuntimeError(
        "MixedLM failed with all optimizers:\n  - " + "\n  - ".join(errors)
    )


def extract_fixed_effect_table(
    model,
    model_label: str,
    component: str,
) -> pd.DataFrame:
    ci = model.conf_int()
    rows: list[dict[str, Any]] = []

    for parameter in model.fe_params.index:
        rows.append(
            {
                "component": component,
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


def save_lmm_residual_diagnostics(
    model,
    component: str,
    suffix: str,
) -> dict[str, float]:
    fitted = np.asarray(model.fittedvalues, dtype=float)
    residuals = np.asarray(model.resid, dtype=float)

    fig, ax = plt.subplots(figsize=(7, 5))
    ax.scatter(fitted, residuals, s=8, alpha=0.35)
    ax.axhline(0.0, linestyle="--")
    ax.set_xlabel("Fitted values")
    ax.set_ylabel("Residuals")
    ax.set_title(f"Residuals vs Fitted — {component} ({suffix})")
    fig.tight_layout()
    fig.savefig(
        OUT_DIR / f"{component}_{suffix}_residuals_vs_fitted.png",
        dpi=160,
    )
    plt.close(fig)

    sorted_residuals = np.sort(residuals)
    n = len(sorted_residuals)
    probabilities = (np.arange(1, n + 1) - 0.5) / n
    theoretical = norm.ppf(probabilities)

    fig, ax = plt.subplots(figsize=(6, 6))
    ax.scatter(theoretical, sorted_residuals, s=8, alpha=0.35)
    slope, intercept = np.polyfit(theoretical, sorted_residuals, 1)
    ax.plot(theoretical, intercept + slope * theoretical, linestyle="--")
    ax.set_xlabel("Theoretical normal quantiles")
    ax.set_ylabel("Observed residual quantiles")
    ax.set_title(f"Residual Q-Q — {component} ({suffix})")
    fig.tight_layout()
    fig.savefig(
        OUT_DIR / f"{component}_{suffix}_residual_qq.png",
        dpi=160,
    )
    plt.close(fig)

    normality_stat, normality_p = normaltest(residuals)

    return {
        "residual_mean": float(residuals.mean()),
        "residual_sd": float(residuals.std(ddof=1)),
        "normaltest_statistic": float(normality_stat),
        "normaltest_p": float(normality_p),
    }


def fit_pc_models(
    snap: pd.DataFrame,
    pc_scores: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    log("\n" + "=" * 100)
    log("3. SAME PC SCORE: OLS BASELINE VS PROJECT-RANDOM-INTERCEPT LMM")
    log("=" * 100)

    data = snap.copy()
    for component in pc_scores.columns:
        data[component] = pc_scores[component]

    comparison_rows: list[dict[str, Any]] = []
    fixed_effect_tables: list[pd.DataFrame] = []
    summary_text: list[str] = []
    residual_diagnostics_rows: list[dict[str, Any]] = []

    for component in pc_scores.columns:
        formula = (
            f"{component} ~ C(category_bucket, Treatment('quality')) + log_ncloc"
        )

        log(f"\n[{component}] {formula}")

        # Plain OLS for Gaussian likelihood/AIC/BIC comparison.
        ols_ml = smf.ols(formula, data=data).fit()

        # Same OLS point estimates, cluster-robust inference by project.
        ols_cluster = ols_ml.get_robustcov_results(
            cov_type="cluster",
            groups=data["repositoryName"],
            use_correction=True,
        )

        # ML for model-fit comparison.
        lmm_ml, ml_method = fit_mixedlm_with_fallback(
            formula,
            data,
            reml=False,
        )

        # REML for main variance/fixed-effect report.
        lmm_reml, reml_method = fit_mixedlm_with_fallback(
            formula,
            data,
            reml=True,
        )

        project_variance = float(lmm_reml.cov_re.iloc[0, 0])
        residual_variance = float(lmm_reml.scale)
        variance_total = project_variance + residual_variance
        icc = (
            project_variance / variance_total
            if variance_total > 0
            else np.nan
        )

        comparison_rows.append(
            {
                "component": component,
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
            extract_fixed_effect_table(lmm_reml, "LMM_REML", component)
        )

        residual_diag = save_lmm_residual_diagnostics(
            lmm_reml,
            component,
            "lmm_reml",
        )
        residual_diag["component"] = component
        residual_diagnostics_rows.append(residual_diag)

        log(
            f"[{component}] OLS: LL={ols_ml.llf:.3f}, "
            f"AIC={ols_ml.aic:.3f}, BIC={ols_ml.bic:.3f}"
        )
        log(
            f"[{component}] LMM-ML: LL={lmm_ml.llf:.3f}, "
            f"AIC={lmm_ml.aic:.3f}, BIC={lmm_ml.bic:.3f}, "
            f"optimizer={ml_method}"
        )
        log(
            f"[{component}] LMM-REML: project variance={project_variance:.4f}, "
            f"residual variance={residual_variance:.4f}, ICC={icc:.1%}, "
            f"optimizer={reml_method}"
        )

        summary_text.append(
            "\n" + "=" * 100
            + f"\nOLS CLUSTER-ROBUST BASELINE — {component}\n"
            + "=" * 100 + "\n"
            + ols_cluster.summary().as_text()
            + "\n\n" + "=" * 100
            + f"\nLMM ML (MODEL-FIT COMPARISON) — {component}\n"
            + "=" * 100 + "\n"
            + lmm_ml.summary().as_text()
            + "\n\n" + "=" * 100
            + f"\nLMM REML (MAIN INFERENCE) — {component}\n"
            + "=" * 100 + "\n"
            + lmm_reml.summary().as_text()
        )

    comparison = pd.DataFrame(comparison_rows)
    fixed_effects = pd.concat(fixed_effect_tables, ignore_index=True)
    residual_diagnostics = pd.DataFrame(residual_diagnostics_rows)

    comparison.to_csv(OUT_DIR / "pc_ols_vs_lmm_comparison.csv", index=False)
    fixed_effects.to_csv(OUT_DIR / "pc_lmm_reml_fixed_effects.csv", index=False)
    residual_diagnostics.to_csv(
        OUT_DIR / "pc_lmm_residual_diagnostics.csv",
        index=False,
    )

    with open(OUT_DIR / "pc_model_summaries.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(summary_text))

    log("\nPC model comparison:")
    log(comparison.round(4).to_string(index=False))

    return comparison, fixed_effects


# =============================================================================
# SENSITIVITY: PROJECTS WITH >= 5 PRs
# =============================================================================


def run_project_size_sensitivity(
    snap: pd.DataFrame,
    pc_scores: pd.DataFrame,
) -> pd.DataFrame:
    log("\n" + "=" * 100)
    log(f"4. SENSITIVITY: PROJECTS WITH >= {MIN_PRS_PER_PROJECT_SENSITIVITY} PRs")
    log("=" * 100)

    data = snap.copy()
    for component in pc_scores.columns:
        data[component] = pc_scores[component]

    subset = data[
        data["n_prs_in_project"] >= MIN_PRS_PER_PROJECT_SENSITIVITY
    ].copy()

    log(
        f"Sensitivity sample: {len(subset):,} PRs in "
        f"{subset['repositoryName'].nunique():,} projects"
    )

    rows: list[dict[str, Any]] = []

    for component in pc_scores.columns:
        formula = (
            f"{component} ~ C(category_bucket, Treatment('quality')) + log_ncloc"
        )
        model, method = fit_mixedlm_with_fallback(formula, subset, reml=True)

        project_variance = float(model.cov_re.iloc[0, 0])
        residual_variance = float(model.scale)
        icc = project_variance / (project_variance + residual_variance)

        for parameter in model.fe_params.index:
            rows.append(
                {
                    "component": component,
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
    result.to_csv(OUT_DIR / "pc_lmm_projects_ge_5_sensitivity.csv", index=False)
    return result


# =============================================================================
# OPTIONAL PCA VS EFA COMPARISON
# =============================================================================


def cosine_congruence(a: np.ndarray, b: np.ndarray) -> float:
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    if denom == 0:
        return np.nan
    return float(np.dot(a, b) / denom)


def compare_with_efa_if_available(
    pca_result: dict[str, Any],
    efa_output_dir: Path,
) -> None:
    """
    Optional structural comparison with the verified primary EFA outputs.

    Produces:
      - PC vs factor score correlations
      - PCA correlation-loading vs EFA loading congruence
      - optimal one-to-one matches by absolute score correlation

    These are descriptive structural comparisons, not hypothesis tests proving
    that PCA and EFA are equivalent.
    """
    efa_scores_path = efa_output_dir / "primary_per_kloc_factor_scores_standardized.csv"
    efa_loadings_path = efa_output_dir / "primary_per_kloc_factor_loadings.csv"

    if not efa_scores_path.exists() or not efa_loadings_path.exists():
        log(
            "\nOptional PCA/EFA comparison skipped: verified EFA output files "
            f"were not found under {efa_output_dir.resolve()}."
        )
        return

    log("\n" + "=" * 100)
    log("5. OPTIONAL PCA VS EFA STRUCTURAL COMPARISON")
    log("=" * 100)

    pca_scores = pca_result["scores_standardized"].copy()
    efa_scores = pd.read_csv(efa_scores_path, index_col=0)

    # CSV index may be parsed as strings; normalize to strings on both sides.
    pca_scores.index = pca_scores.index.astype(str)
    efa_scores.index = efa_scores.index.astype(str)

    common_index = pca_scores.index.intersection(efa_scores.index)
    if len(common_index) < 10:
        log("PCA/EFA score comparison skipped: insufficient matching row indices.")
        return

    pc_cols = list(pca_scores.columns)
    factor_cols = [col for col in efa_scores.columns if col.startswith("factor_")]

    score_corr = pd.DataFrame(
        index=pc_cols,
        columns=factor_cols,
        dtype=float,
    )

    for pc in pc_cols:
        for factor in factor_cols:
            score_corr.loc[pc, factor] = np.corrcoef(
                pca_scores.loc[common_index, pc].astype(float),
                efa_scores.loc[common_index, factor].astype(float),
            )[0, 1]

    score_corr.to_csv(OUT_DIR / "pca_vs_efa_score_correlations.csv")

    # Match PCs to EFA factors by maximum absolute score correlation.
    cost = -np.abs(score_corr.to_numpy(dtype=float))
    row_ind, col_ind = linear_sum_assignment(cost)

    score_matches: list[dict[str, Any]] = []
    for r, c in zip(row_ind, col_ind, strict=True):
        pc = score_corr.index[r]
        factor = score_corr.columns[c]
        corr_value = float(score_corr.iloc[r, c])
        score_matches.append(
            {
                "PC": pc,
                "EFA_factor": factor,
                "score_correlation": corr_value,
                "absolute_score_correlation": abs(corr_value),
            }
        )

    pd.DataFrame(score_matches).to_csv(
        OUT_DIR / "pca_vs_efa_optimal_score_matches.csv",
        index=False,
    )

    # Loading congruence comparison.
    efa_loading_df = pd.read_csv(efa_loadings_path, index_col=0)
    efa_factor_cols = [col for col in efa_loading_df.columns if col.startswith("factor_")]
    efa_loading_df = efa_loading_df[efa_factor_cols]

    pca_loadings = pca_result["correlation_loadings"].copy()
    common_vars = pca_loadings.index.intersection(efa_loading_df.index)

    congruence = pd.DataFrame(
        index=pca_loadings.columns,
        columns=efa_factor_cols,
        dtype=float,
    )

    for pc in congruence.index:
        for factor in congruence.columns:
            congruence.loc[pc, factor] = cosine_congruence(
                pca_loadings.loc[common_vars, pc].to_numpy(dtype=float),
                efa_loading_df.loc[common_vars, factor].to_numpy(dtype=float),
            )

    congruence.to_csv(OUT_DIR / "pca_vs_efa_loading_congruence.csv")

    log("PCA vs EFA score correlations:")
    log(score_corr.round(3).to_string())
    log("Optimal one-to-one score matches:")
    log(pd.DataFrame(score_matches).round(3).to_string(index=False))
    log("PCA vs EFA loading congruence:")
    log(congruence.round(3).to_string())


# =============================================================================
# SAVE FINAL DATASET
# =============================================================================


def save_analysis_dataset(
    snap: pd.DataFrame,
    scores: pd.DataFrame,
) -> None:
    output = snap.copy()
    for component in scores.columns:
        output[component] = scores[component]

    output.drop(columns=["issuesSummaryJson"], errors="ignore").to_csv(
        OUT_DIR / "analysis_dataset_with_pc_scores.csv",
        index=False,
    )


# =============================================================================
# MAIN
# =============================================================================


def main() -> None:
    save_versions()
    snap = prepare_dataset(CSV_PATH)

    # -------------------------------------------------------------------------
    # Primary PCA: same per-KLOC metrics and transformation as primary EFA.
    # -------------------------------------------------------------------------
    log("\n" + "=" * 100)
    log("2. PRIMARY PCA: SAME PER-KLOC / DENSITY INPUT SPACE AS EFA")
    log("=" * 100)
    log(
        "The primary PCA uses exactly the same seven indicators as the verified "
        "primary EFA so that PCA/EFA structural comparisons are meaningful."
    )
    log(
        "Caution: several primary indicators share KLOC as denominator; a "
        "separate size-adjusted PCA sensitivity analysis is therefore included."
    )

    primary_indicators = build_per_kloc_indicators(snap)
    primary_indicators.to_csv(OUT_DIR / "primary_per_kloc_indicators.csv")

    primary = run_pca(
        primary_indicators,
        label="primary_per_kloc",
        log_transform=True,
    )

    save_pc1_pc2_scatter(
        snap,
        primary["scores_standardized"],
        OUT_DIR / "primary_pc1_pc2_by_category.png",
        "Primary PCA — PC1 vs PC2 by PR category",
    )

    # -------------------------------------------------------------------------
    # Size-adjusted PCA sensitivity.
    # -------------------------------------------------------------------------
    if RUN_SIZE_ADJUSTED_PCA_SENSITIVITY:
        size_adjusted = build_size_adjusted_indicators(snap)
        size_adjusted.to_csv(OUT_DIR / "sensitivity_size_adjusted_indicators.csv")

        sensitivity = run_pca(
            size_adjusted,
            label="sensitivity_size_adjusted",
            log_transform=False,
        )

        robustness = pd.DataFrame(
            [
                {
                    "analysis": "primary_per_kloc",
                    "parallel_components": primary["n_parallel"],
                    "kaiser_components": primary["n_kaiser"],
                    "main_retained_components": primary["n_retained"],
                    "cumulative_variance_retained": primary[
                        "cumulative_variance_retained"
                    ],
                    "reconstruction_mse": primary["reconstruction_mse"],
                },
                {
                    "analysis": "sensitivity_size_adjusted",
                    "parallel_components": sensitivity["n_parallel"],
                    "kaiser_components": sensitivity["n_kaiser"],
                    "main_retained_components": sensitivity["n_retained"],
                    "cumulative_variance_retained": sensitivity[
                        "cumulative_variance_retained"
                    ],
                    "reconstruction_mse": sensitivity["reconstruction_mse"],
                },
            ]
        )
        robustness.to_csv(
            OUT_DIR / "pca_primary_vs_size_adjusted_sensitivity.csv",
            index=False,
        )

        log("\nPCA robustness comparison:")
        log(robustness.round(4).to_string(index=False))

        if primary["n_parallel"] != sensitivity["n_parallel"]:
            log(
                "WARNING: Parallel Analysis retains a different number of PCs "
                "after size adjustment. Treat the exact dimensionality as "
                "sensitive to the way codebase size is controlled."
            )

    # -------------------------------------------------------------------------
    # OLS vs LMM on SAME retained standardized PC scores.
    # -------------------------------------------------------------------------
    primary_scores = primary["scores_standardized"]
    fit_pc_models(snap, primary_scores)
    run_project_size_sensitivity(snap, primary_scores)
    save_analysis_dataset(snap, primary_scores)

    # -------------------------------------------------------------------------
    # Optional structural PCA vs EFA comparison.
    # -------------------------------------------------------------------------
    compare_with_efa_if_available(primary, EFA_OUTPUT_DIR)

    with open(OUT_DIR / "full_verified_pca_report.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))

    log("\n" + "=" * 100)
    log("DONE")
    log("=" * 100)
    log(f"Outputs saved in: {OUT_DIR.resolve()}")
    log("Key files:")
    log("  - primary_per_kloc_explained_variance.csv")
    log("  - primary_per_kloc_retention_summary.csv")
    log("  - primary_per_kloc_component_weights.csv")
    log("  - primary_per_kloc_correlation_loadings.csv")
    log("  - primary_per_kloc_pc_scores_standardized.csv")
    log("  - pca_primary_vs_size_adjusted_sensitivity.csv")
    log("  - pc_ols_vs_lmm_comparison.csv")
    log("  - pc_lmm_reml_fixed_effects.csv")
    log("  - pc_lmm_projects_ge_5_sensitivity.csv")
    log("  - pc_lmm_residual_diagnostics.csv")
    log("  - analysis_dataset_with_pc_scores.csv")
    log("  - full_verified_pca_report.txt")
    log("  - pca_vs_efa_score_correlations.csv (if EFA outputs were found)")
    log("  - pca_vs_efa_loading_congruence.csv (if EFA outputs were found)")


if __name__ == "__main__":
    main()
