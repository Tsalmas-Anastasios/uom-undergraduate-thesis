"""
Στατιστική ανάλυση: Quality (Maintainability) vs Security σε Pull Requests
============================================================================

Δεδομένα: output_filtered.csv (SonarQube αναλύσεις σε PRs, στήλη analysisRole
με τιμές 'pr_base' / 'pr_closed', και στήλη Category με πολλαπλές, comma-
separated ετικέτες: software_quality, software_security, code_quality,
code_security).

Τι κάνει αυτό το script:
  1. Καθαρίζει/προετοιμάζει τα δεδομένα (βλ. ΣΗΜΕΙΩΣΕΙΣ πιο κάτω).
  2. Απλοποιεί το Category σε 3 κατηγορίες: quality / security / both.
  3. Περιγραφική στατιστική + γραφήματα.
  4. Μοντέλο Α (baseline, "απλό"): OLS με log(ncloc) ως covariate και
     cluster-robust standard errors ανά project.
  5. Μοντέλο Β (κύρια πρόταση): Linear Mixed-Effects Model (LMM) με
     τυχαίο intercept ανά project (repositoryName) — αντιμετωπίζει τη
     μεγάλη ανισορροπία στον αριθμό PRs ανά project (partial pooling).
     Ακολουθεί ενότητα 6β με ΠΡΑΚΤΙΚΗ χρήση του μοντέλου: πρόβλεψη για
     νέο PR, κατάταξη projects βάσει τυχαίου effect, residuals ανά PR.
  6. Μοντέλο Γ (robustness check): Negative Binomial GLM με offset =
     log(ncloc), για να αντιμετωπιστούν σωστά τα μετρήσιμα ως counts.
  7. Μοντέλο Δ (bonus, "πότε security vs maintainability"): μοντέλο
     αναλογίας security issues / συνολικά issues (GEE binomial, clusters
     = project) — δείχνει πότε ένα PR είναι πιο πιθανό να έχει issues
     security-τύπου έναντι maintainability-τύπου.
  8. Έλεγχος ευαισθησίας (sensitivity): επανάληψη περιορισμένη σε projects
     με >= 5 PRs.

ΣΗΜΑΝΤΙΚΕΣ ΣΗΜΕΙΩΣΕΙΣ ΓΙΑ ΤΑ ΔΕΔΟΜΕΝΑ (διαβάστε πριν τρέξετε):
------------------------------------------------------------------
* Κάθε PR έχει (συνήθως) 2 γραμμές: pr_base (πριν) και pr_closed (μετά).
  Ελέγχοντας τα δεδομένα, σε >85-99% των PRs οι μετρικές (bugs, code
  smells, vulnerabilities, ncloc...) είναι ΙΔΙΕΣ στο base και στο closed.
  Άρα ένα μοντέλο πάνω στη "διαφορά" (delta = closed - base) δεν έχει
  αρκετή μεταβλητότητα (πάνω από 94% των PR έχουν delta=0 σε
  maintainability issues, πάνω από 99% σε security issues). Γι' αυτό ΔΕΝ
  προτείνεται delta ως κύρια εξαρτημένη μεταβλητή -- προτείνεται
  cross-sectional ανάλυση (μία εγγραφή/PR, η "τελική" κατάσταση
  pr_closed) όπου εξαρτημένη μεταβλητή είναι η πυκνότητα issues.
* Περίπου 60% των γραμμών έχουν ncloc == 0 (πρακτικά κενά scans, χωρίς
  σχεδόν κανένα issue) -- αυτές αφαιρούνται, γιατί δεν έχει νόημα
  "πυκνότητα issues ανά KLOC" όταν ncloc=0.
* Μετά το φιλτράρισμα μένουν δεδομένα από ~250 (όχι 353) projects, γιατί
  τα υπόλοιπα projects έχουν μόνο ncloc=0 scans (π.χ. PRs μόνο σε docs).
  Αυτό είναι φυσιολογικό.
* Το Category συνδυάζει status από 2 "ταξινομήσεις" SonarQube (παλιά:
  code_quality/code_security ~ types CODE_SMELL/VULNERABILITY· νέα:
  software_quality/software_security ~ impacts MAINTAINABILITY/SECURITY).
  Γι' αυτό συγχωνεύονται σε 2 απλές κατηγορίες (quality, security) + "both".

Βιβλιοθήκες: pandas, numpy, statsmodels, scipy, matplotlib, seaborn
Εγκατάσταση αν χρειαστεί:
    pip install pandas numpy statsmodels scipy matplotlib seaborn
"""

