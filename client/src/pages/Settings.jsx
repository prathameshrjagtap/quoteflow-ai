import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchSettings, saveSettings } from "../lib/db";

// Validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const GST_REGEX   = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/;

export default function Settings() {
  const { user } = useAuth();

  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [address, setAddress] = useState("");
  const [logoBase64, setLogoBase64] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSettings(user.id);
        if (data) {
          setCompanyName(data.company_name || "");
          setCompanyEmail(data.company_email || "");
          setCompanyPhone(data.company_phone || "");
          setGstNumber(data.gst_number || "");
          setAddress(data.address || "");
          setLogoBase64(data.logo_base64 || "");
          cacheToLocalStorage(data);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.id]);

  const cacheToLocalStorage = (data) => {
    localStorage.setItem(
      "businessSettings",
      JSON.stringify({
        companyName:  data.company_name  ?? data.companyName  ?? "",
        companyEmail: data.company_email ?? data.companyEmail ?? "",
        companyPhone: data.company_phone ?? data.companyPhone ?? "",
        gstNumber:    data.gst_number    ?? data.gstNumber    ?? "",
        address:      data.address       ?? "",
        logoBase64:   data.logo_base64   ?? data.logoBase64   ?? "",
      })
    );
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setLogoBase64(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoBase64("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errors = {};

    if (companyEmail.trim() && !EMAIL_REGEX.test(companyEmail.trim())) {
      errors.companyEmail = "Enter a valid email address.";
    }

    if (companyPhone.trim() && !PHONE_REGEX.test(companyPhone.trim())) {
      errors.companyPhone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (gstNumber.trim() && !GST_REGEX.test(gstNumber.trim().toUpperCase())) {
      errors.gstNumber = "Enter a valid 15-character GSTIN (e.g. 22AAAAA0000A1Z5).";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    setSaveError("");

    const settings = {
      companyName,
      companyEmail,
      companyPhone,
      gstNumber: gstNumber.trim().toUpperCase(),
      address,
      logoBase64,
    };

    try {
      await saveSettings(user.id, settings);
      cacheToLocalStorage(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError("Failed to save settings. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors";

  const inputErrorClass =
    "w-full bg-slate-950 border border-red-500 rounded-lg px-4 py-3 focus:outline-none focus:border-red-400 transition-colors";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Business Settings</h2>
        <p className="text-slate-400 mt-2">
          Your company details appear on every generated PDF.
        </p>
      </div>

      <div className="space-y-6">
        {/* Logo Upload */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h3 className="text-lg font-semibold mb-4">Company Logo</h3>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-xl border border-slate-700 bg-slate-950 flex items-center justify-center shrink-0 overflow-hidden">
              {logoBase64 ? (
                <img src={logoBase64} alt="Company logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-slate-600 text-xs text-center px-2">No logo</span>
              )}
            </div>

            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="inline-block bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
              >
                {logoBase64 ? "Change Logo" : "Upload Logo"}
              </label>
              {logoBase64 && (
                <button
                  onClick={removeLogo}
                  className="block text-red-400 hover:text-red-300 text-sm transition-colors"
                >
                  Remove logo
                </button>
              )}
              <p className="text-slate-500 text-xs">PNG, JPG or SVG — max 2 MB</p>
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h3 className="text-lg font-semibold mb-4">Company Details</h3>
          <div className="space-y-4">

            {/* Company Name */}
            <div>
              <label className="block text-slate-400 text-sm mb-1">Company Name</label>
              <input
                type="text"
                placeholder="Acme Pvt. Ltd."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={inputClass}
              />
            </div>

            {/* Email + Phone */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Email</label>
                <input
                  type="email"
                  placeholder="hello@acme.com"
                  value={companyEmail}
                  onChange={(e) => {
                    setCompanyEmail(e.target.value);
                    if (fieldErrors.companyEmail)
                      setFieldErrors((p) => ({ ...p, companyEmail: "" }));
                  }}
                  className={fieldErrors.companyEmail ? inputErrorClass : inputClass}
                />
                {fieldErrors.companyEmail && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.companyEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-1">Phone</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  value={companyPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setCompanyPhone(val);
                    if (fieldErrors.companyPhone)
                      setFieldErrors((p) => ({ ...p, companyPhone: "" }));
                  }}
                  className={fieldErrors.companyPhone ? inputErrorClass : inputClass}
                />
                {fieldErrors.companyPhone && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.companyPhone}</p>
                )}
              </div>
            </div>

            {/* GST Number */}
            <div>
              <label className="block text-slate-400 text-sm mb-1">
                GST Number
                <span className="text-slate-600 ml-1">(15 characters)</span>
              </label>
              <input
                type="text"
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
                value={gstNumber}
                onChange={(e) => {
                  setGstNumber(e.target.value.toUpperCase());
                  if (fieldErrors.gstNumber)
                    setFieldErrors((p) => ({ ...p, gstNumber: "" }));
                }}
                className={fieldErrors.gstNumber ? inputErrorClass : inputClass}
              />
              {fieldErrors.gstNumber && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.gstNumber}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-slate-400 text-sm mb-1">Business Address</label>
              <textarea
                placeholder="123 MG Road, Pune, Maharashtra 411001"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className={inputClass + " resize-none"}
              />
            </div>
          </div>
        </div>

        {/* Live Preview */}
        {companyName && (
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h3 className="text-lg font-semibold mb-4">PDF Header Preview</h3>
            <div className="bg-slate-950 rounded-lg p-5 border border-slate-700">
              <div className="flex items-start gap-4">
                {logoBase64 && (
                  <img
                    src={logoBase64}
                    alt="logo preview"
                    className="w-14 h-14 object-contain rounded shrink-0"
                  />
                )}
                <div>
                  <p className="text-2xl font-bold">{companyName}</p>
                  <div className="mt-1 space-y-0.5 text-slate-400 text-sm">
                    {companyEmail && <p>{companyEmail}</p>}
                    {companyPhone && <p>{companyPhone}</p>}
                    {gstNumber && <p>GST: {gstNumber}</p>}
                    {address && <p>{address}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors px-6 py-3 rounded-lg font-medium"
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>
          {saved && (
            <span className="text-green-400 text-sm font-medium">✓ Settings saved</span>
          )}
          {saveError && (
            <span className="text-red-400 text-sm">{saveError}</span>
          )}
        </div>
      </div>
    </div>
  );
}
