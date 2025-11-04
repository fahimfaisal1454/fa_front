"use client";

import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import AxiosInstance from "@/app/components/AxiosInstance";

export default function AddBikeModelPage() {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({
    company: null,     // {value, label}
    name: "",
    image: null,       // File
  });
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  // load brands/companies
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await AxiosInstance.get("/companies/");
        setCompanies(
          (res.data || []).map((c) => ({ value: c.id, label: c.company_name }))
        );
      } catch (err) {
        console.error("Failed to load companies", err);
        alert("Could not load companies");
      }
    };
    loadCompanies();
  }, []);

  // image preview
  useEffect(() => {
    if (!form.image) return setPreview(null);
    const url = URL.createObjectURL(form.image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.image]);

  const canSubmit = useMemo(
    () => !!form.company && form.name.trim() !== "" && !!form.image,
    [form]
  );

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) setForm((f) => ({ ...f, image: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const data = new FormData();
    data.append("company", form.company.value);
    data.append("name", form.name.trim());
    if (form.image) data.append("image", form.image);

    setSaving(true);
    try {
      await AxiosInstance.post("/bike-models/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Model saved!");
      // reset
      setForm({ company: null, name: "", image: null });
      setPreview(null);
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save model");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="bg-white border rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Add Bike Model</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Brand / Company */}
          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <Select
              className="text-sm"
              options={companies}
              value={form.company}
              onChange={(opt) => setForm((f) => ({ ...f, company: opt }))}
              placeholder="Select brand (e.g., Hero, Yamaha)"
            />
          </div>

          {/* Model Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Model Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="e.g., Glamour, FZ, Pulsar 150"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Model Image</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="text-sm"
              />
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded border"
                />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Recommended: square image, at least 400×400.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!canSubmit || saving}
              className={`px-5 py-2 rounded text-white text-sm ${
                canSubmit && !saving
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {saving ? "Saving..." : "Save Model"}
            </button>
          </div>
        </form>
      </div>

      {/* Small help box */}
      <div className="mt-4 text-xs text-gray-600">
        After saving, this model will:
        <ul className="list-disc list-inside">
          <li>appear as suggestion in <b>Add Product → Model No</b></li>
          <li>power your public flow <b>Brands → Models → Products</b></li>
        </ul>
      </div>
    </div>
  );
}
