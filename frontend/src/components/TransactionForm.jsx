import { useState } from "react";
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
    label: "Number of Transactions Last 24H",
  },
  {
    key: "previous_fraudulent_transactions",
    label: "Previous Fraudulent Transactions",
  },
];

const selectFields = [
  {
    key: "transaction_type",
    label: "Transaction Type",
    options: [
      { value: "0", label: "ATM Withdrawal (0)" },
      { value: "1", label: "Bank Transfer (1)" },
      { value: "2", label: "Bill Payment (2)" },
      { value: "3", label: "Online Purchase (3)" },
      { value: "4", label: "POS Payment (4)" },
    ],
  },
  {
    key: "time_of_transaction",
    label: "Time of Transaction (Hour -> Encoded)",
    options: [
      { value: "0", label: "0 -> 0" },
      { value: "1", label: "1 -> 1" },
      { value: "2", label: "10 -> 2" },
      { value: "3", label: "11 -> 3" },
      { value: "4", label: "12 -> 4" },
      { value: "5", label: "13 -> 5" },
      { value: "6", label: "14 -> 6" },
      { value: "7", label: "15 -> 7" },
      { value: "8", label: "16 -> 8" },
      { value: "9", label: "17 -> 9" },
      { value: "10", label: "18 -> 10" },
      { value: "11", label: "19 -> 11" },
      { value: "12", label: "2 -> 12" },
      { value: "13", label: "20 -> 13" },
      { value: "14", label: "21 -> 14" },
      { value: "15", label: "22 -> 15" },
      { value: "16", label: "23 -> 16" },
      { value: "17", label: "3 -> 17" },
      { value: "18", label: "4 -> 18" },
      { value: "19", label: "5 -> 19" },
      { value: "20", label: "6 -> 20" },
      { value: "21", label: "7 -> 21" },
      { value: "22", label: "8 -> 22" },
      { value: "23", label: "9 -> 23" },
      { value: "24", label: "Unknown -> 24" },
    ],
  },
  {
    key: "device_used",
    label: "Device Used",
    options: [
      { value: "0", label: "Desktop (0)" },
      { value: "1", label: "Mobile (1)" },
      { value: "2", label: "Tablet (2)" },
      { value: "3", label: "Unknown (3)" },
      { value: "4", label: "Unknown Device (4)" },
    ],
  },
  {
    key: "location",
    label: "Location",
    options: [
      { value: "0", label: "Boston (0)" },
      { value: "1", label: "Chicago (1)" },
      { value: "2", label: "Houston (2)" },
      { value: "3", label: "Los Angeles (3)" },
      { value: "4", label: "Miami (4)" },
      { value: "5", label: "New York (5)" },
      { value: "6", label: "San Francisco (6)" },
      { value: "7", label: "Seattle (7)" },
      { value: "8", label: "Unknown (8)" },
    ],
  },
  {
    key: "payment_method",
    label: "Payment Method",
    options: [
      { value: "0", label: "Credit Card (0)" },
      { value: "1", label: "Debit Card (1)" },
      { value: "2", label: "Invalid Method (2)" },
      { value: "3", label: "Net Banking (3)" },
      { value: "4", label: "UPI (4)" },
      { value: "5", label: "Unknown (5)" },
    ],
  },
];

export default function TransactionForm() {
  const [formData, setFormData] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitTransaction = async () => {
    try {
      setLoading(true);
      const payload = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, Number(value)])
      );
      const res = await api.post("/api/transaction", payload);
      setResult(res.data);
    } catch (err) {
      alert("Error submitting transaction");
    } finally {
      setLoading(false);
    }
  };

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
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
          }
        />
      ))}
      {selectFields.map((field) => (
        <select
          key={field.key}
          className="w-full mb-3 p-2 rounded text-black bg-white"
          value={formData[field.key]}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
          }
        >
          <option value="">Select {field.label}</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}

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
            Fraud Probability: <b>{(result.fraud_probability * 100).toFixed(2)}%</b>
          </p>
          <p>
            Risk Level: <b>{result.risk_level}</b>
          </p>
        </div>
      )}
    </div>
  );
}
