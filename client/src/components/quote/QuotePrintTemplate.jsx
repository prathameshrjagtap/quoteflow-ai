/**
 * QuotePrintTemplate — white-background version of the quote for PDF export.
 * This component is rendered off-screen (hidden div) and captured by html2canvas.
 * It is NOT shown to the user directly — QuotePreview (dark theme) handles that.
 */
export default function QuotePrintTemplate({
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
  const settings =
    JSON.parse(localStorage.getItem("businessSettings")) || {};

  const date = createdAt
    ? new Date(createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN");

  return (
    <div
      style={{
        width: "794px",         // A4 at 96dpi
        background: "#ffffff",
        color: "#111827",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: "14px",
        lineHeight: "1.6",
        padding: "48px",
        boxSizing: "border-box",
      }}
    >
      {/* ── Company Header ── */}
      <div style={{ borderBottom: "2px solid #e5e7eb", paddingBottom: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
          {settings.logoBase64 && (
            <img
              src={settings.logoBase64}
              alt="logo"
              style={{ width: "64px", height: "64px", objectFit: "contain" }}
            />
          )}
          <div>
            <div style={{ fontSize: "26px", fontWeight: "700", color: "#111827" }}>
              {settings.companyName || "Your Company"}
            </div>
            <div style={{ marginTop: "6px", color: "#6b7280", fontSize: "13px" }}>
              {settings.companyEmail && <div>{settings.companyEmail}</div>}
              {settings.companyPhone && <div>{settings.companyPhone}</div>}
              {settings.gstNumber    && <div>GSTIN: {settings.gstNumber}</div>}
              {settings.address      && <div style={{ whiteSpace: "pre-line" }}>{settings.address}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quote Title + Meta ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
        <div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#1d4ed8", letterSpacing: "-0.5px" }}>
            QUOTATION
          </div>
          <div style={{ color: "#6b7280", marginTop: "4px", fontSize: "13px" }}>
            {quoteNumber || `#${quoteId}`}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#6b7280", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Date
          </div>
          <div style={{ fontWeight: "600", marginTop: "2px" }}>{date}</div>
        </div>
      </div>

      {/* ── Bill To ── */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280", marginBottom: "8px" }}>
          Bill To
        </div>
        <div style={{ fontWeight: "700", fontSize: "16px" }}>{customerName}</div>
        {customerEmail && <div style={{ color: "#374151", marginTop: "2px" }}>{customerEmail}</div>}
        {customerPhone && <div style={{ color: "#374151" }}>{customerPhone}</div>}
      </div>

      {/* ── Items Table ── */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f3f4f6" }}>
            <th style={{ textAlign: "left",  padding: "10px 12px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", fontWeight: "600" }}>Item</th>
            <th style={{ textAlign: "center", padding: "10px 12px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", fontWeight: "600" }}>Qty</th>
            <th style={{ textAlign: "right", padding: "10px 12px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", fontWeight: "600" }}>Unit Price</th>
            <th style={{ textAlign: "right", padding: "10px 12px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", fontWeight: "600" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr
              key={i}
              style={{ borderBottom: "1px solid #e5e7eb", backgroundColor: i % 2 === 0 ? "#ffffff" : "#f9fafb" }}
            >
              <td style={{ padding: "10px 12px", fontWeight: "500" }}>{item.itemName}</td>
              <td style={{ padding: "10px 12px", textAlign: "center", color: "#374151" }}>{item.quantity}</td>
              <td style={{ padding: "10px 12px", textAlign: "right", color: "#374151" }}>
                ₹{Number(item.price).toFixed(2)}
              </td>
              <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: "600" }}>
                ₹{(item.quantity * item.price).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Totals ── */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ width: "260px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#374151" }}>
            <span>Subtotal</span>
            <span>₹{Number(subtotal).toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#374151" }}>
            <span>GST (18%)</span>
            <span>₹{Number(gst).toFixed(2)}</span>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
            marginTop: "4px",
            borderTop: "2px solid #111827",
            fontWeight: "700",
            fontSize: "18px",
          }}>
            <span>Grand Total</span>
            <span style={{ color: "#15803d" }}>₹{Number(grandTotal).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ── AI Summary ── */}
      {aiSummary && (
        <div style={{ marginTop: "32px", padding: "16px", backgroundColor: "#f0f9ff", borderRadius: "8px", borderLeft: "4px solid #1d4ed8" }}>
          <div style={{ fontWeight: "600", marginBottom: "6px", color: "#1d4ed8", fontSize: "13px" }}>
            Quote Summary
          </div>
          <p style={{ color: "#374151", fontSize: "13px", lineHeight: "1.7", margin: 0 }}>
            {aiSummary}
          </p>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{
        marginTop: "48px",
        paddingTop: "20px",
        borderTop: "1px solid #e5e7eb",
        textAlign: "center",
        color: "#9ca3af",
        fontSize: "12px",
      }}>
        <div>Thank you for your business.</div>
        <div style={{ marginTop: "4px" }}>Generated with QuoteFlow AI</div>
      </div>
    </div>
  );
}
