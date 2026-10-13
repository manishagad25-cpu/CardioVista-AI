import os
import json
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import StratifiedKFold, train_test_split, cross_validate
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    confusion_matrix, classification_report
)

RANDOM_SEED = 42
DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "extention_of_Z-Alizadeh_sani_dataset.xlsx")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

TARGETS = {
    "CAD": {
        "column": "Cath",
        "pos_label": "CAD",
        "neg_label": "Normal",
        "name": "Coronary Artery Disease (Cath outcome)"
    },
    "LAD": {
        "column": "LAD",
        "pos_label": "Stenotic",
        "neg_label": "Normal",
        "name": "Left Anterior Descending Stenosis"
    },
    "LCX": {
        "column": "LCX",
        "pos_label": "Stenotic",
        "neg_label": "Normal",
        "name": "Left Circumflex Stenosis"
    },
    "RCA": {
        "column": "RCA",
        "pos_label": "Stenotic",
        "neg_label": "Normal",
        "name": "Right Coronary Artery Stenosis"
    }
}

LEAKAGE_TARGET_COLS = ["Cath", "LAD", "LCX", "RCA"]
ZERO_VARIANCE_COLS = ["Exertional CP"]  # Has only 'N'

def load_and_prep_data():
    df = pd.read_excel(DATASET_PATH, sheet_name=0)
    
    # Feature columns (strictly excluding target columns and zero-variance columns)
    feature_cols = [c for c in df.columns if c not in LEAKAGE_TARGET_COLS and c not in ZERO_VARIANCE_COLS]
    
    X = df[feature_cols].copy()
    
    # Separate numeric and categorical columns
    numeric_features = []
    categorical_features = []
    
    for c in feature_cols:
        if pd.api.types.is_numeric_dtype(X[c]):
            # If numeric with few distinct values, could be binary or discrete
            if X[c].nunique() <= 2 and set(X[c].unique()).issubset({0, 1}):
                # Binary 0/1 numeric, can pass through or scale
                numeric_features.append(c)
            else:
                numeric_features.append(c)
        else:
            categorical_features.append(c)
            
    print(f"Total features utilized: {len(feature_cols)}")
    print(f"Numeric features ({len(numeric_features)}): {numeric_features}")
    print(f"Categorical features ({len(categorical_features)}): {categorical_features}")
    
    # Target encodings
    y_dict = {}
    for target_key, tinfo in TARGETS.items():
        col = tinfo["column"]
        pos = tinfo["pos_label"]
        # 1 for positive class, 0 for negative
        y_series = (df[col].astype(str).str.strip() == pos).astype(int)
        y_dict[target_key] = y_series
        print(f"Target '{target_key}' ({col}): Pos ({pos})={y_series.sum()} ({y_series.mean()*100:.1f}%), Neg={len(y_series)-y_series.sum()}")
        
    return df, X, y_dict, numeric_features, categorical_features, feature_cols

def build_preprocessor(numeric_features, categorical_features):
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ]
    )
    return preprocessor

