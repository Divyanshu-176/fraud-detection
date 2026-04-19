# Train model from bundled CSV, then run API (no host .pkl required)
FROM python:3.12-slim AS trainer
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY train_model.py .
COPY ["Fraud Detection Dataset.csv", "./"]
RUN python train_model.py

FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
COPY --from=trainer /app/fraud_detection_model.pkl .
ENV FLASK_DEBUG=0
ENV PORT=8000
EXPOSE 8000
CMD ["python", "app.py"]
