import pandas as pd
import joblib

from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)


# ========================================
# FILE PATHS
# ========================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATASET_PATH = (
    BASE_DIR
    / "payment_simulator"
    / "training_data.csv"
)

MODEL_PATH = (
    Path(__file__).resolve().parent
    / "recovery_priority_model.pkl"
)

FEATURE_IMPORTANCE_PATH = (
    Path(__file__).resolve().parent
    / "feature_importance.csv"
)


# ========================================
# LOAD DATASET
# ========================================

print("\n========================================")
print("       AI RECOVERY PRIORITY MODEL")
print("========================================")

print("\nLoading training dataset...")

data = pd.read_csv(DATASET_PATH)

print(f"Training examples loaded: {len(data)}")


# ========================================
# DATASET INFORMATION
# ========================================

print("\n----------------------------------------")
print("DATASET INFORMATION")
print("----------------------------------------")

print(f"Total examples       : {len(data)}")
print("Dataset type         : Synthetic")
print("Source               : Payment simulator")

print(
    "\nLimitation:"
    "\nThis dataset is synthetic and generated from simulated"
    "\npayment scenarios. Therefore, model performance on this"
    "\ndataset may not represent performance on real-world"
    "\npayment traffic or customer recovery behavior."
)


# ========================================
# DISPLAY DATASET
# ========================================

print("\n----------------------------------------")
print("DATASET PREVIEW")
print("----------------------------------------")

print(data.head())


# ========================================
# FEATURES AND TARGET
# ========================================

features = [
    "payment_amount",
    "available_balance",
    "failure_reason",
    "payment_method",
    "attempt_number"
]

target = "priority"

X = data[features]
y = data[target]


# ========================================
# TARGET DISTRIBUTION
# ========================================

print("\n----------------------------------------")
print("PRIORITY DISTRIBUTION")
print("----------------------------------------")

print(
    y.value_counts()
)


# ========================================
# TRAIN / TEST SPLIT
# ========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\n----------------------------------------")
print("HELD-OUT DATASET SPLIT")
print("----------------------------------------")

print(f"Training examples : {len(X_train)}")
print(f"Test examples     : {len(X_test)}")

print(
    "\nThe test set is held out from training and is used"
    "\nto evaluate model performance."
)


# ========================================
# CATEGORICAL FEATURES
# ========================================

categorical_features = [
    "failure_reason",
    "payment_method"
]


# ========================================
# PREPROCESSING
# ========================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        )
    ],
    remainder="passthrough"
)


# ========================================
# RANDOM FOREST MODEL
# ========================================

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)


# ========================================
# CREATE ML PIPELINE
# ========================================

pipeline = Pipeline(
    steps=[
        (
            "preprocessor",
            preprocessor
        ),
        (
            "model",
            model
        )
    ]
)


# ========================================
# TRAIN MODEL
# ========================================

print("\n----------------------------------------")
print("TRAINING MODEL")
print("----------------------------------------")

print("\nTraining Random Forest...")

pipeline.fit(
    X_train,
    y_train
)

print("AI model training completed successfully.")


# ========================================
# TEST MODEL
# ========================================

print("\n----------------------------------------")
print("HELD-OUT TEST EVALUATION")
print("----------------------------------------")

predictions = pipeline.predict(X_test)


# ========================================
# ACCURACY
# ========================================

accuracy = accuracy_score(
    y_test,
    predictions
)

print(
    f"\nOverall Accuracy: {accuracy:.2%}"
)


# ========================================
# PRECISION / RECALL / F1
# ========================================

print("\n----------------------------------------")
print("PER-CLASS PERFORMANCE")
print("----------------------------------------")

report = classification_report(
    y_test,
    predictions,
    labels=["HIGH", "MEDIUM", "LOW"],
    target_names=["HIGH", "MEDIUM", "LOW"],
    digits=4,
    zero_division=0
)

print(report)


# ========================================
# CONFUSION MATRIX
# ========================================

print("----------------------------------------")
print("CONFUSION MATRIX")
print("----------------------------------------")

labels = ["HIGH", "MEDIUM", "LOW"]

matrix = confusion_matrix(
    y_test,
    predictions,
    labels=labels
)

confusion_df = pd.DataFrame(
    matrix,
    index=[f"Actual {label}" for label in labels],
    columns=[f"Predicted {label}" for label in labels]
)

print(confusion_df)


# ========================================
# FEATURE IMPORTANCE
# ========================================

print("\n----------------------------------------")
print("FEATURE IMPORTANCE")
print("----------------------------------------")

# Get the trained Random Forest
trained_model = pipeline.named_steps["model"]

# Get transformed feature names
feature_names = (
    pipeline
    .named_steps["preprocessor"]
    .get_feature_names_out()
)

importances = trained_model.feature_importances_


# ----------------------------------------
# Map encoded features back to original
# business features
# ----------------------------------------

feature_importance = {
    "payment_amount": 0.0,
    "available_balance": 0.0,
    "failure_reason": 0.0,
    "payment_method": 0.0,
    "attempt_number": 0.0
}


for feature_name, importance in zip(
    feature_names,
    importances
):

    # Numeric features
    if feature_name.endswith("payment_amount"):
        feature_importance["payment_amount"] += importance

    elif feature_name.endswith("available_balance"):
        feature_importance["available_balance"] += importance

    elif feature_name.endswith("attempt_number"):
        feature_importance["attempt_number"] += importance

    # One-hot encoded categorical features
    elif "failure_reason" in feature_name:
        feature_importance["failure_reason"] += importance

    elif "payment_method" in feature_name:
        feature_importance["payment_method"] += importance


# ----------------------------------------
# Create feature importance DataFrame
# ----------------------------------------

importance_df = pd.DataFrame(
    {
        "feature": list(feature_importance.keys()),
        "importance": list(feature_importance.values())
    }
)

importance_df = importance_df.sort_values(
    by="importance",
    ascending=False
).reset_index(drop=True)


# Convert to percentage
importance_df["importance_percentage"] = (
    importance_df["importance"] * 100
)


# ----------------------------------------
# Display feature importance
# ----------------------------------------

for _, row in importance_df.iterrows():

    print(
        f"{row['feature']:<20} "
        f"{row['importance_percentage']:.2f}%"
    )


# ========================================
# SAVE FEATURE IMPORTANCE
# ========================================

importance_df.to_csv(
    FEATURE_IMPORTANCE_PATH,
    index=False
)

print(
    "\nFeature importance saved successfully:"
)

print(
    FEATURE_IMPORTANCE_PATH
)


# ========================================
# SAVE MODEL
# ========================================

joblib.dump(
    pipeline,
    MODEL_PATH
)

print(
    "\n----------------------------------------"
)

print(
    "AI model saved successfully:"
)

print(
    MODEL_PATH
)


# ========================================
# FINAL SUMMARY
# ========================================

print("\n========================================")
print("           MODEL SUMMARY")
print("========================================")

print(
    f"Dataset size       : {len(data)}"
)

print(
    f"Training samples   : {len(X_train)}"
)

print(
    f"Held-out test set  : {len(X_test)}"
)

print(
    f"Overall accuracy   : {accuracy:.2%}"
)

print(
    "Dataset type       : Synthetic"
)

print(
    "\nModel rigor evaluation completed."
)

print(
    "========================================\n"
)