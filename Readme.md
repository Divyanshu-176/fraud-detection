## Fraud Detection (Full Stack + ML)

This repo contains:
- **`ml-service/`**: Flask ML API (`/predict`) that trains a hybrid fraud model from the provided CSV and serves supervised + anomaly-aware risk scores.
- **`backend/`**: Node/Express API that calls the ML service, stores transactions in MongoDB, exposes dashboard analytics, and runs transaction simulations.
- **`frontend/`**: React dashboard with manual scoring, live analytics, generated traffic controls, and visual charts.

For a **short comparison of CI/CD, Jenkins, Docker, containers, webhooks, and ngrok** — and how to **demonstrate** them with this repo — see [`docs/DEMONSTRATION.md`](docs/DEMONSTRATION.md).

**Expose the app on the internet with ngrok** (step-by-step for others to open your URL): [`docs/NGROK-PUBLIC-ACCESS.md`](docs/NGROK-PUBLIC-ACCESS.md).

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

Set **`SHARED_ANALYTICS=false`** on the backend if every GitHub user should only see their own transactions. Default in Docker is **`true`** so all clients share the same analytics window (multi-viewer demos).

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

## Docker (WSL / Linux engine)

The compose file runs **ML service**, **backend**, and **frontend (nginx)**. It does **not** start Mongo or Jenkins — use your existing Mongo container (or host) and keep Jenkins separate.

### What you need to do

1. **MongoDB** must accept connections from Docker. Easiest: Mongo already published on the host as `-p 27017:27017` (default). The backend uses `host.docker.internal` (see `docker-compose.yml` + `extra_hosts`).
2. **Copy env file:** `cp env.docker.example .env` and set at least `JWT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`. Match **GitHub OAuth** “Authorization callback URL” to `GITHUB_CALLBACK_URL` (default `http://localhost:8080/auth/github/callback` when using the compose UI on port **8080**).
3. **Build & run** from the repo root:

```bash
docker compose up --build
```

4. Open **`http://localhost:8080`** for the app (nginx proxies `/api` and `/auth` to the backend). Backend alone is still on **`http://localhost:5000`** if you need it directly.

The ML image **trains during `docker build`** from `ml-service/Fraud Detection Dataset.csv`, so the first build may take a few minutes.

### Jenkins (optional)

A minimal `Jenkinsfile` runs `docker compose build`. Point your Jenkins job at this repo and ensure the Jenkins agent has the **Docker CLI** and permission to talk to your engine (e.g. mount `/var/run/docker.sock` into the Jenkins container). Webhooks/ngrok are configured in GitHub + Jenkins UI, not in this repo.

---

## Notes

- `ml-service/fraud_detection_model.pkl` is **ignored by git** (it’s generated locally by training). The **Docker build** generates it inside the image from the CSV.
- Categorical inputs are sent as **human-readable labels** (dropdowns) and encoded inside ML service.
- When running the Python service locally in WSL, use the virtual environment at `ml-service/.venv`.