import re
import warnings
import os
import numpy as np
import pandas as pd
import statsmodels.api as sm
import statsmodels.formula.api as smf
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

warnings.filterwarnings("ignore")
sns.set_theme(style="whitegrid")

CSV_PATH = "output_filtered.csv"     # άλλαξέ το αν χρειάζεται
OUT_DIR = "pr_analysis_output"       # φάκελος εξόδου (γραφήματα, csv, txt)

os.makedirs(OUT_DIR, exist_ok=True)

report_lines = []
def log(msg=""):
    print(msg)
    report_lines.append(str(msg))


# ---------------------------------------------------------------------------
# 1. ΦΟΡΤΩΣΗ & ΚΑΘΑΡΙΣΜΟΣ
# ---------------------------------------------------------------------------
log("=" * 80)
log("1. ΦΟΡΤΩΣΗ ΔΕΔΟΜΕΝΩΝ")
log("=" * 80)

df = pd.read_csv(CSV_PATH)
log(f"Συνολικές γραμμές: {len(df)}")
log(f"Συνολικά projects (repositoryName): {df.repositoryName.nunique()}")

# Κρατάμε μόνο PRs με ΑΚΡΙΒΩΣ 2 γραμμές (pr_base + pr_closed) -> καθαρό ζευγάρι
df["pr_key"] = df["repositoryName"] + "#" + df["pullRequestNumber"].astype(str)
pair_counts = df["pr_key"].value_counts()
clean_prs = pair_counts[pair_counts == 2].index
df_clean = df[df["pr_key"].isin(clean_prs)].copy()
log(f"PRs με καθαρό ζευγάρι base/closed: {len(clean_prs)} "
    f"(αφαιρέθηκαν {df.pr_key.nunique() - len(clean_prs)} PRs με μη τυπικό αριθμό εγγραφών)")

# Κρατάμε μόνο το 'pr_closed' (τελική/merged κατάσταση) ως μονάδα ανάλυσης.
# (Δικαιολογία: >85-99% ταυτίζεται με το pr_base, οπότε δεν χάνουμε
#  πληροφορία ουσιαστικά, και αποφεύγουμε ψευδο-διπλασιασμό δείγματος.)
snap = df_clean[df_clean["analysisRole"] == "pr_closed"].copy()
log(f"Στιγμιότυπα (1/PR, pr_closed): {len(snap)}")

# Φιλτράρισμα: ncloc > 0 (αλλιώς δεν ορίζεται πυκνότητα issues/KLOC)
snap = snap[snap["ncloc"] > 0].copy()
log(f"Μετά το φίλτρο ncloc>0: {len(snap)} γραμμές, "
    f"{snap.repositoryName.nunique()} projects")


# ---------------------------------------------------------------------------
# 2. ΑΠΛΟΠΟΙΗΣΗ CATEGORY -> quality / security / both
# ---------------------------------------------------------------------------
def bucket_category(cat):
    if pd.isna(cat):
        return np.nan
    c = str(cat).lower()
    has_q = "quality" in c
    has_s = "security" in c
    if has_q and has_s:
        return "both"
    if has_q:
        return "quality"
    if has_s:
        return "security"
    return np.nan   # π.χ. 'documentation' -> αγνοείται

snap["category_bucket"] = snap["Category"].apply(bucket_category)
snap = snap.dropna(subset=["category_bucket"]).copy()
log("\nΚατανομή category_bucket:")
log(snap["category_bucket"].value_counts().to_string())


# ---------------------------------------------------------------------------
# 3. ΚΑΤΑΣΚΕΥΗ ΜΕΤΡΙΚΩΝ / ΕΞΑΡΤΗΜΕΝΩΝ ΜΕΤΑΒΛΗΤΩΝ
# ---------------------------------------------------------------------------
KLOC = snap["ncloc"] / 1000.0

