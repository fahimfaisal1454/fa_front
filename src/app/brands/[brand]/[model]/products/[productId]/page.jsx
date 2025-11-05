"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import AxiosInstance from "@/app/components/AxiosInstance";

export default function ProductDetailsPage() {
  const params = useParams();
  const brandParam = Array.isArray(params?.brand) ? params.brand[0] : params?.brand;
  const modelParam = Array.isArray(params?.model) ? params.model[0] : params?.model;
  const productIdParam = Array.isArray(params?.productId) ? params.productId[0] : params?.productId;

  const brandId = Number(brandParam);
  const modelId = Number(modelParam);
  const productId = Number(productIdParam);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [company, setCompany] = useState(null);
  const [bikeModel, setBikeModel] = useState(null);
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);

  // turn /media/... into absolute URL
  const apiBase = useMemo(() => {
    const b = AxiosInstance.defaults.baseURL || "";
    return b.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  }, []);
  const toImg = (src) => {
    if (!src) return null;
    if (/^https?:\/\//i.test(src)) return src;
    return `${apiBase}${src.startsWith("/") ? "" : "/"}${src}`;
  };

  useEffect(() => {
    if (!brandId || !modelId || !productId) return;
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        // 1) fetch company + model for breadcrumb/validation
        const [companyRes, modelRes] = await Promise.all([
          AxiosInstance.get(`/companies/${brandId}/`),
          AxiosInstance.get(`/bike-models/${modelId}/`),
        ]);
        if (!alive) return;

        const comp = companyRes?.data || null;
        const mdl = modelRes?.data || null;
        setCompany(comp);
        setBikeModel(mdl);

        if (!comp || !mdl) {
          if (alive) setLoading(false);
          return; // notFound below
        }

        // 2) fetch product by id
        const prodRes = await AxiosInstance.get(`/products/${productId}/`);
        if (!alive) return;
        const prod = prodRes?.data || null;

        // 3) validate product belongs to this brand+model
        const companyMatches =
          prod?.company?.id === brandId || prod?.company === brandId;

        const modelMatchesFK =
          prod?.bike_model?.id === modelId || prod?.bike_model === modelId;

        const modelMatchesText =
          !modelMatchesFK &&
          mdl?.name &&
          typeof prod?.model_no === "string" &&
          prod.model_no.trim().toLowerCase() === mdl.name.trim().toLowerCase();

        if (!companyMatches || !(modelMatchesFK || modelMatchesText)) {
          setLoading(false);
          return notFound();
        }

        setProduct(prod);

        // 4) related products (same company + model), exclude current
        let rel = [];
        try {
          // Prefer robust FK filter
          const urlFK = `/products/?company=${brandId}&bike_model=${modelId}`;
          const relFK = await AxiosInstance.get(urlFK);
          rel = Array.isArray(relFK?.data) ? relFK.data : [];

          // Fallback to model_no text if needed
          if ((!rel || rel.length === 0) && mdl?.name) {
            const urlTxt = `/products/?company=${brandId}&model_no=${encodeURIComponent(
              mdl.name
            )}`;
            const relTxt = await AxiosInstance.get(urlTxt);
            rel = Array.isArray(relTxt?.data) ? relTxt.data : [];
          }

          rel = (rel || []).filter((p) => p.id !== prod.id).slice(0, 8);
        } catch {
          rel = [];
        }

        if (!alive) return;
        setRelated(rel);
      } catch (e) {
        console.error("Product details error:", e);
        if (!alive) return;
        setError("Failed to load product.");
        setProduct(null);
        setRelated([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [brandId, modelId, productId]);

  if (!loading && (!company || !bikeModel)) return notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-12">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600 mb-4">
        <Link href="/brands" className="hover:underline">Brands</Link>
        <span className="mx-2">›</span>
        {company ? (
          <Link href={`/brands/${brandId}`} className="hover:underline">
            {company.company_name}
          </Link>
        ) : <span>Brand</span>}
        <span className="mx-2">›</span>
        {bikeModel ? (
          <Link href={`/brands/${brandId}/${modelId}`} className="hover:underline">
            {bikeModel.name}
          </Link>
        ) : <span>Model</span>}
        <span className="mx-2">›</span>
        <span className="font-semibold">{product?.product_name || "Product"}</span>
      </div>

      {loading ? (
        <div className="h-60 rounded-xl border bg-white shadow animate-pulse" />
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : !product ? (
        <div className="text-gray-600">Product not found.</div>
      ) : (
        <>
          {/* Product core */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white border rounded-xl shadow p-4 flex items-center justify-center">
              {product.image ? (
                <img
                  src={toImg(product.image)}
                  alt={product.product_name || "Product image"}
                  className="max-h-96 w-auto object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="h-64 w-full bg-gray-100 rounded flex items-center justify-center text-gray-500">
                  No image
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold mb-2">
                {product.product_name || "Product"}
              </h1>

              <div className="text-sm text-gray-600 mb-4">
                {product.part_no ? `SKU: ${product.part_no}` :
                 product.product_code ? `Code: ${product.product_code}` : ""}
              </div>

              {/* Optional fields if present in API */}
              {typeof product.price === "number" && (
                <div className="text-xl font-semibold mb-3">
                  ৳ {product.price.toFixed(2)}
                </div>
              )}
              {typeof product.current_stock === "number" && (
                <div className="text-sm mb-4">
                  Stock:{" "}
                  <span className={product.current_stock > 0 ? "text-green-600" : "text-red-600"}>
                    {product.current_stock > 0 ? product.current_stock : "Out of stock"}
                  </span>
                </div>
              )}

              {product.description && (
                <div className="prose max-w-none mb-6 text-gray-800 text-sm leading-6">
                  {product.description}
                </div>
              )}

              {/* Replace with your cart action */}
              <button
                type="button"
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
                onClick={() => {
                  // TODO: integrate your cart store/context here
                  console.log("Add to cart:", product.id);
                  alert("Added to cart!");
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>

          {/* Related */}
          <h2 className="text-xl font-semibold mb-4">Related Products</h2>
          {related.length === 0 ? (
            <div className="text-gray-600">No related products.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/brands/${brandId}/${modelId}/products/${p.id}`}
                  className="bg-white border rounded-xl shadow p-4 block"
                >
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
                    {p.product_name || "Part"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {p.part_no ? `SKU: ${p.part_no}` :
                     p.product_code ? `Code: ${p.product_code}` : ""}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
