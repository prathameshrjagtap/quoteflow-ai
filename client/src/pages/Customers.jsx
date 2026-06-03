import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchCustomers, deleteCustomer } from "../lib/db";

export default function Customers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers(user.id)
      .then(setCustomers)
      .catch(() => setError("Failed to load customers."))
      .finally(() => setLoading(false));
  }, [user.id]);

  const handleDelete = async (id) => {
    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Customers</h2>
          <p className="text-slate-400 mt-2">Manage your customer records.</p>
          <p className="text-slate-500 mt-1">
            {customers.length} customer(s) on record
          </p>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center">
          <p className="text-slate-400 text-lg">No customers yet.</p>
          <p className="text-slate-500 text-sm mt-2">
            Customers are added automatically when you create a quote.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {customers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => navigate(`/customers/${customer.id}`)}
              className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-blue-500 transition-all duration-200 cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold shrink-0">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{customer.name}</h3>
                    <p className="text-slate-400 text-sm mt-0.5">
                      {customer.email || "—"}
                    </p>
                    <p className="text-slate-500 text-sm">
                      {customer.phone || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">
                      {customer.total_quotes}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {customer.total_quotes === 1 ? "Quote" : "Quotes"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(customer.id);
                    }}
                    className="bg-red-600 hover:bg-red-700 transition-colors px-4 py-2 rounded-lg text-sm"
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
