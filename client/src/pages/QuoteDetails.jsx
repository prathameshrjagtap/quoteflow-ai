import { useParams } from "react-router-dom";

export default function QuoteDetails() {
  const { id } = useParams();

  const quotes =
    JSON.parse(localStorage.getItem("quotes")) || [];

  const quote = quotes.find(
    (q) => q.id.toString() === id
  );

  if (!quote) {
    return (
      <div>
        <h2 className="text-3xl font-bold">
          Quote Not Found
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <h2 className="text-3xl font-bold mb-8">
        Quote Details
      </h2>

      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <h3 className="text-xl font-semibold mb-4">
          Customer Information
        </h3>

        <p>
          <strong>Name:</strong> {quote.customerName}
        </p>

        <p>
          <strong>Email:</strong> {quote.customerEmail}
        </p>

        <p>
          <strong>Phone:</strong> {quote.customerPhone}
        </p>
      </div>

      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mt-6">
        <h3 className="text-xl font-semibold mb-4">
          Quote Items
        </h3>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3">Item</th>
              <th className="text-left py-3">Qty</th>
              <th className="text-left py-3">Price</th>
              <th className="text-left py-3">Total</th>
            </tr>
          </thead>

          <tbody>
            {quote.items.map((item, index) => (
              <tr
                key={index}
                className="border-b border-slate-800"
              >
                <td className="py-3">
                  {item.itemName}
                </td>

                <td className="py-3">
                  {item.quantity}
                </td>

                <td className="py-3">
                  ₹{item.price}
                </td>

                <td className="py-3">
                  ₹{item.quantity * item.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 space-y-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>
              ₹{quote.subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span>GST (18%)</span>
            <span>
              ₹{quote.gst.toFixed(2)}
            </span>
          </div>

          <div className="border-t border-slate-700 pt-4 flex justify-between text-2xl font-bold">
            <span>Total</span>
            <span>
              ₹{quote.grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}