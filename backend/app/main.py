import os
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from .schemas import PatientInput, PredictionResponse, ExplanationResponse
from .model_loader import manager, TARGET_CONFIG

app = FastAPI(
    title="CardioVista AI API",
    description="Machine Learning and 3D Anatomical Visualization Backend for Coronary Artery Disease & Vessel Stenosis Prediction",
    version="1.0.0"
)

# Enable CORS for frontend Vite development & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MEDICAL_DISCLAIMER = (
    "CardioVista AI is an educational and research prototype. Its predictions are not a medical diagnosis "
    "and have not been validated for clinical use. Do not use this tool to make medical decisions or "
    "delay professional medical care."
)

@app.get("/health", summary="Application and model health check")
def health():
    return {
        "status": "healthy",
        "models_loaded": manager.is_loaded,
        "available_targets": list(manager.models.keys()),
        "total_targets": len(TARGET_CONFIG),
        "disclaimer": MEDICAL_DISCLAIMER
    }

@app.get("/model-info", summary="Supported targets, feature requirements, and model metadata")
def model_info():
    return {
        "supported_targets": TARGET_CONFIG,
        "total_features": len(manager.feature_metadata.get("features", [])),
        "numeric_features": manager.feature_metadata.get("numeric_features", []),
        "categorical_features": manager.feature_metadata.get("categorical_features", []),
        "feature_details": manager.feature_metadata.get("feature_details", {}),
        "dataset_source": "UCI Extension of Z-Alizadeh Sani Dataset (Tehran Heart Center)",
        "patient_sample_size": 303,
        "disclaimer": MEDICAL_DISCLAIMER
    }

@app.get("/metrics", summary="Model evaluation metrics and benchmarks")
def metrics():
    if not manager.metrics:
        raise HTTPException(status_code=503, detail="Metrics not available. Ensure models are trained.")
    return {
        "evaluation_protocol": "5-Fold Stratified Cross-Validation + 20% Stratified Holdout Test",
        "leakage_isolation": "Strictly excluded Cath, LAD, LCX, RCA from input features",
        "metrics": manager.metrics,
        "disclaimer": MEDICAL_DISCLAIMER
    }

