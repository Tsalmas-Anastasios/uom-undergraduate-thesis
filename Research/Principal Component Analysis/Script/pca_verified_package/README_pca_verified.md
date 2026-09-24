# Verified PCA → OLS → LMM Analysis

This package is designed for the SonarQube Pull Request dataset used in the thesis.

## Files

- `pca_to_lmm_verified.py` — main analysis script
- `requirements_pca_verified.txt` — exact versions used for verification

## Input

Place the source CSV next to the script as:

```text
results_to_be_analyzed.csv
```

or change `CSV_PATH` at the top of the script.

## Optional EFA comparison

If the verified EFA analysis has already been executed and its directory is available as:

```text
factor_analysis_output_verified/
```

the script also produces direct PCA↔EFA structural comparisons:

- PC/factor score correlations
- loading congruence
- optimal PC↔factor matches

Change `EFA_OUTPUT_DIR` if your EFA folder is elsewhere.

## Install

```bash
pip install -r requirements_pca_verified.txt
```

## Run

```bash
python pca_to_lmm_verified.py
```

## Main methodology

1. Strictly keeps PRs with exactly one `pr_base` and one `pr_closed`.
2. Uses one `pr_closed` observation per PR.
3. Requires `ncloc > 0`.
4. Uses the same seven indicators as the verified EFA pipeline.
5. Applies `log1p` and standardization before the primary PCA.
6. Uses exact full-SVD PCA.
7. Uses Parallel Analysis as the main component-retention rule.
8. Also reports Kaiser and 70/80/90/95% cumulative-variance criteria.
9. Runs a size-adjusted PCA sensitivity analysis without a shared KLOC denominator.
10. Fits OLS and random-intercept LMM to the same standardized PC scores.
11. Uses ML for AIC/BIC/log-likelihood model-fit comparisons and REML for the main LMM inference.
12. Repeats LMMs for projects with at least five PRs.

## Verified result on the supplied dataset

- Final sample: 3,701 PRs, 242 projects.
- Primary PCA Parallel Analysis: 3 PCs.
- Primary PCA cumulative variance for 3 PCs: ~77.46%.
- 4 PCs are required to exceed 80% cumulative variance.
- Size-adjusted sensitivity Parallel Analysis: 2 PCs.
- LMM ICCs for retained primary PCs are approximately 94.3%, 86.5%, and 85.6%.

The change from 3 PCs to 2 PCs after size adjustment should be reported as a robustness limitation: the exact dimensionality is sensitive to how codebase size is controlled.
