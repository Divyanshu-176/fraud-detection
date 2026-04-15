from __future__ import annotations

from pathlib import Path
import pickle

import pandas as pd
from flask import Flask, jsonify, request


MODEL_PATH = Path(__file__).parent / "fraud_detection_model.pkl"

app = Flask(__name__)


def load_artifact():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            "Model file not found. Run `python3 train_model.py` first."
        )
    with MODEL_PATH.open("rb") as f:
        return pickle.load(f)


artifact = load_artifact()
model = artifact["model"]
imputer = artifact["imputer"]
feature_columns = artifact["feature_columns"]
categorical_columns = set(artifact.get("categorical_columns", []))
label_encoders = artifact.get("label_encoders", {})


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True) or {}

    required_fields = [
        "transaction_amount",
        "account_age",
        "transaction_type",
        "time_of_transaction",
        "device_used",
        "location",
        "payment_method",
        "number_of_transactions_last_24h",
        "previous_fraudulent_transactions",
    ]

    missing_fields = [f for f in required_fields if payload.get(f) in (None, "")]
    if missing_fields:
        return (
            jsonify(
                {
                    "error": "Missing required fields",
                    "missing_fields": missing_fields,
                }
            ),
            400,
        )

    # Accept human labels for categoricals, encode using saved LabelEncoders.
    def encode(col_name: str, value):
        if col_name not in categorical_columns:
            return float(value)
        le = label_encoders.get(col_name)
        if le is None:
            return float(value)
        s = str(value) if value is not None else "Unknown"
        if s not in le.classes_:
            s = "Unknown" if "Unknown" in le.classes_ else le.classes_[0]
        return float(le.transform([s])[0])

    row = {
        "Transaction_Amount": float(payload["transaction_amount"]),
        "Account_Age": float(payload["account_age"]),
        "Number_of_Transactions_Last_24H": float(payload["number_of_transactions_last_24h"]),
        "Previous_Fraudulent_Transactions": float(payload["previous_fraudulent_transactions"]),
        "Transaction_Type": encode("Transaction_Type", payload["transaction_type"]),
        "Time_of_Transaction": encode("Time_of_Transaction", payload["time_of_transaction"]),
        "Device_Used": encode("Device_Used", payload["device_used"]),
        "Location": encode("Location", payload["location"]),
        "Payment_Method": encode("Payment_Method", payload["payment_method"]),
    }

    input_df = pd.DataFrame([row])[feature_columns]
    transformed = imputer.transform(input_df)

    prediction = int(model.predict(transformed)[0])
    fraud_probability = float(model.predict_proba(transformed)[0][1])

    risk_level = "Low"
    if fraud_probability > 0.7:
        risk_level = "High"
    elif fraud_probability > 0.3:
        risk_level = "Medium"

    return jsonify(
        {
            "prediction": prediction,
            "fraud_probability": fraud_probability,
            "risk_level": risk_level,
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
