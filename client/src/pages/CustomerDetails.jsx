import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchCustomerById, fetchQuotesByCustomerEmail } from "../lib/db";

export default function CustomerDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [relatedQuotes, setRelatedQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const cust = await fetchCustomerById(id);
        setCustomer(cust);
        const quotes = await fetchQuotesByCustomerEmail(user.id, cust.email);
        setRelatedQuotes(quotes);
      } catch (err) {
        setError("Customer not found.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, user.id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid": return "bg-green-600";
      case "Approved": return "bg-blue-600";
      case "Sent": return "bg-yellow-600";
      default: return "bg-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div>
        <button
          onClick={() => navigate("/customers")}
          className="mb-6 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg"
        >
          ← Back
        </button>
        <h2 className="text-3xl font-bold">Customer Not Found</h2>
      </div>
    );
  }

  // Total quotes is the actual live count from the quotes table
  const totalQuotes = relatedQuotes.length;

  // Revenue = sum of grand_total for Paid quotes only
  const totalRevenue = relatedQuotes
    .filter((q) => q.status === "Paid")
    .reduce((sum, q) => sum + Number(q.grand_total), 0);

  // Pipeline = sum of all non-Paid quotes (optional visibility)
  const pipeline = relatedQuotes
    .filter((q) => q.status !== "Paid")
    .reduce((sum, q) => sum + Number(q.grand_total), 0);

  return (
    <div className="max-w-6xl">
      <button
        onClick={() => navigate("/customers")}
        className="mb-6 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg"
      >
        ← Back to Customers
      </button>

      {/* Customer Header */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold shrink-0">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-3xl font-bold">{customer.name}</h2>
            <p className="text-slate-400 mt-1">{customer.email}</p>
            <p className="text-slate-500">{customer.phone}</p>
          </div>
        </div>
      </div>

      {/* Stats — 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <p className="text-slate-400 text-sm mb-1">Total Quotations</p>
          <p className="text-4xl font-bold text-blue-400">{totalQuotes}</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <p className="text-slate-400 text-sm mb-1">Revenue (Paid)</p>
          <p className="text-4xl font-bold text-green-400">
            ₹{totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <p className="text-slate-400 text-sm mb-1">Pipeline (Unpaid)</p>
          <p className="text-4xl font-bold text-yellow-400">
            ₹{pipeline.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Related Quotes */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Quotations</h3>

        {/* =========================
    Empty State
    Displayed when this customer has no quotations.
========================= */}
        {relatedQuotes.length === 0 ? (
          <div className="bg-slate-900 p-10 rounded-xl border border-slate-800 text-center">

            <h3 className="text-xl font-semibold mb-2">
              No quotations yet
            </h3>

            <p className="text-slate-400 max-w-md mx-auto">
              Create a new quotation for this customer to start tracking their pipeline and revenue.
            </p>

            <button
              onClick={() => navigate("/create-quote")}
              className="mt-6 bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-medium transition-colors"
            >
              Create New Quote
            </button>

          </div>
        ) : (
          <div className="space-y-4">
            {relatedQuotes.map((quote) => (
              <div
                key={quote.id}
                onClick={() => navigate(`/quotes/${quote.id}`)}
                className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-blue-500 transition-all duration-200 cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-semibold">{quote.quote_number}</h4>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          quote.status || "Draft"
                        )}`}
                      >
                        {quote.status || "Draft"}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm mt-2">
                      Created:{" "}
                      {new Date(quote.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="mt-3 text-lg font-medium">
                      ₹{Number(quote.grand_total).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-slate-400 text-sm">
                    {quote.items?.length ?? 0} item(s)
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
