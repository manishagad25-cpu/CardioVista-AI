# CardioVista AI — Dataset Inspection & Schema Report

## 1. Executive Summary
- **Dataset Title:** Extension of Z-Alizadeh Sani Dataset for Coronary Artery Disease (CAD) Diagnosis
- **Origin & Clinical Source:** Tehran Heart Center, University of California Irvine (UCI) Machine Learning Repository
- **Specimens:** 303 patient records
- **Total Columns:** 59 attributes (55 prospective predictor features + 4 angiography targets)
- **Data Completeness:** 100% complete (0 missing cells across all 303 rows and 59 columns)
- **Duplicate Records:** 0 duplicated rows

---

## 2. Target Identification & Ground Truth Encodings
In the original cardiac catheterization examination, coronary stenosis was quantified via coronary angiography. A vessel is classified as **Stenotic** if luminal narrowing is $\ge 50\%$.

| Target Column | Clinical Significance | Class Distribution | Positive Class Encoding | Negative Class Encoding |
| :--- | :--- | :--- | :--- | :--- |
| **`Cath`** | Overall CAD Diagnosis ($\ge 50\%$ stenosis in $\ge 1$ artery) | **CAD**: 216 (71.28%)<br>**Normal**: 87 (28.71%) | `CAD` = 1 | `Normal` = 0 |
| **`LAD`** | Left Anterior Descending Artery Stenosis | **Stenotic**: 177 (58.42%)<br>**Normal**: 126 (41.58%) | `Stenotic` = 1 | `Normal` = 0 |
| **`LCX`** | Left Circumflex Artery Stenosis | **Stenotic**: 119 (39.27%)<br>**Normal**: 184 (60.73%) | `Stenotic` = 1 | `Normal` = 0 |
| **`RCA`** | Right Coronary Artery Stenosis | **Stenotic**: 114 (37.62%)<br>**Normal**: 189 (62.38%) | `Stenotic` = 1 | `Normal` = 0 |

---

## 3. Critical Target Leakage Restriction
To ensure genuine predictive validity, strict target leakage isolation is enforced:
1. **Predictors Excluded:** `Cath`, `LAD`, `LCX`, and `RCA` are strictly eliminated from any model feature input.
2. When predicting vessel-specific outcomes (`LAD`, `LCX`, `RCA`), neither the other vessels nor `Cath` are supplied as inputs.
3. Input dimension is strictly bounded to the **55 non-target clinical and physiological features**.

---

## 4. Feature Taxonomy & Clinical Grouping

### A. Demographic & History (17 features)
- `Age` (Years, range: 30–86, mean: 58.9)
- `Weight` (kg, range: 48–120, mean: 73.8)
- `Length` (Height in cm, range: 140–188, mean: 164.7)
- `Sex` (Male: 176, Female: 127, encoded as 'Fmale' in raw data)
- `BMI` ($kg/m^2$, range: 18.1–40.9, mean: 27.2)
- `DM` (Diabetes Mellitus: No=213, Yes=90)
- `HTN` (Hypertension: Yes=179, No=124)
- `Current Smoker` (No=240, Yes=63)
- `EX-Smoker` (No=293, Yes=10)
- `FH` (Family History of premature CAD: No=255, Yes=48)
- `Obesity` (Y: 211, N: 92)
- `CRF` (Chronic Renal Failure: N: 297, Y: 6)
- `CVA` (Cerebrovascular Accident / Stroke: N: 298, Y: 5)
- `Airway disease` (COPD / Asthma: N: 292, Y: 11)
- `Thyroid Disease` (N: 296, Y: 7)
- `CHF` (Congestive Heart Failure: N: 302, Y: 1)
- `DLP` (Dyslipidemia: N: 191, Y: 112)

