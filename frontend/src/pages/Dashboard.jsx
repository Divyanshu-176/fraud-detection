import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import DashboardCharts from "../components/DashboardCharts";
import TransactionForm from "../components/TransactionForm";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [form, setForm] = useState({
    count: 250,
    durationSeconds: 120,
    fraudRatio: 0.35,
  });

  const fetchDashboardData = async () => {
    try {
      const [statsRes, historyRes] = await Promise.all([
        api.get("/api/transaction/stats"),
        api.get("/api/transaction/history?limit=25"),
      ]);
      setStats(statsRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const intervalId = window.setInterval(fetchDashboardData, 5000);
    return () => window.clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const startSimulation = async () => {
    try {
      setSimulating(true);
      await api.post("/api/transaction/simulate", {
        count: Number(form.count),
        durationSeconds: Number(form.durationSeconds),
        fraudRatio: Number(form.fraudRatio),
      });
      fetchDashboardData();
    } catch (error) {
      alert(error?.response?.data?.error || "Unable to start simulation");
    } finally {
      setSimulating(false);
    }
  };

  const summaryCards = useMemo(() => {
    if (!stats) {
      return [];
    }
    return [
      {
        label: "Total Transactions",
        value: stats.totals.total_transactions,
      },
      {
        label: "Fraudulent",
        value: stats.totals.fraudulent_transactions,
      },
      {
        label: "Fraud Rate",
        value: `${(stats.totals.fraud_rate * 100).toFixed(1)}%`,
      },
      {
        label: "High Risk",
        value: stats.totals.high_risk_transactions,
      },
      {
        label: "Alerts Triggered",
        value: stats.totals.alerts_triggered,
      },
      {
        label: "Avg Fraud Score",
        value: `${(stats.totals.average_fraud_score * 100).toFixed(1)}%`,
      },
    ];
  }, [stats]);

  return (
    <main className="min-h-screen w-screen bg-gray-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Version 2</p>
            <h1 className="text-3xl font-bold">Real-Time Fraud Detection Dashboard</h1>
            <p className="text-sm text-gray-300">
              Hybrid anomaly + supervised scoring with live analytics and traffic simulation.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-red-500 px-4 py-2 font-semibold text-red-200 hover:bg-red-600/20"
          >
            Logout
          </button>
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-2xl bg-gray-800/80 p-5 shadow-lg">
              <p className="text-sm text-gray-300">{card.label}</p>
              <p className="mt-2 text-3xl font-bold">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl bg-gray-900/90 p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Simulation Control</h2>
                <p className="text-sm text-gray-300">
                  Generate 100-1000 scored transactions over time for live monitoring.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="flex flex-col gap-2 text-sm">
                Transaction Count
                <input
                  type="number"
                  min="10"
                  max="1000"
                  className="rounded-lg bg-white px-3 py-2 text-black"
                  value={form.count}
                  onChange={(e) => setForm((prev) => ({ ...prev, count: e.target.value }))}
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                Duration (seconds)
                <input
                  type="number"
                  min="10"
                  max="600"
                  className="rounded-lg bg-white px-3 py-2 text-black"
                  value={form.durationSeconds}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, durationSeconds: e.target.value }))
                  }
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                Fraud Ratio
                <input
                  type="number"
                  min="0.05"
                  max="0.95"
                  step="0.05"
                  className="rounded-lg bg-white px-3 py-2 text-black"
                  value={form.fraudRatio}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, fraudRatio: e.target.value }))
                  }
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={startSimulation}
                disabled={simulating}
                className="rounded-xl bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-500 disabled:opacity-70"
              >
                {simulating ? "Starting..." : "Generate Transaction Stream"}
              </button>
              <button
                onClick={fetchDashboardData}
                className="rounded-xl border border-gray-600 px-4 py-2 font-semibold text-gray-100 hover:bg-gray-800"
              >
                Refresh Dashboard
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
              {(stats?.simulation_status || []).map((job) => (
                <div key={job.simulation_id} className="rounded-xl bg-gray-800 p-4">
                  <p className="text-sm text-gray-300">Simulation {job.simulation_id.slice(0, 8)}</p>
                  <p className="text-lg font-semibold capitalize">{job.status}</p>
                  <p className="text-sm text-gray-300">
                    Processed {job.processed}/{job.total} | Fraud flagged: {job.flagged} | Alerts:{" "}
                    {job.alerts}
                  </p>
                  {job.lastError && <p className="mt-2 text-sm text-red-300">{job.lastError}</p>}
                </div>
              ))}
              {!stats?.simulation_status?.length && (
                <div className="rounded-xl bg-gray-800 p-4 text-sm text-gray-300">
                  No simulation has been started yet.
                </div>
              )}
            </div>
          </div>

          <TransactionForm onTransactionProcessed={fetchDashboardData} />
        </section>

        {stats?.charts && <DashboardCharts charts={stats.charts} />}

        <section className="rounded-2xl bg-gray-900/90 p-5 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent Transactions</h2>
              <p className="text-sm text-gray-300">
                Latest scored events across manual submissions and generated traffic.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-gray-300">Loading dashboard data...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-gray-300">
                  <tr className="border-b border-gray-700">
                    <th className="px-3 py-2">Time</th>
                    <th className="px-3 py-2">Source</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Location</th>
                    <th className="px-3 py-2">Payment</th>
                    <th className="px-3 py-2">Risk</th>
                    <th className="px-3 py-2">Fraud Score</th>
                    <th className="px-3 py-2">Reasons</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id} className="border-b border-gray-800">
                      <td className="px-3 py-2">
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="px-3 py-2 capitalize">{item.source}</td>
                      <td className="px-3 py-2">${Number(item.amount || 0).toFixed(2)}</td>
                      <td className="px-3 py-2">{item.location}</td>
                      <td className="px-3 py-2">{item.payment_method}</td>
                      <td className="px-3 py-2">{item.risk_level}</td>
                      <td className="px-3 py-2">
                        {((item.final_score ?? item.fraud_probability ?? 0) * 100).toFixed(1)}%
                      </td>
                      <td className="px-3 py-2">
                        {item.reason_codes?.length ? item.reason_codes.join(", ") : "None"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
