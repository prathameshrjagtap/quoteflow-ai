import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchQuotes, updateQuoteStatus, deleteQuote } from "../lib/db";

const STATUS_OPTIONS = ["All", "Draft", "Sent", "Approved", "Paid"];

const DATE_OPTIONS = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
  { label: "Last 90 Days", value: "90days" },
];

export default function Quotes() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    loadQuotes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const data = await fetchQuotes(user.id);
      setQuotes(data);
    } catch (err) {
      setError("Failed to load quotes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteQuote(id);
      setQuotes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateQuoteStatus(id, status);
      setQuotes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status } : q))
      );
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":       return "bg-green-600";
      case "Approved":   return "bg-blue-600";
      case "Sent":       return "bg-yellow-600";
      default:           return "bg-slate-600";
    }
  };

  const getDateThreshold = () => {
    const now = new Date();
    switch (dateFilter) {
      case "today": {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        return start;
      }
      case "7days":  return new Date(now - 7  * 24 * 60 * 60 * 1000);
      case "30days": return new Date(now - 30 * 24 * 60 * 60 * 1000);
      case "90days": return new Date(now - 90 * 24 * 60 * 60 * 1000);
      default:       return null;
    }
  };

  const filteredQuotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    const dateThreshold = getDateThreshold();

    return quotes.filter((quote) => {
      if (term) {
        const nameMatch  = quote.customer_name.toLowerCase().includes(term);
        const emailMatch = quote.customer_email.toLowerCase().includes(term);
        if (!nameMatch && !emailMatch) return false;
      }
      if (statusFilter !== "All" && (quote.status || "Draft") !== statusFilter)
        return false;
      if (dateThreshold && new Date(quote.created_at) < dateThreshold)
        return false;
      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotes, search, statusFilter, dateFilter]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setDateFilter("all");
  };

  const hasActiveFilters =
    search.trim() !== "" || statusFilter !== "All" || dateFilter !== "all";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 bg-red-950/40 border border-red-800 rounded-xl p-6">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Saved Quotes</h2>
          <p className="text-slate-400 mt-2">View all quotations.</p>
        </div>
        <button
          onClick={() => navigate("/create-quote")}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium"
        >
          + New Quote
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All Statuses" : s}
              </option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          >
            {DATE_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="bg-slate-700 hover:bg-slate-600 transition-colors px-4 py-2 rounded-lg text-sm"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      <p className="text-slate-500 text-sm mb-4">
        {hasActiveFilters
          ? `${filteredQuotes.length} of ${quotes.length} quotation(s) shown`
          : `${quotes.length} quotation(s) saved`}
      </p>

      {/* List */}
      {quotes.length === 0 ? (
        <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center">
          <p className="text-slate-400">No quotes found.</p>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center">
          <p className="text-slate-400">No quotes match your filters.</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-blue-400 hover:text-blue-300 text-sm underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map((quote) => (
            <div
              key={quote.id}
              onClick={() => navigate(`/quotes/${quote.id}`)}
              className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-blue-500 transition-all duration-200 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-semibold">
                      {quote.customer_name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        quote.status || "Draft"
                      )}`}
                    >
                      {quote.status || "Draft"}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1">{quote.customer_email}</p>
                  <p className="text-slate-500 text-sm mt-2">
                    {quote.quote_number} &nbsp;·&nbsp; Created{" "}
                    {new Date(quote.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="mt-4 text-lg font-medium">
                    Total: ₹{Number(quote.grand_total).toFixed(2)}
                  </p>
                </div>

                <div
                  className="flex flex-col gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <select
                    value={quote.status || "Draft"}
                    onChange={(e) => handleStatusChange(quote.id, e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Approved">Approved</option>
                    <option value="Paid">Paid</option>
                  </select>
                  <button
                    onClick={() => handleDelete(quote.id)}
                    className="bg-red-600 hover:bg-red-700 transition-colors px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
