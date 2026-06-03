import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { fetchQuoteById, updateQuote } from "../lib/db";
import QuotePreview from "../components/quote/QuotePreview";

export default function EditQuote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quoteRef = useRef(null);

  const [original, setOriginal] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loadingQuote, setLoadingQuote] = useState(true);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [savedQuote, setSavedQuote] = useState(null);

  const handlePrint = useReactToPrint({
    contentRef: quoteRef,
    documentTitle: savedQuote
      ? `QuoteFlow_${savedQuote.quote_number}_${savedQuote.customer_name}`
      : "Quotation",
  });

  // Load existing quote
  useEffect(() => {
    fetchQuoteById(id)
      .then((quote) => {
        setOriginal(quote);
        setCustomerName(quote.customer_name);
        setCustomerEmail(quote.customer_email);
        setCustomerPhone(quote.customer_phone);
        setItems(quote.items && quote.items.length > 0
          ? quote.items
          : [{ itemName: "", quantity: 1, price: 0 }]
        );
      })
      .catch(() => setLoadError("Quote not found."))
      .finally(() => setLoadingQuote(false));
  }, [id]);

  const addItem = () =>
    setItems([...items, { itemName: "", quantity: 1, price: 0 }]);

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const removeItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );
  const gst = subtotal * 0.18;
  const grandTotal = subtotal + gst;

  const handleSave = async () => {
    if (!customerName.trim()) {
      setSaveError("Customer name is required.");
      return;
    }
    if (items.every((item) => !item.itemName.trim())) {
      setSaveError("Add at least one item.");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {
      const updated = await updateQuote(id, {
        customerName,
        customerEmail,
        customerPhone,
        items,
        subtotal,
        gst,
        grandTotal,
      });
      setSavedQuote(updated);
      setShowPreview(true);
    } catch (err) {
      setSaveError("Failed to save changes. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors";

  if (loadingQuote) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError || !original) {
    return (
      <div>
        <button
          onClick={() => navigate("/quotes")}
          className="mb-6 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg"
        >
          ← Back
        </button>
        <h2 className="text-3xl font-bold">Quote Not Found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold">Edit Quote</h2>
          <p className="text-slate-400 mt-1">
            {original.quote_number} &nbsp;·&nbsp; editing
          </p>
        </div>
        <button
          onClick={() => navigate(`/quotes/${id}`)}
          className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg"
        >
          ← Cancel
        </button>
      </div>

      {/* Customer Information */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <h3 className="text-xl font-semibold mb-6">Customer Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className={inputClass}
          />
          <input
            type="email"
            placeholder="Customer Email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Customer Phone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Quote Items */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Quote Items</h3>
          <button
            onClick={addItem}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
          >
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="grid md:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Item Name"
                value={item.itemName}
                onChange={(e) => updateItem(index, "itemName", e.target.value)}
                className={inputClass}
              />
              <input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(index, "quantity", Number(e.target.value))
                }
                className={inputClass}
              />
              <input
                type="number"
                placeholder="Price"
                value={item.price}
                onChange={(e) =>
                  updateItem(index, "price", Number(e.target.value))
                }
                className={inputClass}
              />
              <div className={`${inputClass} flex items-center`}>
                ₹{(item.quantity * item.price).toFixed(2)}
              </div>
              <button
                onClick={() => removeItem(index)}
                className="bg-red-600 hover:bg-red-700 rounded-lg px-4 py-3"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mt-6">
        <h3 className="text-xl font-semibold mb-6">Quote Summary</h3>
        <div className="space-y-4 text-lg">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (18%)</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>
          <div className="border-t border-slate-700 pt-4 flex justify-between font-bold text-2xl">
            <span>Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>

        {savedQuote && !saving && (
          <button
            onClick={() => navigate(`/quotes/${id}`)}
            className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            View Quote
          </button>
        )}

        {saveError && (
          <p className="text-red-400 text-sm">{saveError}</p>
        )}

        {savedQuote && !saving && !saveError && (
          <span className="text-green-400 text-sm font-medium">
            ✓ Changes saved
          </span>
        )}
      </div>

      {/* PDF Preview after save */}
      {showPreview && savedQuote && (
        <>
          <div ref={quoteRef}>
            <QuotePreview
              quoteId={savedQuote.id}
              quoteNumber={savedQuote.quote_number}
              createdAt={savedQuote.created_at}
              customerName={savedQuote.customer_name}
              customerEmail={savedQuote.customer_email}
              customerPhone={savedQuote.customer_phone}
              items={savedQuote.items}
              subtotal={Number(savedQuote.subtotal)}
              gst={Number(savedQuote.gst)}
              grandTotal={Number(savedQuote.grand_total)}
            />
          </div>
          <button
            onClick={handlePrint}
            className="mt-4 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold"
          >
            Print / Save PDF
          </button>
        </>
      )}
    </div>
  );
}
