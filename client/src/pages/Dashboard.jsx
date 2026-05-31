import { useNavigate } from "react-router-dom";

import StatsCard from "../components/dashboard/StatsCard";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">
            Dashboard
          </h2>

          <p className="text-slate-400 mt-2">
            Manage quotations and customers.
          </p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium"
          onClick={() => navigate("/create-quote")}
        >
          Create Quote
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Quotations"
          value="0"
        />

        <StatsCard
          title="Customers"
          value="0"
        />

        <StatsCard
          title="Revenue"
          value="₹0"
        />
      </div>
    </>
  );
}