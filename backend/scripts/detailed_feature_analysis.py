import os
import pandas as pd

DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "extention_of_Z-Alizadeh_sani_dataset.xlsx")
df = pd.read_excel(DATASET_PATH, sheet_name=0)

target_cols = ["Cath", "LAD", "LCX", "RCA"]
feature_cols = [c for c in df.columns if c not in target_cols]

print(f"Total features: {len(feature_cols)}")
for col in feature_cols:
    dtype = df[col].dtype
    nunique = df[col].nunique()
    if nunique <= 10:
        val_counts = df[col].value_counts().to_dict()
        print(f"[CAT/DISC] {col} (n={nunique}): {val_counts}")
    else:
        min_v = df[col].min()
        max_v = df[col].max()
        mean_v = df[col].mean()
        print(f"[NUM] {col}: min={min_v}, max={max_v}, mean={mean_v:.2f}")