### B. Clinical Symptoms & Physical Examination (10 features)
- `BP` (Systolic Blood Pressure, mmHg: 90–190, mean: 129.5)
- `PR` (Pulse Rate, bpm: 50–110, mean: 75.1)
- `Edema` (Peripheral edema: 0: 291, 1: 12)
- `Weak Peripheral Pulse` (N: 298, Y: 5)
- `Lung rales` (Crackles: N: 292, Y: 11)
- `Systolic Murmur` (N: 262, Y: 41)
- `Diastolic Murmur` (N: 294, Y: 9)
- `Typical Chest Pain` (Yes=164, No=139)
- `Dyspnea` (Shortness of breath: N: 169, Y: 134)
- `Function Class` (NYHA functional class 0–3)

### C. Anginal Equivalents & Stress Indicators (4 features)
- `Atypical` (Atypical chest pain: N: 210, Y: 93)
- `Nonanginal` (Non-anginal chest pain: N: 287, Y: 16)
- `Exertional CP` (Exertional chest pain: N: 303 — *zero variance, constant across dataset*)
- `LowTH Ang` (Low threshold angina: N: 301, Y: 2)

### D. Electrocardiogram (ECG) Features (7 features)
- `Q Wave` (Pathological Q waves: 0: 287, 1: 16)
- `St Elevation` (ST-segment elevation: 0: 289, 1: 14)
- `St Depression` (ST-segment depression: 0: 232, 1: 71)
- `Tinversion` (T wave inversion: 0: 213, 1: 90)
- `LVH` (Left Ventricular Hypertrophy: N: 283, Y: 20)
- `Poor R Progression` (PRWP: N: 294, Y: 9)
- `BBB` (Bundle Branch Block: N: 282, LBBB: 13, RBBB: 8)

### E. Laboratory Blood Biomarkers (14 features)
- `FBS` (Fasting Blood Sugar, mg/dL: 62–400, mean: 119.2)
- `CR` (Serum Creatinine, mg/dL: 0.5–2.2, mean: 1.06)
- `TG` (Triglycerides, mg/dL: 37–1050, mean: 150.3)
- `LDL` (Low-Density Lipoprotein, mg/dL: 18–232, mean: 104.6)
- `HDL` (High-Density Lipoprotein, mg/dL: 15.9–111.0, mean: 40.2)
- `BUN` (Blood Urea Nitrogen, mg/dL: 6–52, mean: 17.5)
- `ESR` (Erythrocyte Sedimentation Rate, mm/hr: 1–90, mean: 19.5)
- `HB` (Hemoglobin, g/dL: 8.9–17.6, mean: 13.15)
- `K` (Serum Potassium, mEq/L: 3.0–6.6, mean: 4.23)
- `Na` (Serum Sodium, mEq/L: 128–156, mean: 141.0)
- `WBC` (White Blood Cell count, cells/$\mu L$: 3700–18000, mean: 7562)
- `Lymph` (Lymphocytes %: 7–60, mean: 32.4)
- `Neut` (Neutrophils %: 32–89, mean: 60.15)
- `PLT` (Platelets, $\times 10^3/\mu L$: 25–742, mean: 221.5)

### F. Echocardiography (3 features)
- `EF-TTE` (Ejection Fraction by Transthoracic Echo %: 15–60%, mean: 47.2%)
- `Region RWMA` (Regional Wall Motion Abnormality score: 0 to 4)
- `VHD` (Valvular Heart Disease: mild=149, N=116, Moderate=27, Severe=11)

---

## 5. Preprocessing Strategy
1. **Handling Zero-Variance Features:** Drop `Exertional CP` (contains only `N`) to avoid ill-conditioned matrices.
2. **Standardization of Binary/Categorical Fields:** Map `Y`/`N` to 1/0, clean string whitespace, and handle categories like `Sex` (`Male`/`Fmale`), `BBB` (`N`, `LBBB`, `RBBB`), and `VHD` (`N`, `mild`, `Moderate`, `Severe`) with One-Hot or Ordinal encodings fitted strictly on training folds.
3. **Continuous Scaling:** Standardize numerical features using `StandardScaler` fitted strictly on training data.
