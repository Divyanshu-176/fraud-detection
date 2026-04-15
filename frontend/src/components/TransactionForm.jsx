import { useMemo, useState } from "react";
import api from "../api";

const initialForm = {
  transaction_amount: "",
  account_age: "",
  transaction_type: "",
  time_of_transaction: "",
  device_used: "",
  location: "",
  payment_method: "",
  number_of_transactions_last_24h: "",
  previous_fraudulent_transactions: "",
};

const numericFields = [
  { key: "transaction_amount", label: "Transaction Amount", step: "0.01" },
  { key: "account_age", label: "Account Age (months)" },
  {
    key: "number_of_transactions_last_24h",
    label: "Number of Transactions (last 24h)",
  },
  {
    key: "previous_fraudulent_transactions",
    label: "Previous Fraudulent Transactions",
  },
];

const transactionTypeOptions = [
  "ATM Withdrawal",
  "Bank Transfer",
  "Bill Payment",
  "Online Purchase",
  "POS Payment",
];

const deviceOptions = ["Desktop", "Mobile", "Tablet", "Unknown", "Unknown Device"];
const locationOptions = [
  "Boston",
  "Chicago",
  "Houston",
  "Los Angeles",
  "Miami",
  "New York",
  "San Francisco",
  "Seattle",
  "Unknown",
];
const paymentOptions = [
  "Credit Card",
  "Debit Card",
  "Net Banking",
  "UPI",
  "Invalid Method",
  "Unknown",
];

export default function TransactionForm() {
  const [formData, setFormData] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const hourOptions = useMemo(
    () => Array.from({ length: 24 }, (_, h) => String(h)),
    []
  );

  const submitTransaction = async () => {
    try {
      setLoading(true);
      const payload = {
        ...formData,
        transaction_amount: Number(formData.transaction_amount),
        account_age: Number(formData.account_age),
        number_of_transactions_last_24h: Number(formData.number_of_transactions_last_24h),
        previous_fraudulent_transactions: Number(formData.previous_fraudulent_transactions),
      };
      const res = await api.post("/api/transaction", payload);
      setResult(res.data);
    } catch (err) {
      alert(err?.response?.data?.error || "Error submitting transaction");
    } finally {
      setLoading(false);
    }
  };

  const setField = (key) => (e) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl flex flex-col">
      {numericFields.map((field) => (
        <input
          key={field.key}
          className="w-full mb-3 p-2 rounded text-black bg-white"
          type="number"
          step={field.step || "1"}
          placeholder={field.label}
          value={formData[field.key]}
          onChange={setField(field.key)}
        />
      ))}

      <select
        className="w-full mb-3 p-2 rounded text-black bg-white"
        value={formData.transaction_type}
        onChange={setField("transaction_type")}
      >
        <option value="">Select Transaction Type</option>
        {transactionTypeOptions.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>

      <select
        className="w-full mb-3 p-2 rounded text-black bg-white"
        value={formData.time_of_transaction}
        onChange={setField("time_of_transaction")}
      >
        <option value="">Select Time of Transaction (Hour)</option>
        {hourOptions.map((h) => (
          <option key={h} value={h}>
            {h}:00
          </option>
        ))}
      </select>

      <select
        className="w-full mb-3 p-2 rounded text-black bg-white"
        value={formData.device_used}
        onChange={setField("device_used")}
      >
        <option value="">Select Device Used</option>
        {deviceOptions.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>

      <select
        className="w-full mb-3 p-2 rounded text-black bg-white"
        value={formData.location}
        onChange={setField("location")}
      >
        <option value="">Select Location</option>
        {locationOptions.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>

      <select
        className="w-full mb-3 p-2 rounded text-black bg-white"
        value={formData.payment_method}
        onChange={setField("payment_method")}
      >
        <option value="">Select Payment Method</option>
        {paymentOptions.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>

      <button
        onClick={submitTransaction}
        disabled={loading}
        className="w-full bg-blue-600 py-2 rounded font-semibold"
      >
        {loading ? "Processing..." : "Submit Transaction"}
      </button>

      {result && (
        <div className="mt-4 bg-gray-900 p-4 rounded">
          <p>
            Prediction:{" "}
            <b>{result.prediction === 1 ? "Fraudulent" : "Legitimate"}</b>
          </p>
          <p>
            Fraud Probability:{" "}
            <b>{(result.fraud_probability * 100).toFixed(2)}%</b>
          </p>
          <p>
            Risk Level: <b>{result.risk_level}</b>
          </p>
        </div>
      )}
    </div>
  );
}