# Πυκνότητα quality (maintainability) issues ανά KLOC
snap["quality_density"] = snap["softwareQualityMaintainabilityIssues"] / KLOC
# Πυκνότητα security issues ανά KLOC
snap["security_density"] = snap["softwareQualitySecurityIssues"] / KLOC
# Συνολικά issues (για το μοντέλο αναλογίας)
snap["total_issues"] = (snap["softwareQualityMaintainabilityIssues"]
                         + snap["softwareQualitySecurityIssues"])
snap["security_share"] = np.where(
    snap["total_issues"] > 0,
    snap["softwareQualitySecurityIssues"] / snap["total_issues"],
    np.nan,
)

snap["log_ncloc"] = np.log1p(snap["ncloc"])
snap["log_complexity"] = np.log1p(snap["complexity"])
snap["log_cognitive"] = np.log1p(snap["cognitiveComplexity"])
snap["log_quality_density"] = np.log1p(snap["quality_density"])
snap["log_security_density"] = np.log1p(snap["security_density"])

# project ως κατηγορική μεταβλητή για τα mixed models
snap["project"] = snap["repositoryName"].astype("category")

# αριθμός PRs ανά project (χρήσιμο για sensitivity analysis)
prs_per_project = snap.groupby("repositoryName").size()
snap["n_prs_in_project"] = snap["repositoryName"].map(prs_per_project)

log(f"\nΤελικό δείγμα ανάλυσης: {len(snap)} PRs σε {snap.repositoryName.nunique()} projects")
log(f"Διάμεσος αριθμός PRs/project: {prs_per_project.median():.0f}  "
    f"(εύρος {prs_per_project.min()}-{prs_per_project.max()})")


# ---------------------------------------------------------------------------
# 4. ΠΕΡΙΓΡΑΦΙΚΗ ΣΤΑΤΙΣΤΙΚΗ + ΓΡΑΦΗΜΑΤΑ
# ---------------------------------------------------------------------------
log("\n" + "=" * 80)
log("4. ΠΕΡΙΓΡΑΦΙΚΗ ΣΤΑΤΙΣΤΙΚΗ")
log("=" * 80)

desc = snap.groupby("category_bucket")[["quality_density", "security_density",
                                         "ncloc", "complexity"]].median()
log("\nΔιάμεσες τιμές ανά κατηγορία:")
log(desc.to_string())

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
sns.boxplot(data=snap, x="category_bucket", y="log_quality_density", ax=axes[0])
axes[0].set_title("log(1+ Quality issues / KLOC) ανά κατηγορία PR")
sns.boxplot(data=snap, x="category_bucket", y="log_security_density", ax=axes[1])
axes[1].set_title("log(1+ Security issues / KLOC) ανά κατηγορία PR")
plt.tight_layout()
plt.savefig(f"{OUT_DIR}/boxplots_density_by_category.png", dpi=150)
plt.close()

# ICC-like έλεγχος: πόση διακύμανση οφείλεται στο project;
# (γρήγορο εργαλείο: one-way ANOVA-style, χρήσιμο ως αιτιολόγηση mixed model)
grand_mean = snap["log_quality_density"].mean()
between = snap.groupby("repositoryName")["log_quality_density"].apply(
    lambda x: len(x) * (x.mean() - grand_mean) ** 2
).sum()
total = ((snap["log_quality_density"] - grand_mean) ** 2).sum()
log(f"\nΠοσοστό διακύμανσης (log quality density) που εξηγείται από το project "
    f"(between-group SS / total SS): {between/total:.1%}")
log("-> Αν είναι μεγάλο (π.χ. >10-15%), δικαιολογεί τη χρήση mixed-effects "
    "μοντέλου με τυχαίο effect ανά project.")


# ---------------------------------------------------------------------------
# 5. ΜΟΝΤΕΛΟ Α: OLS baseline με cluster-robust SE (ανά project)
#    "Απλό μοντέλο που λαμβάνει υπόψη τις γραμμές κώδικα"
# ---------------------------------------------------------------------------
log("\n" + "=" * 80)
log("5. ΜΟΝΤΕΛΟ Α — OLS baseline, cluster-robust SE ανά project")
log("=" * 80)

