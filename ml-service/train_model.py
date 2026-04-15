from pathlib import Path
import pickle

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split


DATASET_PATH = Path(__file__).parent / "Fraud Detection Dataset.csv"
MODEL_PATH = Path(__file__).parent / "fraud_detection_model.pkl"

TARGET_COLUMN = "Fraudulent"
DROP_COLUMNS = ["Transaction_ID", "User_ID"]
FEATURE_COLUMNS = [
    "Transaction_Amount",
    "Transaction_Type",
    "Time_of_Transaction",
    "Device_Used",
    "Location",
    "Previous_Fraudulent_Transactions",
    "Account_Age",
    "Number_of_Transactions_Last_24H",
    "Payment_Method",
]


def train_and_save_model() -> None:
    df = pd.read_csv(DATASET_PATH)
    df = df.drop(columns=DROP_COLUMNS, errors="ignore")

    # The notebook model uses these exact features.
    X = df[FEATURE_COLUMNS].copy()
    y = df[TARGET_COLUMN].copy()

    for col in FEATURE_COLUMNS:
        X[col] = pd.to_numeric(X[col], errors="coerce")

    imputer = SimpleImputer(strategy="median")
    X_imputed = imputer.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_imputed,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        n_jobs=-1,
        class_weight="balanced",
    )
    model.fit(X_train, y_train)

    accuracy = model.score(X_test, y_test)

    artifact = {
        "model": model,
        "imputer": imputer,
        "feature_columns": FEATURE_COLUMNS,
        "accuracy": accuracy,
    }

    with MODEL_PATH.open("wb") as f:
        pickle.dump(artifact, f)

    print(f"Model trained and saved to: {MODEL_PATH}")
    print(f"Validation accuracy: {accuracy:.4f}")


if __name__ == "__main__":
    train_and_save_model()
