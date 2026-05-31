export default function QuotePreview({
  quoteId,
  createdAt,
  customerName,
  customerEmail,
  customerPhone,
  items,
  subtotal,
  gst,
  grandTotal,
}) {
  const settings =
    JSON.parse(
      localStorage.getItem("businessSettings")
    ) || {};

  return (
    <div className="bg-slate-900 text-white p-8 rounded-xl border border-slate-800 mt-6">

      {/* Company Header */}
      <div className="border-b border-slate-700 pb-6 mb-6">
        <h1 className="text-4xl font-bold">
          {settings.companyName ||
            "Your Company Name"}
        </h1>

        <div className="mt-3 space-y-1 text-slate-300">
          <p>
            {settings.companyEmail}
          </p>

          <p>
            {settings.companyPhone}
          </p>

          <p>
            GST: {settings.gstNumber}
          </p>

          <p>
            {settings.address}
          </p>
        </div>
      </div>

      {/* Quote Header */}
      <div className="flex justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">
            QUOTATION
          </h2>

          <p className="text-slate-400 mt-2">
            Quote #{quoteId}
          </p>
        </div>

        <div className="text-right">
          <p className="text-slate-400">
            Date
          </p>

          <p>
            {createdAt
              ? new Date(
                  createdAt
                ).toLocaleDateString("en-IN")
              : new Date().toLocaleDateString(
                  "en-IN"
                )}
          </p>
        </div>
      </div>

      {/* Customer Details */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">
          Bill To
        </h3>

        <div className="space-y-2">
          <p>
            <strong>
              {customerName}
            </strong>
          </p>

          <p>{customerEmail}</p>

          <p>{customerPhone}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-3">
              Item
            </th>

            <th className="text-left py-3">
              Qty
            </th>

            <th className="text-left py-3">
              Price
            </th>

            <th className="text-left py-3">
              Total
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
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
                ₹
                {(
                  item.quantity *
                  item.price
                ).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-8 space-y-3">
        <div className="flex justify-between">
          <span>Subtotal</span>

          <span>
            ₹{subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between">
          <span>GST (18%)</span>

          <span>
            ₹{gst.toFixed(2)}
          </span>
        </div>

        <div className="border-t border-slate-700 pt-4 flex justify-between text-3xl font-bold">
          <span>Total</span>

          <span className="text-green-400">
            ₹
            {grandTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 mt-10 pt-6 text-center text-slate-400">
        <p>
          Thank you for your business.
        </p>

        <p className="mt-2 text-sm">
          Generated with QuoteFlow AI
        </p>
      </div>
    </div>
  );
}