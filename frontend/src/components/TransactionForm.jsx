import { useState } from "react";
import api from "../api";

export default function TransactionForm() {
  const [amount, setAmount] = useState("");
  const [location, setLocation] = useState("");
  const [device, setDevice] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitTransaction = async () => {
    try {
      setLoading(true);
      const res = await api.post("/api/transaction", {
        amount,
        location,
        device,
      });
      setResult(res.data);
    } catch (err) {
      alert("Error submitting transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg w-96 flex flex-col">
      <input
        className="w-full mb-3 p-2 rounded text-black bg-white"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <input
        className="w-full mb-3 p-2 rounded text-black bg-white"
        placeholder="Location (IN / US / UK)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <input
        className="w-full mb-3 p-2 rounded text-black bg-white"
        placeholder="Device (web / mobile)"
        value={device}
        onChange={(e) => setDevice(e.target.value)}
      />

      <button
        onClick={submitTransaction}
        disabled={loading}
        className="w-full bg-blue-600 py-2 rounded font-semibold"
      >
        {loading ? "Processing..." : "Submit Transaction"}
      </button>

      {result && (
        <div className="mt-4 bg-gray-900 p-4 rounded">
          <p>Fraud Probability: <b>{(result.fraud_probability * 100).toFixed(2)}%</b></p>
          <p>Risk Level: <b>{result.risk_level}</b></p>
        </div>
      )}
    </div>
  );
}
