# CardioVista AI — Technical Report

**Project Title:** CardioVista AI: An Explainable Machine Learning Framework with Real-Time 3D Anatomical Heart Visualization for Multitarget Coronary Artery Stenosis Risk Assessment  
**Authors:** CardioVista AI Engineering Team  
**Evaluation Target:** Hackathon Technical Submission (Max 6 pages equivalent)  

---

## 1. Abstract
Coronary Artery Disease (CAD) remains the principal etiology of cardiovascular morbidity worldwide. Traditional clinical risk estimators (e.g., Framingham, ASCVD) offer aggregate 10-year risk percentages without localizing anatomical disease to specific coronary arterial branches. In this paper, we introduce **CardioVista AI**, a full-stack educational and clinical decision-support prototype that predicts both primary CAD and branch-specific coronary stenosis across the Left Anterior Descending (LAD), Left Circumflex (LCX), and Right Coronary Artery (RCA). Leveraging the Tehran Heart Center *Extension of Z-Alizadeh Sani Dataset* (303 records, 59 attributes), the system enforces strict target leakage isolation and trains target-specific regularized models. CardioVista AI integrates a real-time WebGL 3D anatomical heart visualization that renders predicted stenosis states directly onto anatomical coronary trajectories with cardiac cycle animations, alongside transparent feature-importance explanations and empirical 5-fold cross-validation metrics.

---

## 2. Introduction & Problem Statement
Early non-invasive identification of coronary stenosis prior to invasive cardiac catheterization is critical for timely intervention. However, existing AI diagnostic tools present two significant shortcomings:
1. **The "Black-Box" Deficit:** Models output isolated statistical percentages without anatomical grounding or transparent feature contributions.
2. **Global vs. Vessel Disconnect:** Most machine learning benchmarks predict binary CAD status without differentiating between stenosis in critical perfusion territories (e.g., LAD anterior septal wall vs. LCX posterolateral wall).

CardioVista AI bridges this divide by integrating **multitarget machine learning** with **interactive 3D WebGL spatial visualization**.

---

## 3. Dataset Inspection & Strict Leakage Prevention

### 3.1 Dataset Characterization
The pipeline utilizes the UCI *Extension of Z-Alizadeh Sani Dataset*, encompassing 303 patients undergoing coronary angiography at Tehran Heart Center. The dataset comprises 59 attributes spanning five clinical tiers:
- Demographics & Clinical History (Age, Sex, BMI, DM, HTN, Smoking, Family History).
- Physical Examination (BP, Pulse Rate, Murmurs, Edema, Lung Rales).
- Resting Electrocardiogram (ECG) (Q Waves, ST Elevation/Depression, T-wave Inversion, BBB).
- Laboratory Blood Biomarkers (FBS, TG, LDL, HDL, Creatinine, ESR, Electrolytes).
- Transthoracic Echocardiography (Ejection Fraction, Regional Wall Motion Abnormality score).

### 3.2 Target Leakage Isolation
A vessel is clinically defined as stenotic when luminal narrowing is $\ge 50\%$. The dataset contains four catheterization ground-truth columns:
- `Cath`: Primary CAD diagnosis (216 CAD positive, 87 Normal).
- `LAD`: Left Anterior Descending stenosis (177 Stenotic, 126 Normal).
- `LCX`: Left Circumflex stenosis (119 Stenotic, 184 Normal).
- `RCA`: Right Coronary Artery stenosis (114 Stenotic, 189 Normal).

**Strict Isolation Protocol:**
To prevent target leakage, all four target columns (`Cath`, `LAD`, `LCX`, `RCA`) and the constant zero-variance feature `Exertional CP` are strictly excised prior to feature preprocessing. Preprocessing transformers (`StandardScaler`, `OneHotEncoder`) are fit solely on training folds during cross-validation.

---

## 4. Machine Learning Methodology & Empirical Evaluation

