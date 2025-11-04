"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Select from "react-select";
import AxiosInstance from "@/app/components/AxiosInstance";

export default function BikeModelListPage() {
  const [models, setModels] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState(null); // { value, label } or null
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  // Build query string when filters change
  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("search", q.trim());
    if (company?.value) p.set("company", company.value);
    return p.toString();
  }, [q, company]);

  // Load brands once
  useEffect(() => {
    (async () => {
      try {
        const res = await AxiosInstance.get("/companies/");
        setCompanies((res.data || []).map(c => ({ value: c.id, label: c.company_name })));
      } catch (err) {
        console.error("Failed to load companies:", err);
      }
    })();
  }, []);

  // Load models whenever filters change
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const url = queryString ? `/bike-models/?${queryString}` : "/bike-models/";
        const res = await AxiosInstance.get(url);
        setModels(res.data || []);
      } catch (err) {
        console.error("Failed to load models:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [queryString]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this model?")) return;
    try {
      await AxiosInstance.delete(`/bike-models/${id}/`);
      setModels(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete model.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Bike Model List</h1>
        <Link
          href="/bike-models/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          + Add Bike Model
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl shadow p-4 mb-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1">Brand</label>
            <Select
              options={companies}
              value={company}
              onChange={setCompany}
              isClearable
              placeholder="All brands"
              className="text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Search</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by model name"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="text-left p-3 w-20">Image</th>
              <th className="text-left p-3">Model Name</th>
              <th className="text-left p-3">Brand</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-right p-3 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : models.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No models found
                </td>
              </tr>
            ) : (
              models.map((m) => (
                <tr key={m.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    {m.image ? (
                      <img
                        src={m.image} // e.g. http://127.0.0.1:8000/media/...
                        alt={m.name}
                        className="w-12 h-12 rounded object-cover border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-100 border flex items-center justify-center text-[10px] text-gray-500">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="p-3">{m.name}</td>
                  <td className="p-3">{m.company_detail?.company_name || "-"}</td>
                  <td className="p-3">{m.slug}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      {/* Add edit page later if needed */}
                      {/* <Link href={`/bike-models/${m.id}/edit`} className="px-3 py-1 rounded border text-xs hover:bg-gray-50">Edit</Link> */}
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="px-3 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Tip: filter by brand or search by model name.
      </p>
    </div>
  );
}
