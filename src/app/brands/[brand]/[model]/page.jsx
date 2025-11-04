"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import AxiosInstance from "@/app/components/AxiosInstance";

export default function PartsPage() {
  const { brand, model } = useParams(); // brand = companyId, model = bikeModelId
  const [parts, setParts] = useState([]);
  const [brandInfo, setBrandInfo] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brand || !model) return;

    (async () => {
      try {
        // Breadcrumb / titles
        const [companyRes, modelRes] = await Promise.all([
          AxiosInstance.get(`/companies/${brand}/`),
          AxiosInstance.get(`/bike-models/${model}/`),
        ]);
        setBrandInfo(companyRes.data);
        setModelInfo(modelRes.data);

        // ✅ Fetch parts only for this brand + model
        // Backend should support these filters in ProductViewSet.get_queryset()
        // e.g., ?company=<id>&bike_model=<id>
        const partsRes = await AxiosInstance.get(
          `/products/?company=${brand}&bike_model=${model}`
        );
        setParts(partsRes.data || []);
      } catch (err) {
        console.error("Failed to load parts:", err);
        setParts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [brand, model]);

  if (!loading && (!brandInfo || !modelInfo)) return notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-12">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600 mb-4">
        <Link href="/brands" className="hover:underline">Brands</Link>
        <span className="mx-2">›</span>
        <Link href={`/brands/${brand}`} className="hover:underline">
          {brandInfo?.company_name || "Brand"}
        </Link>
        <span className="mx-2">›</span>
        <span className="font-semibold">{modelInfo?.name || "Model"}</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">
        {modelInfo?.name || "Model"} Spare Parts
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl border bg-white shadow animate-pulse" />
          ))}
        </div>
      ) : parts.length === 0 ? (
        <div className="text-gray-600">No parts found for this model.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {parts.map((p) => (
            <div key={p.id} className="bg-white border rounded-xl shadow p-4">
              <div className="h-24 bg-gray-100 rounded mb-3 flex items-center justify-center">
                {p.image ? (
                  <img src={p.image} alt={p.product_name} className="h-24 object-contain" />
                ) : (
                  <span className="text-xs text-gray-500">Image</span>
                )}
              </div>
              <div className="font-semibold text-sm line-clamp-2">
                {p.product_name}
              </div>
              <div className="text-xs text-gray-500">
                SKU: {p.part_no || p.product_code}
              </div>
              <button className="mt-3 w-full text-center bg-blue-600 text-white text-sm py-1.5 rounded hover:bg-blue-700">
                View / Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