### 4.1 Validation Protocol
To ensure honesty and prevent optimistic bias on the 303-patient cohort, models were evaluated via:
1. **5-Fold Stratified Cross-Validation:** Providing variance-resistant out-of-fold metrics across training partitions (242 samples).
2. **20% Stratified Holdout Test Partition:** Evaluating performance on 61 completely unseen patients.

### 4.2 Candidate Models & Selection
Three candidate architectures were trained and compared for each target: Logistic Regression with balanced class weighting, Random Forest (Depth=5), and Gradient Boosting.

#### Summary of Evaluated Performance

| Target | Selected Model | 5-Fold CV F1 | 5-Fold CV ROC-AUC | Holdout Test F1 | Holdout Test ROC-AUC | Holdout Precision | Holdout Recall |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CAD** | Logistic Regression (Balanced) | **0.8957** | **0.9276** | **0.8395** | **0.9044** | 89.47% | 79.07% |
| **LAD** | Random Forest (Depth=5) | **0.8056** | **0.8322** | **0.8267** | **0.8533** | 79.49% | 86.11% |
| **LCX** | Logistic Regression (Balanced) | **0.5983** | **0.6857** | **0.5556** | **0.6971** | 50.00% | 62.50% |
| **RCA** | Logistic Regression (Balanced) | **0.6374** | **0.7416** | **0.5455** | **0.7288** | 57.14% | 52.17% |

---

## 5. Interactive 3D Anatomical Heart Visualization

The frontend integrates a real-time WebGL rendering pipeline built on Three.js:
- **Anatomical Modeling:** Custom procedural 3D geometries render the myocardial ventricular mass, atria, ascending aorta with brachiocephalic arch branches, pulmonary artery trunk, and superior vena cava.
- **Coronary Trajectories:** Spline tube paths trace the anatomical course of the **LAD** (anterior interventricular sulcus to apex), **LCX** (left atrioventricular groove), and **RCA** (right coronary sulcus to crux).
- **Dynamic Shader Mapping:** Arterial materials receive live color and emissive properties directly from the FastAPI inference payload:
  - Stenotic / High Risk ($\ge 50\%$): Crimson Red (`#EF4444`) with alert emissive glow.
  - Borderline / Moderate Risk: Amber Gold (`#F59E0B`).
  - Patent / Low Risk: Emerald Green (`#10B981`).
- **Physiological Rhythm Synchronization:** Heartbeat systole/diastole contractions pulse at the patient's exact resting heart rate (`PR` bpm).
- **Interactive Orbit & Focus:** Users can rotate 360°, zoom, or click dedicated buttons to smoothly orient the camera to specific coronary branches.

---

## 6. Interpretability & Clinical Feature Contributions

To ensure clinical transparency, the system surfaces feature-importance rankings derived from the trained pipelines:
- **CAD Diagnosis:** Dominated by typical anginal presentation (`Typical Chest Pain`), echocardiographic wall kinetic defects (`Region RWMA`), age, diabetes mellitus (`DM`), triglycerides (`TG`), and T-wave inversion (`Tinversion`).
- **LAD Stenosis:** Heavily driven by `Region RWMA` and ejection fraction (`EF-TTE`), matching the physiological reality that LAD supplies 50% of left ventricular myocardium.
- **Caveat Enforcement:** The user interface explicitly distinguishes between statistical association and clinical causation.

---

## 7. Limitations & Medical Safety

1. **Cohort Size:** 303 patient records from a single tertiary center limit demographic generalization.
2. **Referral Pre-Test Probability:** High CAD prevalence (71.3%) reflects pre-selected catheterization candidates.
3. **Illustrative Geometry:** The 3D model represents standard coronary anatomy and is not a patient-specific volumetric CT reconstruction.
4. **Research Disclaimer:** CardioVista AI is exclusively an educational and research prototype.

---

## 8. Conclusion
CardioVista AI demonstrates that modern machine-learning pipelines can be integrated with WebGL 3D anatomical visualization to provide an engaging, explainable, and educational cardiovascular risk assessment interface.
