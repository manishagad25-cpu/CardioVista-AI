import os
import json
import pandas as pd
import numpy as np

DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "extention_of_Z-Alizadeh_sani_dataset.xlsx")

def inspect_dataset():
    if not os.path.exists(DATASET_PATH):
        print(f"ERROR: Dataset not found at {DATASET_PATH}")
        return

    # 1. Inspect sheet names
    excel_file = pd.ExcelFile(DATASET_PATH)
    print(f"Sheet names found: {excel_file.sheet_names}")
    
    # Read the first sheet
    df = pd.read_excel(DATASET_PATH, sheet_name=excel_file.sheet_names[0])
    
    print(f"\n--- DATASET OVERVIEW ---")
    print(f"Row count: {df.shape[0]}")
    print(f"Column count: {df.shape[1]}")
    
    print("\n--- ALL COLUMN NAMES ---")
    for idx, col in enumerate(df.columns):
        print(f"{idx+1}. '{col}' (dtype: {df[col].dtype})")
        
    print("\n--- TARGET CANDIDATE COLUMNS CHECK ---")
    target_names = ["Cath", "CAD", "LAD", "LCX", "RCA"]
    found_targets = {}
    for target in target_names:
        matches = [col for col in df.columns if col.strip().lower() == target.lower()]
        if matches:
            found_targets[target] = matches[0]
            val_counts = df[matches[0]].value_counts(dropna=False).to_dict()
            print(f"Target '{target}' matched column '{matches[0]}': {val_counts}")
        else:
            print(f"Target '{target}' NOT explicitly matched. Checking substring matches...")
            sub_matches = [col for col in df.columns if target.lower() in col.lower()]
            print(f"Substrings matching '{target}': {sub_matches}")

    # Check missing values
    missing = df.isnull().sum()
    missing_cols = missing[missing > 0]
    print("\n--- MISSING VALUES ---")
    if missing_cols.empty:
        print("No missing values found across all columns.")
    else:
        print(missing_cols)
        
    # Check duplicates
    duplicate_count = df.duplicated().sum()
    print(f"\nDuplicate rows: {duplicate_count}")
    
    # Inspect categorical vs numerical
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()
    print(f"\nNumerical columns count: {len(numeric_cols)}")
    print(f"Categorical columns count: {len(categorical_cols)}")
    
    # Analyze unique values of categoricals
    cat_summary = {}
    for c in categorical_cols:
        unique_vals = df[c].dropna().unique().tolist()
        cat_summary[c] = {
            "num_unique": len(unique_vals),
            "sample_values": unique_vals[:5]
        }
    
    print("\n--- CATEGORICAL SUMMARY (FIRST 10) ---")
    for c, info in list(cat_summary.items())[:10]:
        print(f"'{c}': {info['num_unique']} unique -> {info['sample_values']}")
        
    # Check relationship between Cath and CAD
    if "Cath" in found_targets and "CAD" in found_targets:
        cath_col = found_targets["Cath"]
        cad_col = found_targets["CAD"]
        print("\n--- CATH vs CAD CROSS TABULATION ---")
        print(pd.crosstab(df[cath_col], df[cad_col], dropna=False))
        
    # Save inspection data to JSON for documentation and report generation
    report_data = {
        "shape": list(df.shape),
        "columns": df.columns.tolist(),
        "dtypes": {c: str(df[c].dtype) for c in df.columns},
        "target_distributions": {t: df[found_targets[t]].value_counts(dropna=False).to_dict() for t in found_targets},
        "missing_values": missing_cols.to_dict(),
        "duplicate_rows": int(duplicate_count),
        "numerical_columns": numeric_cols,
        "categorical_columns": categorical_cols,
        "categorical_unique_counts": {c: int(df[c].nunique()) for c in categorical_cols}
    }
    
    os.makedirs(os.path.join(os.path.dirname(__file__), "..", "data"), exist_ok=True)
    out_json = os.path.join(os.path.dirname(__file__), "..", "data", "dataset_profile.json")
    with open(out_json, "w") as f:
        json.dump(report_data, f, indent=2)
    print(f"\nDataset profile saved to {out_json}")

if __name__ == "__main__":
    inspect_dataset()