ols_quality = smf.ols(
    "log_quality_density ~ C(category_bucket, Treatment('quality')) + log_ncloc + log_complexity",
    data=snap,
).fit(cov_type="cluster", cov_kwds={"groups": snap["repositoryName"]})
log("\n--- Εξαρτημένη: log(1+Quality issues/KLOC) ---")
log(ols_quality.summary().as_text())

ols_security = smf.ols(
    "log_security_density ~ C(category_bucket, Treatment('quality')) + log_ncloc + log_complexity",
    data=snap,
).fit(cov_type="cluster", cov_kwds={"groups": snap["repositoryName"]})
log("\n--- Εξαρτημένη: log(1+Security issues/KLOC) ---")
log(ols_security.summary().as_text())


# ---------------------------------------------------------------------------
# 6. ΜΟΝΤΕΛΟ Β: Linear Mixed-Effects Model (κύρια πρόταση)
#    Τυχαίο intercept ανά project -> partial pooling, κατάλληλο για την
#    τεράστια ανισορροπία στον αριθμό PRs/project (1 έως 94).
# ---------------------------------------------------------------------------
log("\n" + "=" * 80)
log("6. ΜΟΝΤΕΛΟ Β — Linear Mixed Model, τυχαίο intercept ανά project")
log("=" * 80)

lmm_quality = smf.mixedlm(
    "log_quality_density ~ C(category_bucket, Treatment('quality')) + log_ncloc + log_complexity",
    data=snap,
    groups=snap["repositoryName"],
).fit(reml=True)
log("\n--- Εξαρτημένη: log(1+Quality issues/KLOC), random intercept = project ---")
log(lmm_quality.summary().as_text())

lmm_security = smf.mixedlm(
    "log_security_density ~ C(category_bucket, Treatment('quality')) + log_ncloc + log_complexity",
    data=snap,
    groups=snap["repositoryName"],
).fit(reml=True)
log("\n--- Εξαρτημένη: log(1+Security issues/KLOC), random intercept = project ---")
log(lmm_security.summary().as_text())

# τυχαίο slope για log_ncloc ανά project (πιο ευέλικτο, προαιρετικό)
try:
    lmm_quality_slope = smf.mixedlm(
        "log_quality_density ~ C(category_bucket, Treatment('quality')) + log_ncloc + log_complexity",
        data=snap,
        groups=snap["repositoryName"],
        re_formula="~log_ncloc",
    ).fit(reml=True)
    log("\n--- (προαιρετικό) LMM με τυχαίο slope για log_ncloc ανά project ---")
    log(lmm_quality_slope.summary().as_text())
except Exception as e:
    log(f"\n(Το μοντέλο με τυχαίο slope απέτυχε να συγκλίνει: {e})")


# ---------------------------------------------------------------------------
# 6β. ΠΡΑΚΤΙΚΗ ΧΡΗΣΗ ΤΟΥ LMM (Μοντέλο Β)
#     (α) πρόβλεψη για ένα υποθετικό/νέο PR
#     (β) κατάταξη projects βάσει του τυχαίου effect τους (BLUP) -- ποια
#         projects έχουν συστηματικά περισσότερα/λιγότερα quality issues
#         απ' όσα δικαιολογεί το μέγεθος/complexity τους
#     (γ) residual ανά PR -- ποια συγκεκριμένα PRs αποκλίνουν πολύ από
#         την πρόβλεψη (πιθανά "καυτά σημεία" για maintainability review)
# ---------------------------------------------------------------------------
log("\n" + "=" * 80)
log("6β. ΠΡΑΚΤΙΚΗ ΧΡΗΣΗ ΤΟΥ LMM (πρόβλεψη / κατάταξη projects / residuals)")
log("=" * 80)

