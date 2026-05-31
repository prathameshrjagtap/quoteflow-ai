import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedQuotes =
      JSON.parse(localStorage.getItem("quotes")) || [];

    setQuotes(savedQuotes);
  }, []);

  const deleteQuote = (id) => {
    const updatedQuotes = quotes.filter(
      (quote) => quote.id !== id
    );

    setQuotes(updatedQuotes);

    localStorage.setItem(
      "quotes",
      JSON.stringify(updatedQuotes)
    );
  };

  const updateStatus = (id, status) => {
    const updatedQuotes = quotes.map((quote) =>
      quote.id === id
        ? { ...quote, status }
        : quote
    );

    setQuotes(updatedQuotes);

    localStorage.setItem(
      "quotes",
      JSON.stringify(updatedQuotes)
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-600";

      case "Approved":
        return "bg-blue-600";

      case "Sent":
        return "bg-yellow-600";

      default:
        return "bg-slate-600";
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold">
        Saved Quotes
      </h2>

      <p className="text-slate-400 mt-2">
        View all quotations.
      </p>

      <p className="text-slate-500 mb-8">
        {quotes.length} quotation(s) saved
      </p>

      {quotes.length === 0 ? (
        <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 text-center">
          <p className="text-slate-400">
            No quotes found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <div
              key={quote.id}
              onClick={() =>
                navigate(`/quotes/${quote.id}`)
              }
              className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-blue-500 transition-all duration-200 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-semibold">
                      {quote.customerName}
                    </h3>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        quote.status || "Draft"
                      )}`}
                    >
                      {quote.status || "Draft"}
                    </span>
                  </div>

                  <p className="text-slate-400 mt-1">
                    {quote.customerEmail}
                  </p>

                  <p className="text-slate-500 text-sm mt-2">
                    Created:{" "}
                    {new Date(
                      quote.createdAt
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>

                  <p className="mt-4 text-lg font-medium">
                    Total: ₹
                    {quote.grandTotal.toFixed(2)}
                  </p>
                </div>

                <div
                  className="flex flex-col gap-2"
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                >
                  <select
                    value={
                      quote.status || "Draft"
                    }
                    onChange={(e) =>
                      updateStatus(
                        quote.id,
                        e.target.value
                      )
                    }
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
                  >
                    <option value="Draft">
                      Draft
                    </option>

                    <option value="Sent">
                      Sent
                    </option>

                    <option value="Approved">
                      Approved
                    </option>

                    <option value="Paid">
                      Paid
                    </option>
                  </select>

                  <button
                    onClick={() =>
                      deleteQuote(quote.id)
                    }
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