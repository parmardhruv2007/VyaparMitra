import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useVyapar } from "../context/VyaparContext";
import PageMeta from "../components/common/PageMeta";

export default function BusinessAssessmentForm() {
  const navigate = useNavigate();
  const { input, updateInput, generateReport, isGenerating } = useVyapar();

  const [formData, setFormData] = useState({ ...input });
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    "Dairy & Livestock",
    "Retail & Kirana Store",
    "Textiles & Garment Manufacturing",
    "Agro-Processing & Food Products",
    "Handicrafts & Artisanal Goods",
    "Vehicle Repair & Auto Services",
    "Poultry & Fisheries",
    "Construction Materials & Hardware",
    "Beauty Parlor & Personal Care",
  ];

  const languages = [
    "English",
    "Hindi (हिंदी)",
    "Marathi (मराठी)",
    "Bengali (বাংলা)",
    "Telugu (తెలుగు)",
    "Tamil (தமிழ்)",
    "Gujarati (ગુજરાતી)",
    "Kannada (ಕನ್ನಡ)",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateInput(formData);
    setSubmitted(true);
    await generateReport(formData);
    navigate("/");
  };

  return (
    <>
      <PageMeta
        title="Business Assessment Form | VyaparMitra"
        description="Enter location, available margin capital, and business category for hyper-local feasibility analysis."
      />

      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User & Business Assessment
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Provide your location and available margin capital to compute scheme eligibility and hyper-local market feasibility.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Language:</span>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>

        {submitted && (
          <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-brand-800 dark:border-brand-900/50 dark:bg-brand-900/20 dark:text-brand-300 flex items-center gap-2">
            <span className="animate-spin text-lg">⚙️</span>
            {isGenerating ? "Analyzing hyper-local market data and structuring financial plan with AI..." : "Business details saved successfully! Redirecting to Dashboard..."}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-gray-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                1
              </span>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Location Details (Rural / Semi-Urban)
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g. Gujarat"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  District <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="e.g. Ahmedabad"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Block / Taluka <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.block}
                  onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                  placeholder="e.g. Sanand"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Village / Town Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  placeholder="e.g. Changodar"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Business & Capital Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-3 dark:border-gray-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                2
              </span>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Proposed Business & Margin Capital
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Proposed Business Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Available Margin Capital (₹ INR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-sm font-semibold text-gray-500">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={formData.marginCapital}
                    onChange={(e) =>
                      setFormData({ ...formData, marginCapital: Number(e.target.value) || 0 })
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white pl-8 pr-4 py-2.5 text-sm font-medium text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  Calculated Feasible Project Cost:{" "}
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    ₹{(formData.marginCapital / 0.1).toLocaleString("en-IN")}
                  </span>{" "}
                  (Margin represents 10% of total project cost).
                </p>
              </div>
            </div>

            {/* Quick Financial Scheme Router Preview Card */}
            <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50/50 p-4 dark:border-brand-900/40 dark:bg-brand-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-brand-700 dark:text-brand-400 font-semibold">
                    Auto-Routed Loan Scheme Preview
                  </span>
                  <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                    {formData.marginCapital / 0.1 <= 140000 ? "Micro Finance Scheme" : "Term Loan Scheme"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white">
                    {formData.marginCapital / 0.1 <= 140000 ? "Up to 6.5% Interest" : "8.0% Interest"}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Max Financing: 90% (₹{((formData.marginCapital / 0.1) * 0.9).toLocaleString("en-IN")})
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className={`rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition \${isGenerating ? "bg-brand-400 cursor-not-allowed" : "bg-brand-500 hover:bg-brand-600"}`}
            >
              {isGenerating ? "Generating..." : "Generate Feasibility Report & Financial Roadmap →"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
