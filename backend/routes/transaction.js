const express = require("express");
const axios = require("axios");
const Transaction = require("../models/transaction");
const auth = require("../middleware/middleware");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const requiredFields = [
    "transaction_amount",
    "account_age",
    "transaction_type",
    "time_of_transaction",
    "device_used",
    "location",
    "payment_method",
    "number_of_transactions_last_24h",
    "previous_fraudulent_transactions",
  ];

  const missing = requiredFields.filter((field) => req.body[field] === undefined);
  if (missing.length > 0) {
    return res.status(400).json({
      error: "Missing required fields",
      missing_fields: missing,
    });
  }

  const payload = {
    transaction_amount: Number(req.body.transaction_amount),
    account_age: Number(req.body.account_age),
    number_of_transactions_last_24h: Number(req.body.number_of_transactions_last_24h),
    previous_fraudulent_transactions: Number(req.body.previous_fraudulent_transactions),
    transaction_type: String(req.body.transaction_type),
    time_of_transaction: String(req.body.time_of_transaction),
    device_used: String(req.body.device_used),
    location: String(req.body.location),
    payment_method: String(req.body.payment_method),
  };

  const numericFields = [
    "transaction_amount",
    "account_age",
    "number_of_transactions_last_24h",
    "previous_fraudulent_transactions",
  ];
  for (const f of numericFields) {
    if (Number.isNaN(payload[f])) {
      return res.status(400).json({ error: `Invalid numeric value for field ${f}` });
    }
  }

  try {
    const mlResponse = await axios.post(process.env.ML_SERVICE_URL, payload);
    const {
      prediction = 0,
      fraud_probability = 0,
      risk_level = "Low",
    } = mlResponse.data || {};

    await Transaction.create({
      userId: req.user.id,
      model_input: payload,
      prediction,
      fraud_score: fraud_probability,
      risk_level,
    });

    return res.json({
      prediction,
      fraud_probability,
      risk_level,
    });
  } catch (error) {
    const statusCode = error.response?.status || 500;
    const details = error.response?.data || { error: "ML service unavailable" };
    return res.status(statusCode).json(details);
  }
});

module.exports = router;
