# Verified EFA -> LMM analysis

## Files
- `factor_analysis_to_lmm_verified.py`: verified analysis script.
- `requirements_factor_analysis_verified.txt`: exact package versions used in verification.

## Input
Place the CSV next to the script and name it:

```text
results_to_be_analyzed.csv
```

or change `CSV_PATH` at the top of the Python file.

## Install

```bash
python -m venv .venv
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows PowerShell
pip install -r requirements_factor_analysis_verified.txt
```

## Run

```bash
python factor_analysis_to_lmm_verified.py
```

Outputs are written to:

```text
factor_analysis_output_verified/
```

## Verified against the supplied dataset
The verified run completed with exit code 0 and produced:
- 3,701 final PRs
- 242 projects
- 3 factors in the primary per-KLOC EFA
- 2 factors in the size-adjusted sensitivity EFA
- converged ML and REML LMMs for all three primary factor scores

The script intentionally flags the third primary factor as fragile and warns that the factor count changes under size adjustment. These are statistical findings, not execution errors.
