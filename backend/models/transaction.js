const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  model_input: {
    transaction_amount: Number,
    account_age: Number,
    transaction_type: String,
    time_of_transaction: String,
    device_used: String,
    location: String,
    payment_method: String,
    number_of_transactions_last_24h: Number,
    previous_fraudulent_transactions: Number,
  },
  prediction: Number,
  fraud_score: Number,
  risk_level: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Transaction", transactionSchema);
