import os
import json
import logging
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple

logger = logging.getLogger("cardiovista.model_loader")

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")

TARGET_CONFIG = {
    "CAD": {
        "name": "Coronary Artery Disease (CAD)",
        "file": "cad_model.joblib",
        "pos_label": "CAD Positive",
        "neg_label": "Normal / CAD Negative",
        "description": "Overall evidence of significant coronary stenosis (>= 50%) across major coronary trees."
    },
    "LAD": {
        "name": "Left Anterior Descending (LAD) Stenosis",
        "file": "lad_model.joblib",
        "pos_label": "Stenotic (>= 50%)",
        "neg_label": "Normal (< 50%)",
        "description": "Left anterior descending artery supplying anterior myocardial wall and interventricular septum."
    },
    "LCX": {
        "name": "Left Circumflex (LCX) Stenosis",
        "file": "lcx_model.joblib",
        "pos_label": "Stenotic (>= 50%)",
        "neg_label": "Normal (< 50%)",
        "description": "Left circumflex artery supplying posterolateral left ventricular wall."
    },
    "RCA": {
        "name": "Right Coronary Artery (RCA) Stenosis",
        "file": "rca_model.joblib",
        "pos_label": "Stenotic (>= 50%)",
        "neg_label": "Normal (< 50%)",
        "description": "Right coronary artery supplying right ventricle, inferior wall, and sinoatrial/AV nodal pathways."
    }
}

