export default function QuotePreview({
  customerName,
  customerEmail,
  customerPhone,
  items,
  subtotal,
  gst,
  grandTotal,
}) {
  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mt-6">
      <h3 className="text-2xl font-bold mb-6">
        Quote Preview
      </h3>

      <div className="space-y-2 mb-8">
        <p>
          <strong>Customer:</strong> {customerName}
        </p>

        <p>
          <strong>Email:</strong> {customerEmail}
        </p>

        <p>
          <strong>Phone:</strong> {customerPhone}
        </p>
      </div>

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
                ₹{item.quantity * item.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>GST (18%)</span>
          <span>₹{gst.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-2xl font-bold border-t border-slate-700 pt-4">
          <span>Total</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}