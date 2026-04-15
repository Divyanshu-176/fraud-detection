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

request_to_feature_map = {
    "transaction_amount": "Transaction_Amount",
    "transaction_type": "Transaction_Type",
    "time_of_transaction": "Time_of_Transaction",
    "device_used": "Device_Used",
    "location": "Location",
    "previous_fraudulent_transactions": "Previous_Fraudulent_Transactions",
    "account_age": "Account_Age",
    "number_of_transactions_last_24h": "Number_of_Transactions_Last_24H",
    "payment_method": "Payment_Method",
}


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True) or {}

    missing_fields = [
        field for field in request_to_feature_map if payload.get(field) is None
    ]
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

    row = {}
    for request_key, feature_key in request_to_feature_map.items():
        try:
            row[feature_key] = float(payload[request_key])
        except (TypeError, ValueError):
            return (
                jsonify({"error": f"Invalid numeric value for field `{request_key}`"}),
                400,
            )

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
