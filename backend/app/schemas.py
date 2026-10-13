from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, ConfigDict

class PatientInput(BaseModel):
    # Demographics & Anthropometrics
    Age: float = Field(default=58.0, ge=18.0, le=110.0, description="Age in years")
    Weight: float = Field(default=74.0, ge=30.0, le=250.0, description="Weight in kg")
    Length: float = Field(default=165.0, ge=100.0, le=230.0, description="Height / Length in cm")
    Sex: str = Field(default="Male", description="Sex: Male or Fmale")
    BMI: float = Field(default=27.2, ge=12.0, le=65.0, description="Body Mass Index in kg/m^2")
    
    # Medical History & Risk Factors
    DM: int = Field(default=0, ge=0, le=1, description="Diabetes Mellitus (0: No, 1: Yes)")
    HTN: int = Field(default=1, ge=0, le=1, description="Hypertension (0: No, 1: Yes)")
    Current_Smoker: int = Field(default=0, ge=0, le=1, alias="Current Smoker", description="Current Smoker (0: No, 1: Yes)")
    EX_Smoker: int = Field(default=0, ge=0, le=1, alias="EX-Smoker", description="Ex-Smoker (0: No, 1: Yes)")
    FH: int = Field(default=0, ge=0, le=1, description="Family History of CAD (0: No, 1: Yes)")
    Obesity: str = Field(default="Y", description="Obesity (Y/N)")
    CRF: str = Field(default="N", description="Chronic Renal Failure (Y/N)")
    CVA: str = Field(default="N", description="Cerebrovascular Accident (Y/N)")
    Airway_disease: str = Field(default="N", alias="Airway disease", description="Airway Disease (COPD/Asthma) (Y/N)")
    Thyroid_Disease: str = Field(default="N", alias="Thyroid Disease", description="Thyroid Disease (Y/N)")
    CHF: str = Field(default="N", description="Congestive Heart Failure (Y/N)")
    DLP: str = Field(default="N", description="Dyslipidemia (Y/N)")
    
    # Clinical Signs & Physical Examination
    BP: float = Field(default=130.0, ge=60.0, le=250.0, description="Systolic Blood Pressure (mmHg)")
    PR: float = Field(default=75.0, ge=40.0, le=180.0, description="Pulse Rate (bpm)")
    Edema: int = Field(default=0, ge=0, le=1, description="Peripheral Edema (0: No, 1: Yes)")
    Weak_Peripheral_Pulse: str = Field(default="N", alias="Weak Peripheral Pulse", description="Weak Peripheral Pulse (Y/N)")
    Lung_rales: str = Field(default="N", alias="Lung rales", description="Lung Rales / Crackles (Y/N)")
    Systolic_Murmur: str = Field(default="N", alias="Systolic Murmur", description="Systolic Murmur (Y/N)")
    Diastolic_Murmur: str = Field(default="N", alias="Diastolic Murmur", description="Diastolic Murmur (Y/N)")
    Typical_Chest_Pain: int = Field(default=1, ge=0, le=1, alias="Typical Chest Pain", description="Typical Angina (0: No, 1: Yes)")
    Dyspnea: str = Field(default="N", description="Dyspnea / Shortness of breath (Y/N)")
    Function_Class: int = Field(default=0, ge=0, le=3, alias="Function Class", description="NYHA Functional Class (0-3)")
    
    # Anginal Characteristics
    Atypical: str = Field(default="N", description="Atypical chest pain (Y/N)")
    Nonanginal: str = Field(default="N", description="Non-anginal pain (Y/N)")
    LowTH_Ang: str = Field(default="N", alias="LowTH Ang", description="Low threshold angina (Y/N)")
    
    # Electrocardiography (ECG)
    Q_Wave: int = Field(default=0, ge=0, le=1, alias="Q Wave", description="Pathologic Q Wave (0: No, 1: Yes)")
    St_Elevation: int = Field(default=0, ge=0, le=1, alias="St Elevation", description="ST-segment Elevation (0: No, 1: Yes)")
    St_Depression: int = Field(default=0, ge=0, le=1, alias="St Depression", description="ST-segment Depression (0: No, 1: Yes)")
    Tinversion: int = Field(default=0, ge=0, le=1, description="T-wave Inversion (0: No, 1: Yes)")
    LVH: str = Field(default="N", description="Left Ventricular Hypertrophy (Y/N)")
    Poor_R_Progression: str = Field(default="N", alias="Poor R Progression", description="Poor R Wave Progression (Y/N)")
    BBB: str = Field(default="N", description="Bundle Branch Block (N, LBBB, RBBB)")
    
    # Laboratory Biomarkers
    FBS: float = Field(default=115.0, ge=40.0, le=600.0, description="Fasting Blood Sugar (mg/dL)")
    CR: float = Field(default=1.0, ge=0.2, le=15.0, description="Serum Creatinine (mg/dL)")
    TG: float = Field(default=145.0, ge=20.0, le=2000.0, description="Triglycerides (mg/dL)")
    LDL: float = Field(default=102.0, ge=10.0, le=500.0, description="Low-Density Lipoprotein (mg/dL)")
    HDL: float = Field(default=40.0, ge=5.0, le=150.0, description="High-Density Lipoprotein (mg/dL)")
    BUN: float = Field(default=17.0, ge=2.0, le=150.0, description="Blood Urea Nitrogen (mg/dL)")
    ESR: float = Field(default=18.0, ge=0.0, le=150.0, description="Erythrocyte Sedimentation Rate (mm/hr)")
    HB: float = Field(default=13.2, ge=5.0, le=25.0, description="Hemoglobin (g/dL)")
    K: float = Field(default=4.2, ge=1.5, le=9.0, description="Serum Potassium (mEq/L)")
    Na: float = Field(default=141.0, ge=100.0, le=180.0, description="Serum Sodium (mEq/L)")
    WBC: float = Field(default=7500.0, ge=1000.0, le=50000.0, description="White Blood Cell count (cells/uL)")
    Lymph: float = Field(default=32.0, ge=1.0, le=90.0, description="Lymphocytes percentage (%)")
    Neut: float = Field(default=60.0, ge=5.0, le=98.0, description="Neutrophils percentage (%)")
    PLT: float = Field(default=220.0, ge=10.0, le=1200.0, description="Platelets (x10^3/uL)")
    
    # Echocardiography
    EF_TTE: float = Field(default=48.0, ge=10.0, le=80.0, alias="EF-TTE", description="Ejection Fraction (%)")
    Region_RWMA: int = Field(default=0, ge=0, le=4, alias="Region RWMA", description="Regional Wall Motion Abnormality (0-4)")
    VHD: str = Field(default="mild", description="Valvular Heart Disease (N, mild, Moderate, Severe)")

    model_config = ConfigDict(populate_by_name=True)

class SinglePredictionResult(BaseModel):
    target: str
    target_name: str
    predicted_class: int
    predicted_label: str
    probability: float
    risk_level: str
    model_name: str

class PredictionResponse(BaseModel):
    predictions: Dict[str, SinglePredictionResult]
    composite_summary: str
    vessel_stenosis_count: int
    anatomical_mapping: Dict[str, Any]
    disclaimer: str

class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float
    input_value: Optional[str] = None
    direction: Optional[str] = None
    contribution_score: Optional[float] = None
    clinical_note: Optional[str] = None

class ExplanationResponse(BaseModel):
    target: str
    target_name: str
    model_name: str
    method_name: Optional[str] = None
    method_explanation: Optional[str] = None
    top_contributing_features: List[FeatureImportanceItem]
    interpretation: str
    caveat: str
