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
  const [parts, setParts] = useState([]); // each part will be { ...product, _stock }
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

  // Helpers — figure out stock availability & price robustly
  const isInStock = (s) => {
    if (!s) return false;
    const candidates = [
      s.available_qty,
      s.available_quantity,
      s.quantity,
      s.qty,
      s.stock_qty,
      s.current_stock,
      s.stock, // catch-all
    ].filter((v) => typeof v !== "undefined" && v !== null);

    if (candidates.length === 0) {
      // If quantity fields aren't exposed, treat sale_price presence as "in stock"
      return !!s.sale_price;
    }
    return candidates.some((n) => Number(n) > 0);
  };

  const getDisplayPrice = (product) => {
    // Prefer stock sale price; otherwise fall back to product prices
    const s = product?._stock;
    const pick = (obj, keys) => {
      for (const k of keys) {
        if (obj && obj[k] != null && obj[k] !== "") return obj[k];
      }
      return null;
    };

    const val =
      pick(s, ["sale_price"]) ??
      pick(product, ["product_bdt", "product_mrp", "price", "mrp", "selling_price", "sale_price"]);

    if (val == null) return null;

    const num = parseFloat(val);
    return Number.isNaN(num) ? `৳ ${val}` : `৳ ${num.toFixed(2)}`;
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

        // 2) products (primary by FK)
        const fkUrl = `/products/?company=${brandId}&bike_model=${modelId}`;
        const fkRes = await AxiosInstance.get(fkUrl);
        let fetched = Array.isArray(fkRes.data) ? fkRes.data : [];

        // 3) fallback by model name if nothing found
        if (fetched.length === 0 && modelName) {
          const txtUrl = `/products/?company=${brandId}&model_no=${encodeURIComponent(modelName)}`;
          const txtRes = await AxiosInstance.get(txtUrl);
          fetched = Array.isArray(txtRes.data) ? txtRes.data : [];
        }

        // 4) fetch stock for each product to pick sale_price & availability
        // (If your /stocks endpoint supports product__in, switch to one batched request.)
        const withStock = await Promise.all(
          fetched.map(async (prod) => {
            try {
              // try to narrow by both product and part_no
              const qs =
                prod?.part_no
                  ? `/stocks/?product=${prod.id}&part_no=${encodeURIComponent(prod.part_no)}`
                  : `/stocks/?product=${prod.id}`;
              const res = await AxiosInstance.get(qs);
              const stock = Array.isArray(res.data) ? res.data[0] : null;
              return { ...prod, _stock: stock || null };
            } catch {
              return { ...prod, _stock: null };
            }
          })
        );

        if (!alive) return;
        setParts(withStock);
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl border bg-gray-100 shadow animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : parts.length === 0 ? (
        <div className="text-gray-600">No parts found for this model.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 place-items-center">
          {parts.map((p) => {
            const stockOK = isInStock(p?._stock);
            const priceText = getDisplayPrice(p);

            return (
              <div
                key={p.id}
                className="bg-white border border-gray-300 rounded-2xl shadow-sm hover:shadow-lg transition p-4 flex flex-col items-stretch justify-between w-56 aspect-square"
              >
                {/* Image */}
                <div className="relative flex items-center justify-center flex-1 w-full">
                  {!stockOK && (
                    <span className="absolute top-0 right-0 mt-1 mr-1 text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                      Out of stock
                    </span>
                  )}
                  {p.image ? (
                    <img
                      src={toImg(p.image)}
                      alt={p.product_name || "Part"}
                      className="max-h-36 max-w-[95%] object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-100 grid place-items-center text-xs text-gray-500">
                      No Image
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="mt-3">
                  <div className="font-semibold text-sm line-clamp-2 text-gray-900 text-center">
                    {p.product_name || "Part"}
                  </div>

                  {(p.part_no || p.product_code) && (
                    <div className="text-xs text-gray-500 text-center mt-0.5">
                      {p.part_no
                        ? `SKU: ${p.part_no}`
                        : p.product_code
                        ? `Code: ${p.product_code}`
                        : ""}
                    </div>
                  )}

                  {priceText && (
                    <div className="mt-1 text-sm font-semibold text-gray-900 text-center">
                      {priceText}
                    </div>
                  )}

                  {/* CTA */}
                  <Link
                    href={`/brands/${brand}/${model}/products/${p.id}`}
                    className={`mt-3 w-full block text-center text-sm py-1.5 rounded ${
                      stockOK
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                    aria-disabled={!stockOK}
                    tabIndex={stockOK ? 0 : -1}
                  >
                    {stockOK ? "View / Add to Cart" : "View Details"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
