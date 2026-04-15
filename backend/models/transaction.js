const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  model_input: {
    transaction_amount: Number,
    transaction_type: Number,
    time_of_transaction: Number,
    device_used: Number,
    location: Number,
    previous_fraudulent_transactions: Number,
    account_age: Number,
    number_of_transactions_last_24h: Number,
    payment_method: Number,
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
