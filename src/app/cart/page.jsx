"use client";

import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/app/context/CartContext";
import AxiosInstance from "@/app/components/AxiosInstance";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const [isClient, setIsClient] = useState(false);

  // ✅ Avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ Handle image path for Django media
  const apiBase = useMemo(() => {
    const b = AxiosInstance.defaults.baseURL || "";
    return b.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  }, []);

  const toImg = (src) => {
    if (!src) return "/placeholder.png";
    if (/^https?:\/\//i.test(src)) return src;
    return `${apiBase}${src.startsWith("/") ? "" : "/"}${src}`;
  };

  // ✅ Safe total calculation
  const total = cart.reduce(
    (sum, i) => sum + (parseFloat(i.price) || 0) * (i.qty || 1),
    0
  );

  if (!isClient) {
    // Render consistent placeholder HTML on the server to avoid hydration error
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-500">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {cart.length === 0 ? (
        <p>
          Your cart is empty.{" "}
          <Link href="/brands" className="text-blue-600 hover:underline">
            Continue shopping
          </Link>
        </p>
      ) : (
        <>
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b py-2 items-center"
            >
              <div className="flex items-center gap-3">
                <img
                  src={toImg(item.image)}
                  alt={item.product_name}
                  className="h-14 w-14 object-contain"
                />
                <div>
                  <h2 className="font-semibold">{item.product_name}</h2>
                  <p>৳ {parseFloat(item.price).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span>Qty: {item.qty}</span>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-600 text-sm hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={clearCart}
              className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
            >
              Clear Cart
            </button>
            <h2 className="font-semibold text-xl">
              Total: ৳ {total.toFixed(2)}
            </h2>
          </div>

          {/* Optional: Checkout button */}
          <div className="mt-6 flex justify-end">
            <button className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition">
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
