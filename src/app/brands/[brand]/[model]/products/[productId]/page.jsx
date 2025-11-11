"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import AxiosInstance from "@/app/components/AxiosInstance";
import { useCart } from "@/app/context/CartContext";

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
  const [stock, setStock] = useState(undefined); // undefined = not fetched yet, null = fetched but none
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);

  const { cart, addToCart } = useCart();

  // base url for images (/media/…)
  const apiBase = useMemo(() => {
    const b = AxiosInstance.defaults.baseURL || "";
    return b.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  }, []);
  const toImg = (src) => {
    if (!src) return null;
    if (/^https?:\/\//i.test(src)) return src;
    return `${apiBase}${src.startsWith("/") ? "" : "/"}${src}`;
  };

  // ---- Stock helpers -------------------------------------------------
  const readStockQty = (s) => {
    if (!s) return null;
    const candidates = [
      s.current_stock_qty, s.current_stock_quantity,
      s.available_qty, s.available_quantity,
      s.quantity, s.qty, s.stock_qty, s.current_stock, s.stock,
    ];
    for (const v of candidates) {
      if (v !== undefined && v !== null) {
        const n = Number(v);
        if (!Number.isNaN(n)) return n;
        return null;
      }
    }
    return null;
  };

  const readSalePrice = (prod, s) => {
    const pick = (obj, keys) => {
      for (const k of keys) if (obj && obj[k] != null && obj[k] !== "") return obj[k];
      return null;
    };
    const val =
      pick(s, ["sale_price"]) ??
      pick(prod, ["product_bdt", "product_mrp", "price", "mrp", "selling_price", "sale_price"]);
    if (val == null) return null;
    const num = parseFloat(val);
    return Number.isNaN(num) ? `৳ ${val}` : `৳ ${num.toFixed(2)}`;
  };

  // --------------------------------------------------------------------

  useEffect(() => {
    if (!brandId || !modelId || !productId) return;
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
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
          return;
        }

        const prodRes = await AxiosInstance.get(`/products/${productId}/`);
        if (!alive) return;
        const prod = prodRes?.data || null;

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

        // fetch stock for this product (+ optional part_no)
        try {
          const stockUrl = prod?.part_no
            ? `/stocks/?product=${prod.id}&part_no=${encodeURIComponent(prod.part_no)}`
            : `/stocks/?product=${prod.id}`;
          const stockRes = await AxiosInstance.get(stockUrl);
          const s = Array.isArray(stockRes?.data) ? stockRes.data[0] : null;
          if (alive) setStock(s || null);
        } catch {
          if (alive) setStock(null);
        }

        // related
        let rel = [];
        try {
          const urlFK = `/products/?company=${brandId}&bike_model=${modelId}`;
          const relFK = await AxiosInstance.get(urlFK);
          rel = Array.isArray(relFK?.data) ? relFK.data : [];
          if ((!rel || rel.length === 0) && mdl?.name) {
            const urlTxt = `/products/?company=${brandId}&model_no=${encodeURIComponent(mdl.name)}`;
            const relTxt = await AxiosInstance.get(urlTxt);
            rel = Array.isArray(relTxt?.data) ? relTxt.data : [];
          }
          rel = (rel || []).filter((p) => p.id !== prod.id).slice(0, 8);
        } catch {
          rel = [];
        }
        if (alive) setRelated(rel);
      } catch (e) {
        console.error("Product details error:", e);
        if (!alive) return;
        setError("Failed to load product.");
        setProduct(null);
        setStock(null);
        setRelated([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [brandId, modelId, productId]);

  const priceText = readSalePrice(product, stock);
  const stockQty = readStockQty(stock); // number | null
  const stockLoaded = stock !== undefined;
  const available = stockLoaded ? (stockQty === null ? true : stockQty > 0) : true;

  // build the cart item
  const buildCartItem = () => ({
    id: product.id,
    product_name: product.product_name,
    image: toImg(product.image),
    price:
      parseFloat(
        stock?.sale_price ??
          product?.product_bdt ??
          product?.product_mrp ??
          product?.price ??
          0
      ) || 0,
    part_no: product.part_no || product.product_code || null,
    qty: quantity,
  });

  // guard: keep quantity within 1..stockQty (if known)
  useEffect(() => {
    if (stockQty != null && quantity > stockQty) setQuantity(stockQty > 0 ? stockQty : 1);
    if (quantity < 1) setQuantity(1);
  }, [stockQty]); // eslint-disable-line

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-12">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600 mb-4">
        <Link href="/brands" className="hover:underline">Brands</Link>
        <span className="mx-2">›</span>
        {company ? (
          <Link href={`/brands/${brandId}`} className="hover:underline">{company.company_name}</Link>
        ) : (<span>Brand</span>)}
        <span className="mx-2">›</span>
        {bikeModel ? (
          <Link href={`/brands/${brandId}/${modelId}`} className="hover:underline">{bikeModel.name}</Link>
        ) : (<span>Model</span>)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Image */}
            <div className="bg-white border rounded-xl shadow p-4 flex items-center justify-center relative">
              {stockLoaded && stockQty !== null && stockQty <= 0 && (
                <span className="absolute top-2 right-2 text-[11px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                  Out of stock
                </span>
              )}
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

            {/* Details */}
            <div>
              <h1 className="text-2xl font-bold mb-2">{product.product_name}</h1>

              <div className="text-sm text-gray-600 mb-2">
                {product.part_no
                  ? `SKU: ${product.part_no}`
                  : product.product_code
                  ? `Code: ${product.product_code}`
                  : ""}
              </div>

              {priceText && <div className="text-2xl font-semibold mb-2">{priceText}</div>}

              {/* Quantity (editable + buttons) */}
              <label className="block text-sm text-gray-600 mb-1">Quantity</label>
              <div className="flex items-center gap-2 mb-6">
                <button
                  type="button"
                  className="bg-gray-200 px-3 py-1 rounded text-lg font-semibold"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>

                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  // do not show max to the user to avoid leaking stock; we just clamp on change
                  className="w-20 border rounded px-3 py-1 text-center"
                  value={quantity}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^\d]/g, "");
                    let n = v === "" ? 1 : parseInt(v, 10);
                    if (Number.isNaN(n) || n < 1) n = 1;
                    if (stockQty != null && n > stockQty) n = stockQty; // silently clamp
                    setQuantity(n);
                  }}
                />

                <button
                  type="button"
                  className="bg-gray-200 px-3 py-1 rounded text-lg font-semibold"
                  onClick={() =>
                    setQuantity((q) => {
                      const next = q + 1;
                      if (stockQty != null && next > stockQty) return q; // block
                      return next;
                    })
                  }
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                disabled={!available}
                className={`w-full md:w-auto px-5 py-2 rounded ${
                  available
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
                onClick={() => {
                  // hard guard against over-stock
                  const inCart = cart.find((c) => c.id === product.id)?.qty || 0;
                  const desired = inCart + quantity;
                  if (stockQty != null && desired > stockQty) {
                    alert("Not enough stock to fulfill that quantity.");
                    return;
                  }
                  addToCart(buildCartItem());
                  alert(`✅ Added ${quantity} item(s) to cart!`);
                }}
              >
                {available ? "Add to Cart" : "Out of Stock"}
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
                    {p.part_no ? `SKU: ${p.part_no}` : p.product_code ? `Code: ${p.product_code}` : ""}
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
