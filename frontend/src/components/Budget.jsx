 
import React, { useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Budget() {
  const [income, setIncome] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const calculate = async () => {
    setError("");
    const incomeNum = Number(income);
    if (!income || Number.isNaN(incomeNum) || incomeNum <= 0) {
      setError("Please enter a valid income greater than 0.");
      return;
    }

    setLoading(true);
    try {
      const base = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const res = await axios.post(`${base}/api/budget`, { income: incomeNum });
      setData(res.data);
    } catch (err) {
      setError("Unable to calculate budget. Try again later.");
      // console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="budget-box">
      <h3>📊 Budget Planner</h3>

      <div className="budget-form">
        <input
          placeholder="Enter income (₹)"
          value={income}
          inputMode="numeric"
          onChange={(e) => setIncome(e.target.value)}
          aria-label="Income in rupees"
        />
        <button className="btn" onClick={calculate} disabled={loading} aria-disabled={loading}>
          {loading ? "Calculating…" : "Calculate"}
        </button>
      </div>

      {error && <div className="error" role="alert">{error}</div>}

      {data && (
        <div className="calc-card">
          <div className="summary">
            <p><span className="kv">Needs:</span> ₹{data.needs}</p>
            <p><span className="kv">Wants:</span> ₹{data.wants}</p>
            <p><span className="kv">Savings:</span> ₹{data.savings}</p>
          </div>
          <div className="chart-wrap">
            <Pie
              data={{
                labels: ["Needs", "Wants", "Savings"],
                datasets: [
                  {
                    data: [data.needs, data.wants, data.savings],
                    backgroundColor: ["#4f46e5", "#22c55e", "#facc15"],
                  },
                ],
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
