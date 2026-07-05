export default function QuotePreview({
  settings,
  quoteId,
  quoteNumber,
  createdAt,
  customerName,
  customerEmail,
  customerPhone,
  items,
  subtotal,
  gst,
  grandTotal,
  aiSummary,
}) {
  
  settings = settings || {};

  return (
    <div className="bg-slate-900 text-white p-8 rounded-xl border border-slate-800 mt-6">

      {/* Company Header */}
      <div className="border-b border-slate-700 pb-6 mb-6">
        <div className="flex items-start gap-4">
          {/* Logo — only shown if uploaded */}
          {settings.logoBase64 && (
            <img
              src={settings.logoBase64}
              alt="Company logo"
              className="w-16 h-16 object-contain rounded shrink-0"
            />
          )}

          <div>
            <h1 className="text-4xl font-bold">
              {settings.companyName || "Your Company Name"}
            </h1>

            <div className="mt-2 space-y-0.5 text-slate-300 text-sm">
              {settings.companyEmail && <p>{settings.companyEmail}</p>}
              {settings.companyPhone && <p>{settings.companyPhone}</p>}
              {settings.gstNumber && <p>GST: {settings.gstNumber}</p>}
              {settings.address && <p>{settings.address}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Quote Header */}
      <div className="flex justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">QUOTATION</h2>
          <p className="text-slate-400 mt-2">
            Quote {quoteNumber || `#${quoteId}`}
          </p>
        </div>

        <div className="text-right">
          <p className="text-slate-400 text-sm">Date</p>
          <p>
            {createdAt
              ? new Date(createdAt).toLocaleDateString("en-IN")
              : new Date().toLocaleDateString("en-IN")}
          </p>
        </div>
      </div>

      {/* Customer Details */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-3">Bill To</h3>
        <div className="space-y-1">
          <p className="font-medium">{customerName}</p>
          {customerEmail && (
            <p className="text-slate-300">{customerEmail}</p>
          )}
          {customerPhone && (
            <p className="text-slate-300">{customerPhone}</p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-3 font-semibold">Item</th>
            <th className="text-left py-3 font-semibold">Qty</th>
            <th className="text-left py-3 font-semibold">Unit Price</th>
            <th className="text-right py-3 font-semibold">Total</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-slate-800">
              <td className="py-3">{item.itemName}</td>
              <td className="py-3">{item.quantity}</td>
              <td className="py-3">₹{Number(item.price).toFixed(2)}</td>
              <td className="py-3 text-right font-medium">
                ₹{(item.quantity * item.price).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-8 ml-auto max-w-xs space-y-3">
        <div className="flex justify-between text-slate-300">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-slate-300">
          <span>GST (18%)</span>
          <span>₹{gst.toFixed(2)}</span>
        </div>

        <div className="border-t border-slate-700 pt-3 flex justify-between text-2xl font-bold">
          <span>Grand Total</span>
          <span className="text-green-400">₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* AI Summary — only shown if generated */}
      {aiSummary && (
        <div className="mt-8 pt-6 border-t border-slate-700">
          <h3 className="text-base font-semibold mb-2">Quote Summary</h3>
          <p className="text-slate-300 text-sm leading-relaxed">{aiSummary}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-slate-700 mt-10 pt-6 text-center text-slate-400">
        <p>Thank you for your business.</p>
        <p className="mt-1 text-sm">Generated with QuoteFlow AI</p>
      </div>
    </div>
  );
}
