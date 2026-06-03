import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchQuotes, fetchCustomers } from "../lib/db";
import StatsCard from "../components/dashboard/StatsCard";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [totalQuotes, setTotalQuotes] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [quotes, customers] = await Promise.all([
          fetchQuotes(user.id),
          fetchCustomers(user.id),
        ]);

        setTotalQuotes(quotes.length);
        setTotalCustomers(customers.length);
        setRevenue(
          quotes.reduce((sum, q) => sum + Number(q.grand_total), 0)
        );
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [user.id]);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-slate-400 mt-2">Manage quotations and customers.</p>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium"
          onClick={() => navigate("/create-quote")}
        >
          Create Quote
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard title="Total Quotations" value={totalQuotes} />
          <StatsCard title="Customers" value={totalCustomers} />
          <StatsCard title="Revenue" value={`₹${revenue.toFixed(2)}`} />
        </div>
      )}
    </>
  );
}