# (α) Πρόβλεψη population-average (fixed effects only) για ένα υποθετικό
#     νέο PR με δεδομένο μέγεθος/complexity -- χρήσιμο για PR σε ΝΕΟ/άγνωστο
#     project, όπου δεν έχουμε ιστορικό τυχαίο effect.
hypothetical_pr = pd.DataFrame({
    "category_bucket": ["quality"],
    "log_ncloc": [np.log1p(3000)],       # π.χ. PR σε αρχείο/module 3000 γραμμών
    "log_complexity": [np.log1p(150)],   # complexity 150
})
pred_log_density = lmm_quality.predict(hypothetical_pr)[0]
pred_density = np.expm1(pred_log_density)
log(f"\nΠαράδειγμα πρόβλεψης (fixed effects only, ncloc=3000, complexity=150): "
    f"~{pred_density:.1f} quality issues/KLOC αναμενόμενα")
log("(Αν το project είναι ήδη στο δείγμα, πρόσθεσε το BLUP του: "
    "lmm_quality.random_effects[<repositoryName>] στο pred_log_density πριν το expm1.)")

# (β) Κατάταξη projects βάσει τυχαίου intercept (BLUP) -- projects με
#     θετικό effect έχουν συστηματικά ΠΕΡΙΣΣΟΤΕΡΑ quality issues απ' όσα
#     εξηγεί το μέγεθος/complexity τους (μετά τον έλεγχο αυτών) -- πρώτοι
#     υποψήφιοι για γενικευμένη maintainability προσπάθεια, όχι μεμονωμένο PR.
re_df = pd.DataFrame({
    "repositoryName": list(lmm_quality.random_effects.keys()),
    "random_intercept": [v.iloc[0] for v in lmm_quality.random_effects.values()],
}).merge(prs_per_project.rename("n_prs"), left_on="repositoryName", right_index=True)
re_df = re_df.sort_values("random_intercept", ascending=False)
log("\nTop 10 projects με ΠΕΡΙΣΣΟΤΕΡΑ quality issues απ' όσα αναμενόταν "
    "(μεγαλύτερο θετικό random effect, δηλ. προτεραιότητα maintainability):")
log(re_df.head(10).to_string(index=False))
log("\nTop 10 projects με ΛΙΓΟΤΕΡΑ quality issues απ' όσα αναμενόταν "
    "(πιο 'καθαρός' κώδικας σε σχέση με μέγεθος/complexity τους):")
log(re_df.tail(10).to_string(index=False))

# (γ) Residual ανά PR: πραγματική πυκνότητα - πρόβλεψη μοντέλου (fixed+random).
#     Μεγάλο θετικό residual = συγκεκριμένο PR με πολύ περισσότερα issues
#     απ' όσα περιμέναμε ακόμα και για το συγκεκριμένο project -- ένα
#     τέτοιο σήμα θα μπορούσε να τροφοδοτήσει μια λίστα προτεραιότητας
#     PRs προς maintainability review.
snap["lmm_fitted_log_density"] = lmm_quality.fittedvalues
snap["lmm_residual"] = snap["log_quality_density"] - snap["lmm_fitted_log_density"]
top_outliers = snap.sort_values("lmm_residual", ascending=False)[
    ["repositoryName", "pullRequestNumber", "ncloc", "complexity",
     "quality_density", "lmm_residual"]
].head(10)
log("\nTop 10 PRs με τη μεγαλύτερη θετική απόκλιση (residual) από την "
    "πρόβλεψη του LMM -- υποψήφια για άμεση maintainability προσοχή:")
log(top_outliers.to_string(index=False))


# ---------------------------------------------------------------------------
# 7. ΜΟΝΤΕΛΟ Γ: Negative Binomial GLM με offset=log(ncloc)
#    (πιο σωστό στατιστικά για μετρήσιμα counts παρά η λογαριθμο-OLS)
# ---------------------------------------------------------------------------
log("\n" + "=" * 80)
log("7. ΜΟΝΤΕΛΟ Γ — Negative Binomial GLM, offset = log(ncloc), cluster-robust SE")
log("=" * 80)

snap["cat_quality"] = (snap["category_bucket"] == "quality").astype(int)
snap["cat_security"] = (snap["category_bucket"] == "security").astype(int)
snap["cat_both"] = (snap["category_bucket"] == "both").astype(int)

