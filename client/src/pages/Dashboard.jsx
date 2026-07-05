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
  const [paidRevenue, setPaidRevenue] = useState(0);
  const [pipeline, setPipeline] = useState(0);
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

        // Revenue = Paid quotations only
        const paidRevenue = quotes
          .filter((q) => q.status === "Paid")
          .reduce((sum, q) => sum + Number(q.grand_total || 0), 0);

        // Pipeline = Everything not yet paid
        const pipeline = quotes
          .filter((q) => q.status !== "Paid")
          .reduce((sum, q) => sum + Number(q.grand_total || 0), 0);

        setPaidRevenue(paidRevenue);
        setPipeline(pipeline);
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
      {/* ================= Dashboard Header ================= */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-slate-400 mt-2">
            Manage quotations and customers.
          </p>
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
        <>
          {/* ================= Stats Grid ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatsCard title="Total Quotations" value={totalQuotes} />

            <StatsCard title="Customers" value={totalCustomers} />

            {/* Revenue generated only from Paid quotations */}
            <StatsCard
              title="Revenue (Paid)"
              value={`₹${paidRevenue.toLocaleString("en-IN")}`}
            />

            {/* Money still in the sales pipeline (Draft + Sent + Approved) */}
            <StatsCard
              title="Pipeline"
              value={`₹${pipeline.toLocaleString("en-IN")}`}
            />
          </div>

          {/* ================= Getting Started Card ================= */}
          {totalQuotes === 0 && (
            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-xl font-semibold mb-3">
                Welcome to QuoteFlow AI 👋
              </h3>

              <p className="text-slate-400 mb-6">
                Let's create your first quotation in just a few simple steps.
              </p>

              <ol className="space-y-3 text-slate-300 list-decimal list-inside">
                <li>Create your first quotation.</li>
                <li>Download or print the PDF.</li>
                <li>Send it to your customer.</li>
                <li>Update the quote status as work progresses.</li>
                <li>Track your revenue and pipeline from the Dashboard.</li>
              </ol>

              <button
                onClick={() => navigate("/create-quote")}
                className="mt-6 bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-lg font-medium transition-colors"
              >
                Create Your First Quote
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}