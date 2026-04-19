## Fraud Detection (Full Stack + ML)

This repo contains:
- **`ml-service/`**: Flask ML API (`/predict`) that trains a hybrid fraud model from the provided CSV and serves supervised + anomaly-aware risk scores.
- **`backend/`**: Node/Express API that calls the ML service, stores transactions in MongoDB, exposes dashboard analytics, and runs transaction simulations.
- **`frontend/`**: React dashboard with manual scoring, live analytics, generated traffic controls, and visual charts.

---

## Quickstart (Local)

### 1) Start MongoDB

If you already have Mongo running locally on `mongodb://localhost:27017`, skip this.

With Docker:

```bash
docker run --name mongo -p 27017:27017 -d mongo
```

---

### 2) Start ML service (Flask)

```bash
cd ml-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Train + create local artifact (NOT committed to git)
# python3 train_model.py

# Start API on :8000
python3 app.py
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Predict example:

```bash
curl -X POST http://127.0.0.1:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_amount": 1292.76,
    "account_age": 119,
    "transaction_type": "ATM Withdrawal",
    "time_of_transaction": "16",
    "device_used": "Tablet",
    "location": "San Francisco",
    "payment_method": "Debit Card",
    "number_of_transactions_last_24h": 13,
    "previous_fraudulent_transactions": 0
  }'
```

---

### 3) Start backend (Node/Express)

```bash
cd backend
npm install
npm start
```

Backend uses `ML_SERVICE_URL` from `backend/.env` (default: `http://localhost:8000/predict`).

---

### 4) Start frontend (React/Vite)

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`), login, then submit a transaction from the dashboard.

---

## Version 2 Features

- Manual transaction scoring with hybrid risk output.
- Simulation control to generate 100-1000 scored transactions over a chosen duration.
- Dashboard analytics for fraud rate, risk distribution, payment methods, locations, and score trend.
- Recent transaction feed with source, score, risk level, and reason codes.

---

## Notes

- `ml-service/fraud_detection_model.pkl` is **ignored by git** (it’s generated locally by training).
- Categorical inputs are sent as **human-readable labels** (dropdowns) and encoded inside ML service.
- When running the Python service in WSL, use the local virtual environment at `ml-service/.venv`.