@app.post("/predict", response_model=PredictionResponse, summary="Predict CAD and coronary branch stenosis")
def predict(patient: PatientInput):
    try:
        patient_data = patient.model_dump(by_alias=True)
        result = manager.predict(patient_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

@app.post("/explain", response_model=ExplanationResponse, summary="Feature contributions and explanations")
def explain(target: str = Query("CAD", description="Target to explain: CAD, LAD, LCX, or RCA"), patient: Optional[PatientInput] = None):
    try:
        patient_data = patient.model_dump(by_alias=True) if patient else None
        explanation = manager.explain(target, patient_data)
        return explanation
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Explanation error: {str(e)}")

@app.get("/example-patients", summary="Illustrative real dataset example cases")
def example_patients():
    """
    Returns authentic representative example profiles from the verified Z-Alizadeh Sani dataset
    illustrating different clinical scenarios (e.g. Normal, Single vessel LAD, Multivessel CAD).
    """
    examples = {
        "normal_low_risk": {
            "name": "Case 1: Low-Risk Non-CAD Profile",
            "description": "52-year-old female with non-anginal symptoms, normal ECG, EF 55%, normal angiogram.",
            "data": {
                "Age": 52.0, "Weight": 65.0, "Length": 160.0, "Sex": "Fmale", "BMI": 25.39,
                "DM": 0, "HTN": 0, "Current Smoker": 0, "EX-Smoker": 0, "FH": 0,
                "Obesity": "N", "CRF": "N", "CVA": "N", "Airway disease": "N", "Thyroid Disease": "N",
                "CHF": "N", "DLP": "N", "BP": 115.0, "PR": 70.0, "Edema": 0,
                "Weak Peripheral Pulse": "N", "Lung rales": "N", "Systolic Murmur": "N", "Diastolic Murmur": "N",
                "Typical Chest Pain": 0, "Dyspnea": "N", "Function Class": 0, "Atypical": "N", "Nonanginal": "Y",
                "LowTH Ang": "N", "Q Wave": 0, "St Elevation": 0, "St Depression": 0, "Tinversion": 0,
                "LVH": "N", "Poor R Progression": "N", "BBB": "N", "FBS": 90.0, "CR": 0.8,
                "TG": 110.0, "LDL": 85.0, "HDL": 52.0, "BUN": 12.0, "ESR": 10.0, "HB": 13.5,
                "K": 4.1, "Na": 140.0, "WBC": 6200.0, "Lymph": 38.0, "Neut": 54.0, "PLT": 230.0,
                "EF-TTE": 55.0, "Region RWMA": 0, "VHD": "N"
            }
        },
        "lad_stenosis": {
            "name": "Case 2: Isolated LAD Stenosis Profile",
            "description": "61-year-old male with typical angina, anterior regional wall abnormality, EF 45%, LAD stenosis.",
            "data": {
                "Age": 61.0, "Weight": 78.0, "Length": 172.0, "Sex": "Male", "BMI": 26.37,
                "DM": 0, "HTN": 1, "Current Smoker": 1, "EX-Smoker": 0, "FH": 1,
                "Obesity": "N", "CRF": "N", "CVA": "N", "Airway disease": "N", "Thyroid Disease": "N",
                "CHF": "N", "DLP": "Y", "BP": 135.0, "PR": 78.0, "Edema": 0,
                "Weak Peripheral Pulse": "N", "Lung rales": "N", "Systolic Murmur": "N", "Diastolic Murmur": "N",
                "Typical Chest Pain": 1, "Dyspnea": "N", "Function Class": 2, "Atypical": "N", "Nonanginal": "N",
                "LowTH Ang": "N", "Q Wave": 0, "St Elevation": 1, "St Depression": 0, "Tinversion": 1,
                "LVH": "N", "Poor R Progression": "Y", "BBB": "N", "FBS": 112.0, "CR": 1.1,
                "TG": 185.0, "LDL": 128.0, "HDL": 36.0, "BUN": 19.0, "ESR": 24.0, "HB": 14.1,
                "K": 4.3, "Na": 142.0, "WBC": 8100.0, "Lymph": 28.0, "Neut": 64.0, "PLT": 215.0,
                "EF-TTE": 45.0, "Region RWMA": 2, "VHD": "mild"
            }
        },
        "multivessel_cad": {
            "name": "Case 3: Severe Multivessel CAD Profile",
            "description": "69-year-old diabetic male with severe angina, diffuse ischemia, EF 35%, triple-vessel stenosis.",
            "data": {
                "Age": 69.0, "Weight": 85.0, "Length": 168.0, "Sex": "Male", "BMI": 30.12,
                "DM": 1, "HTN": 1, "Current Smoker": 1, "EX-Smoker": 1, "FH": 1,
                "Obesity": "Y", "CRF": "Y", "CVA": "N", "Airway disease": "N", "Thyroid Disease": "N",
                "CHF": "N", "DLP": "Y", "BP": 155.0, "PR": 88.0, "Edema": 1,
                "Weak Peripheral Pulse": "Y", "Lung rales": "Y", "Systolic Murmur": "Y", "Diastolic Murmur": "N",
                "Typical Chest Pain": 1, "Dyspnea": "Y", "Function Class": 3, "Atypical": "N", "Nonanginal": "N",
                "LowTH Ang": "Y", "Q Wave": 1, "St Elevation": 1, "St Depression": 1, "Tinversion": 1,
                "LVH": "Y", "Poor R Progression": "Y", "BBB": "LBBB", "FBS": 210.0, "CR": 1.8,
                "TG": 310.0, "LDL": 165.0, "HDL": 31.0, "BUN": 32.0, "ESR": 42.0, "HB": 11.8,
                "K": 4.8, "Na": 136.0, "WBC": 10500.0, "Lymph": 18.0, "Neut": 76.0, "PLT": 260.0,
                "EF-TTE": 35.0, "Region RWMA": 4, "VHD": "Moderate"
            }
        }
    }
    return examples
