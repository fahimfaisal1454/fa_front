"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import AxiosInstance from "@/app/components/AxiosInstance";

export default function PartsForModelPage() {
  const params = useParams();
  // Next returns strings; if they are arrays (catch-all), take the first
  const brand = Array.isArray(params?.brand) ? params.brand[0] : params?.brand;   // company id
  const model = Array.isArray(params?.model) ? params.model[0] : params?.model;   // bike model id

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [bikeModel, setBikeModel] = useState(null);
  const [parts, setParts] = useState([]);
  const [error, setError] = useState(null);

  // Base API (for turning /media/... into absolute URL)
  const apiBase = useMemo(() => {
    const b = AxiosInstance.defaults.baseURL || "";
    return b.replace(/\/+$/, ""); // strip trailing slash
  }, []);

  const toImg = (src) => {
    if (!src) return null;
    if (/^https?:\/\//i.test(src)) return src;
    // ensure single slash between base and path
    return `${apiBase}${src.startsWith("/") ? "" : "/"}${src}`;
  };

  useEffect(() => {
    if (!brand || !model) return;
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch everything together
        const [companyRes, modelRes, partsRes] = await Promise.all([
          AxiosInstance.get(`/companies/${brand}/`),
          AxiosInstance.get(`/bike-models/${model}/`),
          AxiosInstance.get(`/products/?company=${brand}&bike_model=${model}`),
        ]);

        if (!alive) return;

        setCompany(companyRes.data || null);
        setBikeModel(modelRes.data || null);
        setParts(Array.isArray(partsRes.data) ? partsRes.data : []);
      } catch (err) {
        console.error("Fetch parts error:", err);
        if (!alive) return;
        setError("Failed to load parts.");
        setCompany(null);
        setBikeModel(null);
        setParts([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [brand, model]);

  if (!loading && (!company || !bikeModel)) {
    // If either resource 404s, show a 404 page
    return notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-12">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600 mb-4">
        <Link href="/brands" className="hover:underline">Brands</Link>
        <span className="mx-2">›</span>
        {company ? (
          <Link href={`/brands/${brand}`} className="hover:underline">
            {company.company_name}
          </Link>
        ) : (
          <span>Brand</span>
        )}
        <span className="mx-2">›</span>
        <span className="font-semibold">{bikeModel?.name || "Model"}</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">
        {bikeModel?.name || "Model"} Spare Parts
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl border bg-white shadow animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : parts.length === 0 ? (
        <div className="text-gray-600">No parts found for this model.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {parts.map((p) => (
            <div key={p.id} className="bg-white border rounded-xl shadow p-4">
              <div className="h-28 bg-gray-100 rounded mb-3 flex items-center justify-center">
                {p.image ? (
                  <img
                    src={toImg(p.image)}
                    alt={p.product_name || "Part"}
                    className="h-28 w-auto object-contain"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-xs text-gray-500">Image</span>
                )}
              </div>

              <div className="font-semibold text-sm line-clamp-2">
                {p.product_name}
              </div>

              <div className="text-xs text-gray-500">
                {p.part_no ? `SKU: ${p.part_no}` : p.product_code ? `Code: ${p.product_code}` : ""}
              </div>

              <button
                className="mt-3 w-full text-center bg-blue-600 text-white text-sm py-1.5 rounded hover:bg-blue-700"
                type="button"
              >
                View / Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
