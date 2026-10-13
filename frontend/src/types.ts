export interface PatientInput {
  Age: number;
  Weight: number;
  Length: number;
  Sex: string;
  BMI: number;
  DM: number;
  HTN: number;
  "Current Smoker": number;
  "EX-Smoker": number;
  FH: number;
  Obesity: string;
  CRF: string;
  CVA: string;
  "Airway disease": string;
  "Thyroid Disease": string;
  CHF: string;
  DLP: string;
  BP: number;
  PR: number;
  Edema: number;
  "Weak Peripheral Pulse": string;
  "Lung rales": string;
  "Systolic Murmur": string;
  "Diastolic Murmur": string;
  "Typical Chest Pain": number;
  Dyspnea: string;
  "Function Class": number;
  Atypical: string;
  Nonanginal: string;
  "LowTH Ang": string;
  "Q Wave": number;
  "St Elevation": number;
  "St Depression": number;
  Tinversion: number;
  LVH: string;
  "Poor R Progression": string;
  BBB: string;
  FBS: number;
  CR: number;
  TG: number;
  LDL: number;
  HDL: number;
  BUN: number;
  ESR: number;
  HB: number;
  K: number;
  Na: number;
  WBC: number;
  Lymph: number;
  Neut: number;
  PLT: number;
  "EF-TTE": number;
  "Region RWMA": number;
  VHD: string;
}

export interface SinglePredictionResult {
  target: string;
  target_name: string;
  predicted_class: number;
  predicted_label: string;
  probability: number;
  risk_level: "Low" | "Moderate" | "High";
  model_name: string;
}

export interface VesselVizState {
  status: string;
  color: string;
  emissive: string;
  glow: boolean;
  probability: number;
  risk: "Low" | "Moderate" | "High";
}

export interface AnatomicalMapping {
  overall_cad: {
    status: string;
    color: string;
    probability: number;
  };
  LAD: VesselVizState;
  LCX: VesselVizState;
  RCA: VesselVizState;
  myocardium: {
    perfusion_defect: boolean;
    severity_score: number;
  };
}

export interface PredictionResponse {
  predictions: {
    CAD: SinglePredictionResult;
    LAD: SinglePredictionResult;
    LCX: SinglePredictionResult;
    RCA: SinglePredictionResult;
  };
  composite_summary: string;
  vessel_stenosis_count: number;
  anatomical_mapping: AnatomicalMapping;
  disclaimer: string;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
  input_value?: string;
  direction?: string;
  contribution_score?: number;
  clinical_note?: string;
}

export interface ExplanationResponse {
  target: string;
  target_name: string;
  model_name: string;
  method_name?: string;
  method_explanation?: string;
  top_contributing_features: FeatureImportanceItem[];
  interpretation: string;
  caveat: string;
}

export interface MetricsData {
  evaluation_protocol: string;
  leakage_isolation: string;
  metrics: {
    [key: string]: {
      best_model: string;
      primary_metrics: {
        accuracy: number;
        precision: number;
        recall: number;
        f1: number;
        roc_auc: number;
        confusion_matrix: number[][];
      };
      cv_metrics: {
        accuracy: number;
        precision: number;
        recall: number;
        f1: number;
        roc_auc: number;
      };
      model_comparison: {
        [modelName: string]: {
          cv_5fold: {
            accuracy: number;
            precision: number;
            recall: number;
            f1: number;
            roc_auc: number;
          };
          holdout_test: {
            accuracy: number;
            precision: number;
            recall: number;
            f1: number;
            roc_auc: number;
            confusion_matrix: number[][];
          };
        };
      };
    };
  };
  disclaimer: string;
}

export interface PatientExample {
  name: string;
  description: string;
  data: PatientInput;
}
