import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { useAuth } from "../context/AuthContext";
import { createQuote, upsertCustomer, fetchSettings, } from "../lib/db";
import { suggestPrice, generateQuoteSummary } from "../lib/ai";
import QuotePreview from "../components/quote/QuotePreview";

// AI features are only active when VITE_OPENAI_API_KEY is set
const AI_ENABLED = !!import.meta.env.VITE_OPENAI_API_KEY;

// Validation helpers
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/; // Indian mobile: 10 digits, starts 6-9

export default function CreateQuote() {
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [generatedQuote, setGeneratedQuote] = useState(null);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  // Prevent duplicate quote creation
  const [quoteGenerated, setQuoteGenerated] = useState(false);

  // AI state
  const [aiSummary, setAiSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [priceSuggestions, setPriceSuggestions] = useState({});

  const quoteRef = useRef(null);

  // Load logged-in user's business settings
  useEffect(() => {
    async function loadBusinessSettings() {
      try {
        const settings = await fetchSettings(user.id);
        setBusinessSettings(settings);
      } catch (err) {
        console.error("Failed to load business settings:", err);
      }
    }

    loadBusinessSettings();
  }, [user.id]);

  const handlePrint = useReactToPrint({
    contentRef: quoteRef,
    documentTitle: "Quotation",
  });

  const [items, setItems] = useState([{ itemName: "", quantity: 1, price: 0 }]);

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
    setPriceSuggestions((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const subtotal = items.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );
  const gst = subtotal * 0.18;
  const grandTotal = subtotal + gst;

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errors = {};

    if (!customerName.trim()) {
      errors.customerName = "Customer name is required.";
    }

    if (customerEmail.trim() && !EMAIL_REGEX.test(customerEmail.trim())) {
      errors.customerEmail = "Enter a valid email address.";
    }

    if (customerPhone.trim() && !PHONE_REGEX.test(customerPhone.trim())) {
      errors.customerPhone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (items.every((item) => !item.itemName.trim())) {
      errors.items = "Add at least one item.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── AI: Price suggestion ──────────────────────────────────────────────────
  const handleSuggestPrice = async (index) => {
    const itemName = items[index].itemName.trim();
    if (!itemName) return;

    setPriceSuggestions((prev) => ({
      ...prev,
      [index]: { loading: true, suggestion: null, error: "" },
    }));

    try {
      const result = await suggestPrice(itemName);
      setPriceSuggestions((prev) => ({
        ...prev,
        [index]: {
          loading: false,
          suggestion: result || null,
          error: result ? "" : "No suggestion available.",
        },
      }));
    } catch (err) {
      setPriceSuggestions((prev) => ({
        ...prev,
        [index]: { loading: false, suggestion: null, error: err.message },
      }));
    }
  };

  const applyPrice = (index, price) => {
    updateItem(index, "price", price);
    setPriceSuggestions((prev) => ({
      ...prev,
      [index]: { loading: false, suggestion: null, error: "" },
    }));
  };

  // ── AI: Quote summary ─────────────────────────────────────────────────────
  const handleGenerateSummary = async () => {
    if (!customerName.trim()) {
      setSummaryError("Enter a customer name first.");
      return;
    }
    if (items.every((i) => !i.itemName.trim())) {
      setSummaryError("Add at least one item first.");
      return;
    }

    setSummaryLoading(true);
    setSummaryError("");
    setAiSummary("");

    try {
      const summary = await generateQuoteSummary({ customerName, items, grandTotal });
      setAiSummary(summary);
    } catch (err) {
      setSummaryError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  // ── Save quote ────────────────────────────────────────────────────────────
  const generateQuote = async () => {
    // Prevent duplicate quote creation
    if (quoteGenerated) return;

    if (!validate()) return;

    setSaving(true);
    setSaveError("");

    try {
      const quote = await createQuote(user.id, {
        customerName,
        customerEmail,
        customerPhone,
        items,
        subtotal,
        gst,
        grandTotal,
      });

      await upsertCustomer(user.id, {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      });

      setGeneratedQuote(quote);
      setShowPreview(true);

      // Mark this quote as already generated
      setQuoteGenerated(true);

    } catch (err) {
      setSaveError("Failed to save quote. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors";

  const inputErrorClass =
    "bg-slate-950 border border-red-500 rounded-lg px-4 py-3 focus:outline-none focus:border-red-400 transition-colors";

  return (
    <div className="max-w-5xl">
      <h2 className="text-3xl font-bold">Create Quote</h2>
      <p className="text-slate-400 mt-2 mb-8">Generate professional quotations.</p>

      {/* Customer Information */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <h3 className="text-xl font-semibold mb-6">Customer Information</h3>
        <div className="grid md:grid-cols-2 gap-4">

          {/* Name */}
          <div className="md:col-span-2 md:grid md:grid-cols-2 gap-4 contents">
            <div>
              <label className="block text-slate-400 text-sm mb-1">
                Customer Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Rajesh Kumar"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (fieldErrors.customerName)
                    setFieldErrors((p) => ({ ...p, customerName: "" }));
                }}
                className={fieldErrors.customerName ? inputErrorClass : inputClass}
              />
              {fieldErrors.customerName && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.customerName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-slate-400 text-sm mb-1">
                Customer Email
              </label>
              <input
                type="email"
                placeholder="rajesh@example.com"
                value={customerEmail}
                onChange={(e) => {
                  setCustomerEmail(e.target.value);
                  if (fieldErrors.customerEmail)
                    setFieldErrors((p) => ({ ...p, customerEmail: "" }));
                }}
                className={fieldErrors.customerEmail ? inputErrorClass : inputClass}
              />
              {fieldErrors.customerEmail && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.customerEmail}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-slate-400 text-sm mb-1">
              Customer Phone
            </label>
            <input
              type="tel"
              placeholder="9876543210"
              maxLength={10}
              value={customerPhone}
              onChange={(e) => {
                // Allow only digits
                const val = e.target.value.replace(/\D/g, "");
                setCustomerPhone(val);
                if (fieldErrors.customerPhone)
                  setFieldErrors((p) => ({ ...p, customerPhone: "" }));
              }}
              className={fieldErrors.customerPhone ? inputErrorClass : inputClass}
            />
            {fieldErrors.customerPhone && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.customerPhone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Quote Items */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Quote Items</h3>
          <button
            onClick={addItem}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
          >
            Add Item
          </button>
        </div>

        {/* Column headers */}
        <div className="hidden md:grid md:grid-cols-5 gap-4 mb-2 px-1">
          <p className="text-slate-500 text-xs uppercase tracking-wide">Item Name</p>
          <p className="text-slate-500 text-xs uppercase tracking-wide">Quantity</p>
          <p className="text-slate-500 text-xs uppercase tracking-wide">
            Price (₹){AI_ENABLED ? " / AI" : ""}
          </p>
          <p className="text-slate-500 text-xs uppercase tracking-wide">Line Total</p>
          <p className="text-slate-500 text-xs uppercase tracking-wide"></p>
        </div>

        <div className="space-y-6">
          {items.map((item, index) => {
            const ps = priceSuggestions[index];

            return (
              <div key={index} className="space-y-2">
                {/* Mobile: stacked layout. Desktop: grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {/* Item name — full width on mobile */}
                  <div className="col-span-2 md:col-span-1">
                    <label className="md:hidden block text-slate-500 text-xs mb-1">Item Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Web Design"
                      value={item.itemName}
                      onChange={(e) => updateItem(index, "itemName", e.target.value)}
                      className={inputClass + " w-full"}
                    />
                  </div>

                  {/* Qty */}
                  <div>
                    <label className="md:hidden block text-slate-500 text-xs mb-1">Quantity</label>
                    <input
                      type="number"
                      placeholder="Qty"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", Number(e.target.value))
                      }
                      className={inputClass + " w-full"}
                    />
                  </div>

                  {/* Price + AI button */}
                  <div>
                    <label className="md:hidden block text-slate-500 text-xs mb-1">Price (₹)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Price (₹)"
                        min={0}
                        value={item.price}
                        onChange={(e) =>
                          updateItem(index, "price", Number(e.target.value))
                        }
                        className={`${inputClass} flex-1 min-w-0`}
                      />
                      {AI_ENABLED && (
                        <button
                          onClick={() => handleSuggestPrice(index)}
                          disabled={!item.itemName.trim() || ps?.loading}
                          title="AI price suggestion"
                          className="bg-violet-600 hover:bg-violet-700 disabled:bg-slate-700 disabled:cursor-not-allowed transition-colors rounded-lg px-3 text-sm font-medium shrink-0"
                        >
                          {ps?.loading ? (
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : "✨"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Line total */}
                  <div>
                    <label className="md:hidden block text-slate-500 text-xs mb-1">Line Total</label>
                    <div className={`${inputClass} flex items-center font-medium w-full`}>
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </div>
                  </div>

                  {/* Delete */}
                  <div className="flex items-end">
                    <button
                      onClick={() => removeItem(index)}
                      className="w-full bg-red-600 hover:bg-red-700 rounded-lg px-4 py-3 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* AI Price Suggestion Card */}
                {AI_ENABLED && ps?.suggestion && (
                  <div className="bg-violet-950/40 border border-violet-700 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-violet-300 text-sm font-medium">✨ AI Price Suggestion</p>
                      <p className="text-white text-sm mt-0.5">
                        ₹{ps.suggestion.min.toLocaleString("en-IN")} –{" "}
                        ₹{ps.suggestion.max.toLocaleString("en-IN")}{" "}
                        <span className="text-slate-400">{ps.suggestion.unit}</span>
                      </p>
                      {ps.suggestion.reasoning && (
                        <p className="text-slate-400 text-xs mt-1">{ps.suggestion.reasoning}</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => applyPrice(index, ps.suggestion.min)}
                        className="bg-violet-700 hover:bg-violet-600 transition-colors text-xs px-3 py-1.5 rounded-lg"
                      >
                        Use ₹{ps.suggestion.min.toLocaleString("en-IN")}
                      </button>
                      <button
                        onClick={() => applyPrice(index, ps.suggestion.max)}
                        className="bg-violet-700 hover:bg-violet-600 transition-colors text-xs px-3 py-1.5 rounded-lg"
                      >
                        Use ₹{ps.suggestion.max.toLocaleString("en-IN")}
                      </button>
                      <button
                        onClick={() =>
                          setPriceSuggestions((prev) => ({
                            ...prev,
                            [index]: { loading: false, suggestion: null, error: "" },
                          }))
                        }
                        className="text-slate-500 hover:text-slate-300 text-xs px-2"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {AI_ENABLED && ps?.error && (
                  <p className="text-red-400 text-xs ml-1">{ps.error}</p>
                )}
              </div>
            );
          })}
        </div>

        {fieldErrors.items && (
          <p className="text-red-400 text-sm mt-3">{fieldErrors.items}</p>
        )}
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

      {/* AI Quote Summary — only rendered when key is present */}
      {AI_ENABLED && (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold">AI Quote Summary</h3>
              <p className="text-slate-500 text-sm mt-0.5">
                Generate a professional summary paragraph for this quote.
              </p>
            </div>
            <button
              onClick={handleGenerateSummary}
              disabled={summaryLoading}
              className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-900 disabled:cursor-not-allowed transition-colors px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              {summaryLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  Generating…
                </>
              ) : (
                "✨ Generate Summary"
              )}
            </button>
          </div>

          {summaryError && (
            <p className="text-red-400 text-sm mb-3">{summaryError}</p>
          )}

          {aiSummary ? (
            <div className="bg-slate-950 border border-violet-800 rounded-lg p-4">
              <p className="text-slate-200 text-sm leading-relaxed">{aiSummary}</p>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleGenerateSummary}
                  disabled={summaryLoading}
                  className="text-violet-400 hover:text-violet-300 text-xs transition-colors"
                >
                  Regenerate
                </button>
                <button
                  onClick={() => setAiSummary("")}
                  className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            !summaryLoading && (
              <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 text-center">
                <p className="text-slate-500 text-sm">
                  No summary yet. Click &quot;Generate Summary&quot; after filling in your items.
                </p>
              </div>
            )
          )}
        </div>
      )}

      {/* Generate button */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={generateQuote}
          disabled={saving || quoteGenerated}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          {saving ? "Saving…" : quoteGenerated ? "Quote Generated" : "Generate Quote"}
        </button>
        {saveError && (
          <p className="text-red-400 text-sm">{saveError}</p>
        )}
      </div>

      {/* ==========================================================
    PDF Preview
    Only this section is printable because it is wrapped
    inside quoteRef.
========================================================== */}
      {showPreview && generatedQuote && (
        <>
          <div ref={quoteRef}>
            <QuotePreview
              businessSettings={businessSettings}
              quoteId={generatedQuote.id}
              quoteNumber={generatedQuote.quote_number}
              createdAt={generatedQuote.created_at}
              customerName={generatedQuote.customer_name}
              customerEmail={generatedQuote.customer_email}
              customerPhone={generatedQuote.customer_phone}
              items={generatedQuote.items}
              subtotal={generatedQuote.subtotal}
              gst={generatedQuote.gst}
              grandTotal={generatedQuote.grand_total}
              aiSummary={aiSummary}
            />
          </div>

          {/* ==========================================================
        Next Step (App UI Only)
        This is NOT inside quoteRef,
        so it will NOT appear in the exported PDF.
    ========================================================== */}
          <div className="mt-6 rounded-xl border border-blue-800 bg-blue-950/30 p-5">
            <h3 className="text-lg font-semibold text-blue-300">
              ✅ Next Step
            </h3>

            <p className="mt-2 text-sm text-slate-300 leading-6">
              Download or print this quotation, send it to your customer,
              then update its status from <strong>Draft</strong> to{" "}
              <strong>Sent</strong> on the Quotes page.
            </p>
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
