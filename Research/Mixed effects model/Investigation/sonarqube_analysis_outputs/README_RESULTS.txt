SonarQube PR Analysis completed.

Input CSV: output_filtered.csv
Output directory: sonarqube_analysis_outputs

Dataset overview:
               item              value
           raw_rows              20880
     collapsed_rows              20285
         paired_prs              10142
       repositories                357
     analysis_roles pr_base, pr_closed
merged_prs_in_pairs              10036

Main files:
- tables/03_paired_pr_deltas_wide.csv: one row per PR with base/closed/delta metrics
- tables/paired_tests_effect_sizes.csv: paired statistical tests and effect sizes
- models/gee_phase_effects.csv: fast repeated-measures phase models clustered by PR
- models/mixedlm_delta_effects.csv: PR-delta mixed models with repository random intercept
- plots/: diagnostic and descriptive plots