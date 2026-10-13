# CardioVista AI — Machine Learning Model Evaluation Report

## 1. Methodology & Evaluation Framework
To adhere to the rigorous standards of the hackathon and avoid overfitting on the 303-patient cohort, the evaluation pipeline employs a two-tier validation scheme:
1. **5-Fold Stratified Cross-Validation:** Stratified on target positive rates to generate variance-resistant out-of-fold metrics across the 80% training partition (242 samples).
2. **Stratified Holdout Evaluation:** 20% independent holdout test partition (61 samples) never exposed to hyperparameter selection or model selection.
3. **Leakage Prevention Verification:**
   - Targets (`Cath`, `LAD`, `LCX`, `RCA`) and zero-variance feature `Exertional CP` were excluded prior to pipeline construction.
   - All imputations, scalers (`StandardScaler`), and encoders (`OneHotEncoder`) were fit exclusively within training folds.

---

## 2. Model Performance Summary

### Target 1: Coronary Artery Disease (CAD / Cath)
*Positive class: CAD ($N=216$), Negative class: Normal ($N=87$)*

| Model | 5-Fold CV Accuracy | 5-Fold CV F1 | 5-Fold CV ROC-AUC | Holdout Test F1 | Holdout Test ROC-AUC | Selected |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression (Balanced)** | **0.8592** | **0.8957** | **0.9276** | **0.8395** | **0.9044** | **YES (Primary)** |
| Random Forest (Depth=5) | 0.8511 | 0.8918 | 0.9177 | 0.8941 | 0.8682 | Benchmark |
| Gradient Boosting (Estimators=80)| 0.8510 | 0.8948 | 0.9139 | 0.8315 | 0.8127 | Benchmark |

*Holdout Test Confusion Matrix (Logistic Regression):*
- True Normal (TN): 14, False Positive (FP): 4
- False Negative (FN): 9, True CAD (TP): 34
- **Precision:** 89.47%, **Recall:** 79.07%, **ROC-AUC:** 0.9044

---

### Target 2: Left Anterior Descending Artery (LAD Stenosis)
*Positive class: Stenotic ($N=177$), Negative class: Normal ($N=126$)*

| Model | 5-Fold CV Accuracy | 5-Fold CV F1 | 5-Fold CV ROC-AUC | Holdout Test F1 | Holdout Test ROC-AUC | Selected |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Logistic Regression | 0.7229 | 0.7511 | 0.8192 | 0.7606 | 0.8456 | Benchmark |
| **Random Forest (Depth=5)** | **0.7685** | **0.8056** | **0.8322** | **0.8267** | **0.8533** | **YES (Primary)** |
| Gradient Boosting | 0.7642 | 0.8005 | 0.8176 | 0.8108 | 0.8311 | Benchmark |

*Holdout Test Confusion Matrix (Random Forest):*
- True Normal (TN): 17, False Positive (FP): 8
- False Negative (FN): 5, True Stenotic (TP): 31
- **Accuracy:** 78.69%, **Precision:** 79.49%, **Recall:** 86.11%, **ROC-AUC:** 0.8533

---

### Target 3: Left Circumflex Artery (LCX Stenosis)
*Positive class: Stenotic ($N=119$), Negative class: Normal ($N=184$)*

| Model | 5-Fold CV Accuracy | 5-Fold CV F1 | 5-Fold CV ROC-AUC | Holdout Test F1 | Holdout Test ROC-AUC | Selected |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression (Balanced)** | **0.6649** | **0.5983** | **0.6857** | **0.5556** | **0.6971** | **YES (Primary)** |
| Random Forest | 0.6316 | 0.5391 | 0.6957 | 0.5217 | 0.6914 | Benchmark |
| Gradient Boosting | 0.6153 | 0.4145 | 0.6319 | 0.4889 | 0.7173 | Benchmark |

*Holdout Test Confusion Matrix (Logistic Regression):*
- True Normal (TN): 22, False Positive (FP): 15
- False Negative (FN): 9, True Stenotic (TP): 15
- **Accuracy:** 60.66%, **Precision:** 50.00%, **Recall:** 62.50%, **ROC-AUC:** 0.6971

---

### Target 4: Right Coronary Artery (RCA Stenosis)
*Positive class: Stenotic ($N=114$), Negative class: Normal ($N=189$)*

| Model | 5-Fold CV Accuracy | 5-Fold CV F1 | 5-Fold CV ROC-AUC | Holdout Test F1 | Holdout Test ROC-AUC | Selected |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression (Balanced)** | **0.7021** | **0.6374** | **0.7416** | **0.5455** | **0.7288** | **YES (Primary)** |
| Random Forest | 0.6525 | 0.5407 | 0.7016 | 0.6000 | 0.7494 | Benchmark |
| Gradient Boosting | 0.6190 | 0.4116 | 0.6127 | 0.6190 | 0.7872 | Benchmark |

*Holdout Test Confusion Matrix (Logistic Regression):*
- True Normal (TN): 29, False Positive (FP): 9
- False Negative (FN): 11, True Stenotic (TP): 12
- **Accuracy:** 67.21%, **Precision:** 57.14%, **Recall:** 52.17%, **ROC-AUC:** 0.7288

---

## 3. Explainability Insights
- **CAD Diagnosis:** Dominated by acute anginal presentation (`Typical Chest Pain`), functional echocardiography (`Region RWMA`, `EF-TTE`), age, and metabolic markers (`DM`, `TG`, `HTN`).
- **LAD Stenosis:** Strongest correlation with anterior wall kinetic defects (`Region RWMA`) and systolic pump reduction (`EF-TTE`), reflecting LAD's primary perfusion territory.
- **LCX & RCA Stenosis:** More diffuse presentation, heavily influenced by age, dysglycemia, lipid panels, and non-specific repolarization shifts.

---

## 4. Methodological Limitations & Safety Disclaimer
1. **Sample Scale:** The dataset comprises 303 individuals from a single clinical institution (Tehran Heart Center). Model parameters are susceptible to sampling variance.
2. **Absence of External Validation:** While stratified cross-validation provides reliable internal validity, external generalization across varied demographics or clinical facilities has not been established.
3. **Research Prototype Notice:** CardioVista AI is exclusively an educational and investigative prototype. It is **not** an FDA-cleared or CE-marked medical device and cannot be utilized for diagnostic triage or clinical intervention.
