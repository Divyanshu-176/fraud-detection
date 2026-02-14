const express = require("express");
const axios = require("axios");
const Transaction = require("../models/transaction");
const auth = require("../middleware/middleware");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { amount, location, device } = req.body;

  // // Call ML service
  // const mlResponse = await axios.post(process.env.ML_SERVICE_URL, {
  //   amount,
  //   location,
  //   device
  // });

  const fraud_score = 0.8  //mlResponse.data.fraud_score;

  let risk_level = "Low";
  if (fraud_score > 0.7) risk_level = "High";
  else if (fraud_score > 0.3) risk_level = "Medium";

  await Transaction.create({
    userId: req.user.id,
    amount,
    location,
    device,
    fraud_score,
    risk_level
  });

  res.json({
    fraud_probability: fraud_score,
    risk_level
  });
});

module.exports = router;
