"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import AxiosInstance from "@/app/components/AxiosInstance";

export default function PartsForModelPage() {
  const params = useParams();
  const brand = Array.isArray(params?.brand) ? params.brand[0] : params?.brand;
  const model = Array.isArray(params?.model) ? params.model[0] : params?.model;

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [bikeModel, setBikeModel] = useState(null);
  const [parts, setParts] = useState([]);
  const [error, setError] = useState(null);

  // Build absolute /media URLs
  const apiBase = useMemo(() => {
    const b = AxiosInstance.defaults.baseURL || "";
    return b.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  }, []);
  const toImg = (src) => {
    if (!src) return null;
    if (/^https?:\/\//i.test(src)) return src;
    return `${apiBase}${src.startsWith("/") ? "" : "/"}${src}`;
  };

  // Small helper to show a price if your API uses different field names
  const formatPrice = (p) => {
    const val =
      typeof p?.price === "number" ? p.price :
      typeof p?.selling_price === "number" ? p.selling_price :
      typeof p?.mrp === "number" ? p.mrp :
      null;
    if (val == null) return null;
    try {
      return `৳ ${Number(val).toFixed(2)}`;
    } catch {
      return `৳ ${val}`;
    }
  };

  useEffect(() => {
    if (!brand || !model) return;
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const brandId = Number(brand);
        const modelId = Number(model);
        if (!brandId || !modelId) {
          setError("Invalid brand/model ID.");
          setLoading(false);
          return;
        }

        // 1) fetch brand + model for breadcrumb
        const [companyRes, modelRes] = await Promise.all([
          AxiosInstance.get(`/companies/${brandId}/`),
          AxiosInstance.get(`/bike-models/${modelId}/`),
        ]);
        if (!alive) return;

        setCompany(companyRes.data || null);
        setBikeModel(modelRes.data || null);

        const modelName = modelRes?.data?.name || "";

        // 2) primary: by FK
        const fkUrl = `/products/?company=${brandId}&bike_model=${modelId}`;
        const fkRes = await AxiosInstance.get(fkUrl);
        let fetched = Array.isArray(fkRes.data) ? fkRes.data : [];

        // 3) fallback: by model_no text
        if (fetched.length === 0 && modelName) {
          const txtUrl = `/products/?company=${brandId}&model_no=${encodeURIComponent(modelName)}`;
          const txtRes = await AxiosInstance.get(txtUrl);
          fetched = Array.isArray(txtRes.data) ? txtRes.data : [];
        }

        if (!alive) return;
        setParts(fetched);
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

    return () => { alive = false; };
  }, [brand, model]);

  if (!loading && (!company || !bikeModel)) return notFound();

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
        ) : <span>Brand</span>}
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
          {parts.map((p) => {
            const priceText = formatPrice(p);
            return (
              <div key={p.id} className="bg-white border rounded-xl shadow p-4 flex flex-col">
                <div className="h-28 bg-gray-100 rounded mb-3 flex items-center justify-center">
                  {p.image ? (
                    <img
                      src={toImg(p.image)}
                      alt={p.product_name || "Part"}
                      className="h-28 w-auto object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">No Image</span>
                  )}
                </div>

                <div className="font-semibold text-sm line-clamp-2">
                  {p.product_name || "Part"}
                </div>

                <div className="text-xs text-gray-500">
                  {p.part_no ? `SKU: ${p.part_no}` :
                   p.product_code ? `Code: ${p.product_code}` : ""}
                </div>

                {priceText && (
                  <div className="mt-1 text-sm font-semibold text-gray-900">
                    {priceText}
                  </div>
                )}

                {/* one button that takes users to product details where they can add to cart */}
                <Link
                  href={`/brands/${brand}/${model}/products/${p.id}`}
                  className="mt-3 w-full text-center bg-blue-600 text-white text-sm py-1.5 rounded hover:bg-blue-700"
                >
                  View / Add to Cart
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
