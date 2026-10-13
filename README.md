# CardioVista AI — Multitarget CAD Prediction & Interactive 3D Coronary Anatomy

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_19_%2B_Vite-61DAFB.svg)](https://reactjs.org)
[![Three.js](https://img.shields.io/badge/3D_Engine-Three.js_WebGL-black.svg)](https://threejs.org)
[![scikit-learn](https://img.shields.io/badge/ML-scikit--learn-F7931E.svg)](https://scikit-learn.org)
[![Python](https://img.shields.io/badge/Python-3.14-3776AB.svg)](https://python.org)

> **MEDICAL DISCLAIMER:**  
> CardioVista AI is an educational and research prototype. Its predictions are not a medical diagnosis and have not been validated for clinical use. Do not use this tool to make medical decisions or delay professional medical care.

---

## 1. Project Overview & Elevator Pitch

**CardioVista AI** combines machine learning with interactive 3D heart visualization to predict coronary artery disease outcomes, explore artery-specific predictions, and explain the clinical factors influencing each result.

### Key Capabilities
- **Multitarget Machine Learning:** Simultaneous predictions for primary Coronary Artery Disease (CAD) and vessel-specific stenosis outcomes across the **Left Anterior Descending (LAD)**, **Left Circumflex (LCX)**, and **Right Coronary Artery (RCA)**.
- **Interactive 3D Anatomical Heart:** Real-time WebGL canvas built with Three.js rendering myocardial ventricles, atria, aorta, pulmonary trunk, and epicardial coronary vessels.
- **Dynamic Shader Projection:** Coronary branches dynamically update colors and emissive glows based on live model risk probabilities (Green: Normal, Amber: Borderline, Red: $\ge 50\%$ Stenosis).
- **Physiological Cardiac Cycle Pulsation:** 3D heart beats rhythmically synchronized to the patient's resting pulse rate (PR bpm).
- **Leakage-Free Validation:** Strict isolation of ground-truth catheterization labels (`Cath`, `LAD`, `LCX`, `RCA`) from predictor matrices. Evaluated via 5-Fold Stratified Cross-Validation and 20% unseen holdout testing.
- **Explainable AI (XAI):** Transparent feature contributions and clinical biomarker descriptions distinguishing statistical association from medical causation.

---

## 2. Dataset Provenance & Attribution

The project utilizes the **Extension of Z-Alizadeh Sani Dataset** from the University of California Irvine (UCI) Machine Learning Repository, collected at the Tehran Heart Center:
- **Records:** 303 patient records
- **Features:** 59 clinical attributes (54 active predictors + 1 zero-variance constant feature + 4 angiography targets)
- **Completeness:** 100% complete (0 missing values, 0 duplicate rows)
- **Reference:** Alizadeh Sani et al., *A data mining approach for diagnosis of coronary artery disease*, Computer Methods and Programs in Biomedicine.

---

## 3. Empirical Model Performance Summary

| Target Vessel | Model Pipeline | 5-Fold CV F1 | 5-Fold CV ROC-AUC | Holdout Test F1 | Holdout Test ROC-AUC |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CAD (Overall)** | Logistic Regression (Balanced) | **0.8957** | **0.9276** | **0.8395** | **0.9044** |
| **LAD Stenosis** | Random Forest (Depth=5) | **0.8056** | **0.8322** | **0.8267** | **0.8533** |
| **LCX Stenosis** | Logistic Regression (Balanced) | **0.5983** | **0.6857** | **0.5556** | **0.6971** |
| **RCA Stenosis** | Logistic Regression (Balanced) | **0.6374** | **0.7416** | **0.5455** | **0.7288** |

*All metrics reflect verified empirical evaluations saved in `backend/models/metrics.json`.*

---

## 4. 3D Anatomical Heart Model Provenance & Visualization

- **Asset File:** `frontend/public/models/heart.glb` (3.76 MB, GLTF 2.0 with Draco compression)
- **Licensing & Attribution:** Creative Commons Attribution 4.0 International (CC-BY 4.0) (Sketchfab / Open Anatomical 3D Projects).
- **Decoder Stack:** Google Draco 3D Geometry compression decoded locally via `/draco/gltf/draco_decoder.wasm` and `draco_wasm_wrapper.js`.
- **Anatomical Structures Represented:**
  - Complete left and right ventricular myocardium with realistic apex
  - Left and right atria
  - Ascending aorta and aortic arch
  - Pulmonary artery / pulmonary trunk
  - Superior and inferior vena cava junctions
  - Epicardial adipose and coronary sulci
- **Coronary Artery Overlays & Camera Focus:**
  - **LAD (Left Anterior Descending Artery):** Runs down the anterior interventricular sulcus toward the cardiac apex; includes Diagonal branches D1 and D2. Camera view centers on anterior wall.
  - **LCX (Left Circumflex Artery):** Courses through the left atrioventricular sulcus to the posterolateral left ventricle; includes Obtuse Marginal branch OM1. Camera view rotates to left lateral/posterior wall.
  - **RCA (Right Coronary Artery):** Follows the right atrioventricular groove around the acute margin down to the crux; includes Acute Marginal branch AM. Camera view rotates to right atrioventricular border.
- **Dynamic Risk Coloring:** Real backend vessel stenosis probabilities dynamically update tube colors (Green `#2E7D32` for non-stenotic, Amber `#B26A00` for borderline 40-49%, Red `#C62828` for stenosis $\ge 50\%$).
- **Interaction & Controls:** 360° orbital drag, mousewheel zoom clamp, preset views (Overview, LAD, LCX, RCA), reset camera framing button, resting pulse rate synchronization.

---

## 5. Quick Start Guide (Windows PowerShell)

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ & npm (tested on Node v25)

### Step 1: Clone or Open Workspace
Open Windows PowerShell in the project directory:
```powershell
cd "c:\Users\MANISHA\OneDrive\Desktop\CardioVista AI"
```

### Step 2: Install Backend Dependencies & Run Tests
```powershell
# Install backend requirements
python -m pip install -r backend/requirements.txt

# Run automated backend test suite
python -m pytest backend/tests
```

### Step 3: Run the FastAPI Backend Server
In PowerShell Terminal 1:
```powershell
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
- API Health Check: `http://127.0.0.1:8000/health`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`

### Step 4: Run the React + Three.js Frontend
In PowerShell Terminal 2:
```powershell
cd frontend
npm install
npm run dev
```
- Open the application in your browser: **`http://127.0.0.1:5173/`**

---

## 6. Project Directory Structure

```text
CardioVista-AI/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI application & REST endpoints
│   │   ├── model_loader.py       # ModelManager, inference & 3D color mapping
│   │   └── schemas.py            # Pydantic v2 validation models
│   ├── data/
│   │   ├── extention_of_Z-Alizadeh_sani_dataset.xlsx  # Verified dataset
│   │   └── dataset_profile.json  # Computed dataset inspection profile
│   ├── models/
│   │   ├── cad_model.joblib      # Trained CAD pipeline artifact
│   │   ├── lad_model.joblib      # Trained LAD pipeline artifact
│   │   ├── lcx_model.joblib      # Trained LCX pipeline artifact
│   │   ├── rca_model.joblib      # Trained RCA pipeline artifact
│   │   ├── metrics.json          # Verified 5-fold CV & holdout metrics
│   │   └── feature_metadata.json # Feature definitions & ranges
│   ├── scripts/
│   │   ├── inspect_dataset.py    # Dataset inspection script
│   │   ├── detailed_feature_analysis.py # Clinical range analysis
│   │   └── train_and_evaluate.py # 5-Fold CV training & evaluation script
│   ├── tests/
│   │   └── test_api.py           # Automated pytest test suite
│   └── requirements.txt          # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ClinicalForm.tsx         # Tabbed patient evaluation form
│   │   │   ├── HeartVisualizer3D.tsx    # Interactive Three.js 3D Heart
│   │   │   ├── PredictionDashboard.tsx  # CAD & vessel stenosis results
│   │   │   ├── ExplainabilityPanel.tsx  # Feature contributions panel
│   │   │   ├── MetricsModal.tsx         # Empirical metrics & confusion matrix
│   │   │   └── MethodologyModal.tsx     # Methodology & safety documentation
│   │   ├── App.tsx                      # Primary application layout
│   │   ├── types.ts                     # TypeScript interfaces
│   │   ├── index.css                    # Design system & glassmorphism CSS
│   │   └── main.tsx                     # React application entrypoint
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── dataset_report.md        # Dataset schema & leakage isolation report
│   ├── model_evaluation.md      # Detailed metrics & model comparisons
│   ├── architecture.md          # Architecture breakdown & Mermaid diagram
│   ├── limitations.md           # Clinical limitations & ethical framework
│   ├── technical_report.md      # Official 6-page hackathon technical report
│   └── youtube_demo_plan.md     # 5-minute video demonstration plan
└── README.md
```

---

## 7. Hackathon Deliverables Checklist

- [x] Complete, runnable source code for backend and frontend
- [x] Verified dataset inspection report (`docs/dataset_report.md`)
- [x] Strict target leakage prevention (`Cath`, `LAD`, `LCX`, `RCA` isolated)
- [x] Real trained models for CAD, LAD, LCX, and RCA (`backend/models/*.joblib`)
- [x] 5-Fold Stratified Cross-Validation + 20% holdout test evaluation (`docs/model_evaluation.md`)
- [x] FastAPI backend with `/health`, `/model-info`, `/metrics`, `/predict`, `/explain`, and `/example-patients`
- [x] Interactive 3D anatomical heart in WebGL with rotation, zoom, vessel presets, and dynamic color glow
- [x] Transparent explainability panel with clinical notes and association vs. causation warnings
- [x] Automated test suite passing with 100% success (`backend/tests/test_api.py`)
- [x] System Architecture diagram (`docs/architecture.md`)
- [x] Six-page technical report (`docs/technical_report.md`)
- [x] YouTube video demonstration plan (`docs/youtube_demo_plan.md`)
- [x] Prominent medical safety disclaimer visible in application and documentation