def evaluate_models():
    raw_df, X, y_dict, numeric_features, categorical_features, feature_cols = load_and_prep_data()
    
    results = {}
    best_pipelines = {}
    feature_importances_dict = {}
    
    # Save feature metadata for frontend and API validation
    feature_metadata = {
        "features": feature_cols,
        "numeric_features": numeric_features,
        "categorical_features": categorical_features,
        "feature_details": {}
    }
    
    for c in feature_cols:
        if c in numeric_features:
            feature_metadata["feature_details"][c] = {
                "type": "numeric",
                "min": float(X[c].min()),
                "max": float(X[c].max()),
                "mean": float(round(X[c].mean(), 2)),
                "median": float(round(X[c].median(), 2)),
                "default": float(round(X[c].median(), 2))
            }
        else:
            cats = [str(x) for x in X[c].dropna().unique().tolist()]
            feature_metadata["feature_details"][c] = {
                "type": "categorical",
                "options": cats,
                "default": cats[0]
            }
            
    meta_path = os.path.join(MODELS_DIR, "feature_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(feature_metadata, f, indent=2)
    print(f"Feature metadata saved to {meta_path}")
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)
    
    for target_key, y in y_dict.items():
        print(f"\n==========================================")
        print(f"Training models for target: {target_key}")
        print(f"==========================================")
        
        # 80/20 Stratified Holdout Split for final test evaluation
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, stratify=y, random_state=RANDOM_SEED
        )
        
        # Candidate model definitions
        candidates = {
            "Logistic Regression": LogisticRegression(
                C=0.1, max_iter=1000, class_weight='balanced', random_state=RANDOM_SEED
            ),
            "Random Forest": RandomForestClassifier(
                n_estimators=100, max_depth=5, min_samples_split=4, class_weight='balanced', random_state=RANDOM_SEED
            ),
            "Gradient Boosting": GradientBoostingClassifier(
                n_estimators=80, max_depth=3, learning_rate=0.05, random_state=RANDOM_SEED
            )
        }
        
        target_results = {"cv_scores": {}, "holdout_scores": {}, "model_comparison": {}}
        best_model_name = None
        best_cv_f1 = -1.0
        best_pipeline = None
        
        for name, clf in candidates.items():
            preprocessor = build_preprocessor(numeric_features, categorical_features)
            pipeline = Pipeline(steps=[
                ('preprocessor', preprocessor),
                ('classifier', clf)
            ])
            
            # 5-Fold Stratified Cross-Validation on full training dataset
            scoring = ['accuracy', 'precision', 'recall', 'f1', 'roc_auc']
            cv_results = cross_validate(pipeline, X_train, y_train, cv=cv, scoring=scoring)
            
            mean_cv_acc = float(cv_results['test_accuracy'].mean())
            mean_cv_prec = float(cv_results['test_precision'].mean())
            mean_cv_rec = float(cv_results['test_recall'].mean())
            mean_cv_f1 = float(cv_results['test_f1'].mean())
            mean_cv_auc = float(cv_results['test_roc_auc'].mean())
            
            # Fit on 80% train and evaluate on 20% holdout test
            pipeline.fit(X_train, y_train)
            y_pred = pipeline.predict(X_test)
            y_prob = pipeline.predict_proba(X_test)[:, 1] if hasattr(pipeline, "predict_proba") else None
            
            holdout_acc = float(accuracy_score(y_test, y_pred))
            holdout_prec = float(precision_score(y_test, y_pred, zero_division=0))
            holdout_rec = float(recall_score(y_test, y_pred, zero_division=0))
            holdout_f1 = float(f1_score(y_test, y_pred, zero_division=0))
            holdout_auc = float(roc_auc_score(y_test, y_prob)) if y_prob is not None else None
            
            cm = confusion_matrix(y_test, y_pred).tolist()
            
            target_results["model_comparison"][name] = {
                "cv_5fold": {
                    "accuracy": round(mean_cv_acc, 4),
                    "precision": round(mean_cv_prec, 4),
                    "recall": round(mean_cv_rec, 4),
                    "f1": round(mean_cv_f1, 4),
                    "roc_auc": round(mean_cv_auc, 4)
                },
                "holdout_test": {
                    "accuracy": round(holdout_acc, 4),
                    "precision": round(holdout_prec, 4),
                    "recall": round(holdout_rec, 4),
                    "f1": round(holdout_f1, 4),
                    "roc_auc": round(holdout_auc, 4) if holdout_auc else None,
                    "confusion_matrix": cm
                }
            }
            
            print(f"[{name}] CV F1: {mean_cv_f1:.4f}, AUC: {mean_cv_auc:.4f} | Test F1: {holdout_f1:.4f}, Test AUC: {holdout_auc:.4f}")
            
            # Select best by CV F1 score
            if mean_cv_f1 > best_cv_f1:
                best_cv_f1 = mean_cv_f1
                best_model_name = name
                best_pipeline = pipeline

        print(f"--> Selected Best Model for {target_key}: {best_model_name} (CV F1: {best_cv_f1:.4f})")
        target_results["best_model"] = best_model_name
        target_results["primary_metrics"] = target_results["model_comparison"][best_model_name]["holdout_test"]
        target_results["cv_metrics"] = target_results["model_comparison"][best_model_name]["cv_5fold"]
        
        # Fit the best pipeline on full dataset for production inference
        full_pipeline = Pipeline(steps=[
            ('preprocessor', build_preprocessor(numeric_features, categorical_features)),
            ('classifier', candidates[best_model_name])
        ])
        full_pipeline.fit(X, y)
        
        # Extract feature names after one-hot encoding
        ohe = full_pipeline.named_steps['preprocessor'].named_transformers_['cat']
        encoded_cat_names = list(ohe.get_feature_names_out(categorical_features))
        all_transformed_feature_names = numeric_features + encoded_cat_names
        
        # Extract feature importances or coefficients
        clf = full_pipeline.named_steps['classifier']
        if hasattr(clf, 'feature_importances_'):
            importances = clf.feature_importances_
        elif hasattr(clf, 'coef_'):
            importances = np.abs(clf.coef_[0])
        else:
            importances = np.zeros(len(all_transformed_feature_names))
            
        # Top 15 features by importance
        feat_ranks = sorted(
            zip(all_transformed_feature_names, [float(x) for x in importances]),
            key=lambda x: x[1],
            reverse=True
        )[:20]
        
        feature_importances_dict[target_key] = [
            {"feature": f, "importance": round(imp, 5)} for f, imp in feat_ranks
        ]
        
        # Save pipeline artifact
        artifact_file = os.path.join(MODELS_DIR, f"{target_key.lower()}_model.joblib")
        joblib.dump(full_pipeline, artifact_file)
        print(f"Saved pipeline artifact to {artifact_file}")
        
        results[target_key] = target_results
        
    # Save metrics JSON
    metrics_path = os.path.join(MODELS_DIR, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nAll metrics saved to {metrics_path}")
    
    # Save feature importances
    fi_path = os.path.join(MODELS_DIR, "feature_importances.json")
    with open(fi_path, "w") as f:
        json.dump(feature_importances_dict, f, indent=2)
    print(f"Feature importances saved to {fi_path}")

if __name__ == "__main__":
    evaluate_models()
