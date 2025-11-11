"use client";
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [ready, setReady] = useState(false); // ✅ added flag

  // ✅ Load cart ONLY after the client is ready
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("cart");
      if (saved) setCart(JSON.parse(saved));
    } catch (err) {
      console.error("Cart load error:", err);
      localStorage.removeItem("cart");
    } finally {
      setReady(true);
    }
  }, []);

  // ✅ Save changes after initial load
  useEffect(() => {
    if (!ready) return; // only after cart has loaded
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, ready]);

  const addToCart = (product, options = {}) => {
    const { maxQty } = options;
    const addQty = Math.max(1, Number(product.qty) || 1);

    setCart((prev) => {
      const idx = prev.findIndex((i) => i.id === product.id);
      if (idx >= 0) {
        const existing = prev[idx];
        let nextQty = existing.qty + addQty;

        if (typeof maxQty === "number" && nextQty > maxQty) {
          nextQty = maxQty;
          alert(`Only ${maxQty} available. Adjusted to ${maxQty}.`);
        }

        const updated = [...prev];
        updated[idx] = { ...existing, qty: nextQty };
        return updated;
      }

      let initialQty = addQty;
      if (typeof maxQty === "number" && initialQty > maxQty) {
        initialQty = maxQty;
        alert(`Only ${maxQty} available. Adjusted to ${maxQty}.`);
      }

      return [...prev, { ...product, qty: initialQty }];
    });
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