class ModelManager:
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.feature_metadata: Dict[str, Any] = {}
        self.metrics: Dict[str, Any] = {}
        self.feature_importances: Dict[str, Any] = {}
        self.is_loaded = False
        self.load_artifacts()

    def load_artifacts(self):
        # Load metadata
        meta_path = os.path.join(MODELS_DIR, "feature_metadata.json")
        if os.path.exists(meta_path):
            with open(meta_path, "r") as f:
                self.feature_metadata = json.load(f)

        # Load metrics
        metrics_path = os.path.join(MODELS_DIR, "metrics.json")
        if os.path.exists(metrics_path):
            with open(metrics_path, "r") as f:
                self.metrics = json.load(f)

        # Load feature importances
        fi_path = os.path.join(MODELS_DIR, "feature_importances.json")
        if os.path.exists(fi_path):
            with open(fi_path, "r") as f:
                self.feature_importances = json.load(f)

        # Load models
        loaded_count = 0
        for target, cfg in TARGET_CONFIG.items():
            model_file = os.path.join(MODELS_DIR, cfg["file"])
            if os.path.exists(model_file):
                try:
                    self.models[target] = joblib.load(model_file)
                    loaded_count += 1
                except Exception as e:
                    print(f"Warning: Failed to load model for {target}: {e}")
        self.is_loaded = (loaded_count == len(TARGET_CONFIG))
        print(f"ModelManager: Loaded {loaded_count}/{len(TARGET_CONFIG)} models.")

    def format_input_df(self, patient_dict: Dict[str, Any]) -> pd.DataFrame:
        features = self.feature_metadata.get("features", [])
        
        # Normalize key names from alias or raw format
        normalized = {}
        for k, v in patient_dict.items():
            clean_k = k.replace("_", " ") if " " in k or any(f.replace(" ", "_") == k for f in features) else k
            normalized[k] = v
            normalized[clean_k] = v

        row = {}
        for feat in features:
            if feat in normalized:
                row[feat] = normalized[feat]
            elif feat.replace(" ", "_") in normalized:
                row[feat] = normalized[feat.replace(" ", "_")]
            elif feat.replace("-", "_") in normalized:
                row[feat] = normalized[feat.replace("-", "_")]
            else:
                # Use default from metadata
                default_val = self.feature_metadata.get("feature_details", {}).get(feat, {}).get("default")
                row[feat] = default_val

        return pd.DataFrame([row], columns=features)

    def predict(self, patient_dict: Dict[str, Any]) -> Dict[str, Any]:
        df = self.format_input_df(patient_dict)
        predictions = {}
        stenosis_count = 0

        for target, cfg in TARGET_CONFIG.items():
            if target not in self.models:
                predictions[target] = {
                    "target": target,
                    "target_name": cfg["name"],
                    "predicted_class": -1,
                    "predicted_label": "Model Unavailable",
                    "probability": 0.0,
                    "risk_level": "Unavailable",
                    "model_name": "N/A"
                }
                continue

            pipeline = self.models[target]
            pred_class = int(pipeline.predict(df)[0])
            prob = float(pipeline.predict_proba(df)[0, 1]) if hasattr(pipeline, "predict_proba") else (1.0 if pred_class == 1 else 0.0)

            # Determine risk level
            if prob < 0.35:
                risk_level = "Low"
            elif prob < 0.65:
                risk_level = "Moderate"
            else:
                risk_level = "High"

            if target in ["LAD", "LCX", "RCA"] and pred_class == 1:
                stenosis_count += 1

            best_model_name = self.metrics.get(target, {}).get("best_model", "Pipeline")
            predictions[target] = {
                "target": target,
                "target_name": cfg["name"],
                "predicted_class": pred_class,
                "predicted_label": cfg["pos_label"] if pred_class == 1 else cfg["neg_label"],
                "probability": round(prob, 4),
                "risk_level": risk_level,
                "model_name": best_model_name
            }

        # Anatomical color mapping for 3D Heart Visualization
        # Colors: Green (#10B981) for low risk/normal, Yellow/Amber (#F59E0B) for moderate risk, Red (#EF4444) for stenotic/high risk
        def get_vessel_viz_state(target_key: str):
            p = predictions.get(target_key, {})
            prob = p.get("probability", 0.0)
            is_stenotic = (p.get("predicted_class", 0) == 1)
            if is_stenotic or prob >= 0.60:
                return {
                    "status": "Stenotic",
                    "color": "#EF4444",
                    "emissive": "#7F1D1D",
                    "glow": True,
                    "probability": prob,
                    "risk": "High"
                }
            elif prob >= 0.40:
                return {
                    "status": "Borderline / Moderate",
                    "color": "#F59E0B",
                    "emissive": "#78350F",
                    "glow": False,
                    "probability": prob,
                    "risk": "Moderate"
                }
            else:
                return {
                    "status": "Patent / Normal",
                    "color": "#10B981",
                    "emissive": "#064E3B",
                    "glow": False,
                    "probability": prob,
                    "risk": "Low"
                }

        cad_pred = predictions.get("CAD", {})
        cad_class = cad_pred.get("predicted_class", 0)
        
        summary_text = (
            f"Model predicts {'elevated likelihood of Coronary Artery Disease' if cad_class == 1 else 'low likelihood of primary CAD'}. "
            f"Vessel evaluation indicates {stenosis_count} of 3 main coronary branches (LAD, LCX, RCA) with suspected hemodynamically significant stenosis."
        )

        anatomical_mapping = {
            "overall_cad": {
                "status": "Positive" if cad_class == 1 else "Negative",
                "color": "#EF4444" if cad_class == 1 else "#10B981",
                "probability": cad_pred.get("probability", 0.0)
            },
            "LAD": get_vessel_viz_state("LAD"),
            "LCX": get_vessel_viz_state("LCX"),
            "RCA": get_vessel_viz_state("RCA"),
            "myocardium": {
                "perfusion_defect": (stenosis_count > 0),
                "severity_score": stenosis_count
            }
        }

        return {
            "predictions": predictions,
            "composite_summary": summary_text,
            "vessel_stenosis_count": stenosis_count,
            "anatomical_mapping": anatomical_mapping,
            "disclaimer": "CardioVista AI is an educational and research prototype. Its predictions are not a medical diagnosis and have not been validated for clinical use. Do not use this tool to make medical decisions or delay professional medical care."
        }

    def explain(self, target: str, patient_dict: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        target = target.upper()
        if target not in TARGET_CONFIG:
            target = "CAD"

        global_fi = self.feature_importances.get(target, [])
        model_name = self.metrics.get(target, {}).get("best_model", "Trained Classifier")
        pipe = self.models.get(target)

        clinical_notes = {
            "Typical Chest Pain": "Substernal exertional pressure relieved by rest/nitrates; cornerstone of anginal classification.",
            "Region RWMA": "Echocardiographic regional wall motion abnormality denoting localized ischemic territory.",
            "EF-TTE": "Left ventricular ejection fraction quantifying global systolic pump function.",
            "Age": "Non-modifiable risk factor; progressive arterial stiffening and plaque accumulation.",
            "DM": "Diabetes mellitus accelerates micro- and macro-vascular atherogenesis.",
            "TG": "Serum triglycerides reflect atherogenic triglyceride-rich remnant lipoproteins.",
            "Tinversion": "ECG repolarization abnormality frequently denoting subendocardial ischemia.",
            "HTN": "Chronic hypertension exerts mechanical vascular endothelial shear stress.",
            "FH": "Family history of premature coronary atherosclerosis.",
            "ESR": "Non-specific inflammatory marker; vascular wall chronic inflammatory activity.",
            "Dyspnea": "Exertional shortness of breath often presenting as an anginal equivalent.",
            "Nonanginal": "Non-anginal symptoms correlate negatively with obstructive CAD likelihood."
        }

        # Check if local patient explanation can be computed
        if patient_dict and pipe is not None:
            preprocessor = pipe.named_steps.get("preprocessor")
            classifier = pipe.named_steps.get("classifier")

            # Case A: Logistic Regression (CAD, LCX, RCA) - Exact Linear Log-Odds Decomposition
            if hasattr(classifier, "coef_"):
                try:
                    df = pd.DataFrame([patient_dict])
                    # Exclude target-leakage features
                    for drop_col in ["Cath", "CAD", "LAD", "LCX", "RCA", "Exertional CP"]:
                        if drop_col in df.columns:
                            df = df.drop(columns=[drop_col])

                    X_trans = preprocessor.transform(df)
                    if hasattr(X_trans, "toarray"):
                        X_trans = X_trans.toarray()

                    feat_names = preprocessor.get_feature_names_out()
                    coefs = classifier.coef_[0]
                    local_contributions = coefs * X_trans[0]

                    # Rank features by absolute magnitude of log-odds contribution
                    sorted_indices = np.argsort(np.abs(local_contributions))[::-1]
                    items = []
                    for idx in sorted_indices[:10]:
                        raw_feat_name = feat_names[idx]
                        clean_feat = raw_feat_name.split("__")[-1]
                        base_feat = clean_feat.split("_")[0]

                        # Look up patient input value
                        raw_val = patient_dict.get(clean_feat)
                        if raw_val is None:
                            raw_val = patient_dict.get(base_feat, "N/A")

                        c_score = float(local_contributions[idx])
                        note = clinical_notes.get(base_feat, "Clinical biomarker influencing algorithmic decision boundary.")

                        items.append({
                            "feature": clean_feat,
                            "importance": round(abs(c_score), 4),
                            "input_value": str(raw_val),
                            "direction": "Increases predicted risk (+)" if c_score > 0 else "Decreases predicted risk (-)",
                            "contribution_score": round(c_score, 4),
                            "clinical_note": note
                        })

                    return {
                        "target": target,
                        "target_name": TARGET_CONFIG[target]["name"],
                        "model_name": model_name,
                        "method_name": "Logistic Regression Local Log-Odds Decomposition",
                        "method_explanation": "Additive decomposition of standardized input features multiplied by regression coefficients (β_j · z_j), showing the direction and magnitude shifting log-odds relative to cohort baseline.",
                        "top_contributing_features": items,
                        "interpretation": f"Patient-specific local feature contributions driving the {model_name} prediction for {TARGET_CONFIG[target]['name']}.",
                        "caveat": "Feature contributions reflect statistical associations learned by the algorithm from the Tehran Heart Center cohort and do not establish medical causation."
                    }
                except Exception as e:
                    logger.warning(f"Error computing local log-odds explanation: {e}")

            # Case B: Random Forest (LAD) - Gini Impurity Importance with observed patient values
            elif hasattr(classifier, "feature_importances_"):
                items = []
                for item in global_fi[:10]:
                    feat = item["feature"]
                    clean_feat = feat.split("__")[-1]
                    base_feat = clean_feat.split("_")[0]
                    raw_val = patient_dict.get(clean_feat)
                    if raw_val is None:
                        raw_val = patient_dict.get(base_feat, "N/A")

                    note = clinical_notes.get(base_feat, "Clinical biomarker influencing tree split purity.")
                    items.append({
                        "feature": clean_feat,
                        "importance": item["importance"],
                        "input_value": str(raw_val),
                        "direction": "Global Tree Split Importance",
                        "contribution_score": item["importance"],
                        "clinical_note": note
                    })

                return {
                    "target": target,
                    "target_name": TARGET_CONFIG[target]["name"],
                    "model_name": model_name,
                    "method_name": "Random Forest Gini Impurity Reduction",
                    "method_explanation": "Mean reduction in node impurity across 100 decision trees. Note: Tree ensembles do not admit an exact linear log-odds decomposition; observed patient values are displayed alongside global ensemble importances.",
                    "top_contributing_features": items,
                    "interpretation": f"Top decision-tree split features driving the {model_name} pipeline for {TARGET_CONFIG[target]['name']}.",
                    "caveat": "Feature importances reflect statistical correlations across the training cohort and do not imply pathophysiological causation."
                }

        # Fallback to Global Feature Importances if no patient dictionary provided
        items = []
        for item in global_fi[:10]:
            feat = item["feature"]
            clean_feat = feat.split("__")[-1]
            base_feat = clean_feat.split("_")[0]
            note = clinical_notes.get(base_feat, "Clinical biomarker influencing pipeline predictions.")
            items.append({
                "feature": clean_feat,
                "importance": item["importance"],
                "input_value": "Cohort Baseline",
                "direction": "Global Feature Weight",
                "contribution_score": item["importance"],
                "clinical_note": note
            })

        return {
            "target": target,
            "target_name": TARGET_CONFIG[target]["name"],
            "model_name": model_name,
            "method_name": "Global Pipeline Feature Weight",
            "method_explanation": f"Normalized global feature coefficients/importances learned by {model_name}.",
            "top_contributing_features": items,
            "interpretation": f"Features ranked by global importance in the trained {model_name} pipeline for predicting {TARGET_CONFIG[target]['name']}.",
            "caveat": "Feature importance represents statistical correlation learned from the Tehran Heart Center cohort and does not imply direct medical causation."
        }

# Global singleton
manager = ModelManager()
