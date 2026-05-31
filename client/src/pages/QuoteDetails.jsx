import { useParams, useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

import QuotePreview from "../components/quote/QuotePreview";

export default function QuoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quoteRef = useRef(null);

  const quotes =
    JSON.parse(localStorage.getItem("quotes")) || [];

  const quote = quotes.find(
    (q) => q.id.toString() === id
  );

  const handlePrint = useReactToPrint({
    contentRef: quoteRef,
    documentTitle: `Quote_${quote?.customerName}`,
  });

  if (!quote) {
    return (
      <div>
        <button
          onClick={() => navigate("/quotes")}
          className="mb-6 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg"
        >
          ← Back
        </button>

        <h2 className="text-3xl font-bold">
          Quote Not Found
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">
            Quote Details
          </h2>

          <p className="text-slate-400 mt-2">
            View complete quotation information.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
          >
            Download PDF
          </button>

          <button
            onClick={() => navigate("/quotes")}
            className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg"
          >
            ← Back to Quotes
          </button>
        </div>
      </div>

      {/* Quote Info */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm">
              Quote ID
            </p>

            <p className="font-medium">
              #{quote.id}
            </p>
          </div>

          <div>
            <p className="text-slate-400 text-sm">
              Created On
            </p>

            <p className="font-medium">
              {new Date(
                quote.createdAt
              ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <h3 className="text-xl font-semibold mb-5">
          Customer Information
        </h3>

        <div className="space-y-3">
          <p>
            <strong>Name:</strong>{" "}
            {quote.customerName}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {quote.customerEmail}
          </p>

          <p>
            <strong>Phone:</strong>{" "}
            {quote.customerPhone}
          </p>
        </div>
      </div>

      {/* Quote Items */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mt-6">
        <h3 className="text-xl font-semibold mb-6">
          Quote Items
        </h3>

        {quote.items.length === 0 ? (
          <p className="text-slate-400">
            No items found.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-4">
                      Item
                    </th>

                    <th className="text-left py-4">
                      Qty
                    </th>

                    <th className="text-left py-4">
                      Price
                    </th>

                    <th className="text-left py-4">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {quote.items.map(
                    (item, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-800"
                      >
                        <td className="py-4">
                          {item.itemName}
                        </td>

                        <td className="py-4">
                          {item.quantity}
                        </td>

                        <td className="py-4">
                          ₹{item.price}
                        </td>

                        <td className="py-4 font-medium">
                          ₹
                          {(
                            item.quantity *
                            item.price
                          ).toFixed(2)}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-8 border-t border-slate-700 pt-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>

                  <span>
                    ₹
                    {quote.subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>GST (18%)</span>

                  <span>
                    ₹{quote.gst.toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-slate-700 pt-4 flex justify-between text-3xl font-bold">
                  <span>Total</span>

                  <span className="text-green-400">
                    ₹
                    {quote.grandTotal.toFixed(
                      2
                    )}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Hidden Printable Version */}
      <div className="hidden">
        <div ref={quoteRef}>
          <QuotePreview
            quoteId={quote.id}
            createdAt={quote.createdAt}
            customerName={quote.customerName}
            customerEmail={quote.customerEmail}
            customerPhone={quote.customerPhone}
            items={quote.items}
            subtotal={quote.subtotal}
            gst={quote.gst}
            grandTotal={quote.grandTotal}
          />
        </div>
      </div>
    </div>
  );
}