const express = require("express");
const axios = require("axios");
const Transaction = require("../models/transaction");
const auth = require("../middleware/middleware");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const requiredFields = [
    "transaction_amount",
    "transaction_type",
    "time_of_transaction",
    "device_used",
    "location",
    "previous_fraudulent_transactions",
    "account_age",
    "number_of_transactions_last_24h",
    "payment_method",
  ];

  const missing = requiredFields.filter((field) => req.body[field] === undefined);
  if (missing.length > 0) {
    return res.status(400).json({
      error: "Missing required fields",
      missing_fields: missing,
    });
  }

  const payload = {};
  for (const field of requiredFields) {
    const value = Number(req.body[field]);
    if (Number.isNaN(value)) {
      return res.status(400).json({
        error: `Invalid numeric value for field ${field}`,
      });
    }
    payload[field] = value;
  }

  try {
    const mlResponse = await axios.post(process.env.ML_SERVICE_URL, payload);
    const {
      prediction = 0,
      fraud_probability = 0,
      risk_level = "Low",
    } = mlResponse.data;

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