X = sm.add_constant(snap[["cat_security", "cat_both", "log_complexity"]])
nb_quality = sm.GLM(
    snap["softwareQualityMaintainabilityIssues"],
    X,
    family=sm.families.NegativeBinomial(),
    offset=snap["log_ncloc"],
).fit(cov_type="cluster", cov_kwds={"groups": snap["repositoryName"]})
log("\n--- Εξαρτημένη: softwareQualityMaintainabilityIssues (count), offset=log(ncloc) ---")
log(nb_quality.summary().as_text())

nb_security = sm.GLM(
    snap["softwareQualitySecurityIssues"],
    X,
    family=sm.families.NegativeBinomial(),
    offset=snap["log_ncloc"],
).fit(cov_type="cluster", cov_kwds={"groups": snap["repositoryName"]})
log("\n--- Εξαρτημένη: softwareQualitySecurityIssues (count), offset=log(ncloc) ---")
log(nb_security.summary().as_text())


# ---------------------------------------------------------------------------
# 8. ΜΟΝΤΕΛΟ Δ (bonus): "Πότε προτεραιότητα σε security έναντι maintainability;"
#    GEE binomial (proportion security issues / total issues), clusters=project
# ---------------------------------------------------------------------------
log("\n" + "=" * 80)
log("8. ΜΟΝΤΕΛΟ Δ — GEE binomial για security_share (proportion), clusters=project")
log("=" * 80)

sub = snap[snap["total_issues"] > 0].copy()
log(f"PRs με total_issues>0 (χρησιμοποιούνται σε αυτό το μοντέλο): {len(sub)}")

successes = sub["softwareQualitySecurityIssues"]
failures = sub["softwareQualityMaintainabilityIssues"]
endog = np.column_stack([successes, failures])

gee_formula_X = sm.add_constant(sub[["log_ncloc", "log_complexity"]])
try:
    gee_model = sm.GEE(
        endog, gee_formula_X, groups=sub["repositoryName"],
        family=sm.families.Binomial(),
        cov_struct=sm.cov_struct.Exchangeable(),
    ).fit()
    log("\n--- Εξαρτημένη: αναλογία security/(security+maintainability) issues ---")
    log(gee_model.summary().as_text())
except Exception as e:
    log(f"\n(Το GEE binomial απέτυχε: {e})")


# ---------------------------------------------------------------------------
# 9. ΕΛΕΓΧΟΣ ΕΥΑΙΣΘΗΣΙΑΣ: μόνο projects με >= 5 PRs στο δείγμα
# ---------------------------------------------------------------------------
log("\n" + "=" * 80)
log("9. SENSITIVITY CHECK — μόνο projects με >=5 PRs (πιο αξιόπιστο random effect)")
log("=" * 80)

snap5 = snap[snap["n_prs_in_project"] >= 5].copy()
log(f"Projects με >=5 PRs: {snap5.repositoryName.nunique()}, γραμμές: {len(snap5)}")

if len(snap5) > 50:
    lmm_quality_5 = smf.mixedlm(
        "log_quality_density ~ C(category_bucket, Treatment('quality')) + log_ncloc + log_complexity",
        data=snap5,
        groups=snap5["repositoryName"],
    ).fit(reml=True)
    log("\n--- LMM (quality density), υποσύνολο projects>=5 PRs ---")
    log(lmm_quality_5.summary().as_text())


# ---------------------------------------------------------------------------
# 10. ΑΠΟΘΗΚΕΥΣΗ ΑΠΟΤΕΛΕΣΜΑΤΩΝ
# ---------------------------------------------------------------------------
snap.drop(columns=["issuesSummaryJson"], errors="ignore").to_csv(
    f"{OUT_DIR}/analysis_dataset_one_row_per_pr.csv", index=False)
re_df.to_csv(f"{OUT_DIR}/project_ranking_random_effects.csv", index=False)
with open(f"{OUT_DIR}/full_report.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(report_lines))

log(f"\n\nΌλα τα αποτελέσματα αποθηκεύτηκαν στον φάκελο: {OUT_DIR}/")
log(" - full_report.txt: όλα τα μοντέλα (summary)")
log(" - analysis_dataset_one_row_per_pr.csv: το καθαρισμένο dataset (1 γραμμή/PR)")
log(" - project_ranking_random_effects.csv: κατάταξη projects βάσει LMM random effect")
log(" - boxplots_density_by_category.png: γράφημα")
