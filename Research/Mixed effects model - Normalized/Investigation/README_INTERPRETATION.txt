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