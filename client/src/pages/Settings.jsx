import { useState, useEffect } from "react";

export default function Settings() {
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const settings =
      JSON.parse(localStorage.getItem("businessSettings")) || {};

    setCompanyName(settings.companyName || "");
    setCompanyEmail(settings.companyEmail || "");
    setCompanyPhone(settings.companyPhone || "");
    setGstNumber(settings.gstNumber || "");
    setAddress(settings.address || "");
  }, []);

  const saveSettings = () => {
    const settings = {
      companyName,
      companyEmail,
      companyPhone,
      gstNumber,
      address,
    };

    localStorage.setItem(
      "businessSettings",
      JSON.stringify(settings)
    );

    alert("Settings saved successfully!");
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-3xl font-bold">
        Business Settings
      </h2>

      <p className="text-slate-400 mt-2 mb-8">
        Configure your company details.
      </p>

      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) =>
              setCompanyName(e.target.value)
            }
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3"
          />

          <input
            type="email"
            placeholder="Company Email"
            value={companyEmail}
            onChange={(e) =>
              setCompanyEmail(e.target.value)
            }
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3"
          />

          <input
            type="text"
            placeholder="Company Phone"
            value={companyPhone}
            onChange={(e) =>
              setCompanyPhone(e.target.value)
            }
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3"
          />

          <input
            type="text"
            placeholder="GST Number"
            value={gstNumber}
            onChange={(e) =>
              setGstNumber(e.target.value)
            }
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3"
          />

          <textarea
            placeholder="Business Address"
            value={address}
            onChange={(e) =>
              setAddress(e.target.value)
            }
            rows={4}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3"
          />

          <button
            onClick={saveSettings}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}