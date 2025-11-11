"use client";

import React from "react";
import SidebarContent from "./Sidebar";
import ProtectedRoute from "../provider/ProtectedRoute";
import { usePathname } from "next/navigation";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { CartProvider } from "@/app/context/CartContext"; // ✅

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const isHomePage = pathname === "/";
  const isLoginPage = pathname === "/authentication";
  // ✅ treat /brands and /cart pages as shop pages
  const isShop = pathname.startsWith("/brands") || pathname.startsWith("/cart");

  const user =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const isAuthenticated =
    user !== null && user !== undefined && user !== "null";

  console.log("Authenticated:", isAuthenticated);

  return (
    // ✅ CartProvider wraps *everything*, so state persists even when you switch routes
    <CartProvider>
      {isHomePage || isShop ? (
        // ✅ Navbar + Footer layout
        <div className="flex flex-col min-h-screen bg-slate-200">
          <Navbar />
          <main className="flex-grow pt-[140px]">{children}</main>
          <Footer />
        </div>
      ) : isLoginPage ? (
        // ✅ Login page layout
        <div className="min-h-screen flex flex-col bg-slate-200">
          <main className="flex-grow">{children}</main>
        </div>
      ) : (
        // ✅ Admin layout (sidebar)
        <div className="min-h-screen flex flex-col bg-slate-100">
          <ProtectedRoute>
            <div className="flex flex-1 h-full">
              <SidebarContent />
              <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="flex-1 p-10">{children}</div>
                <Footer />
              </div>
            </div>
          </ProtectedRoute>
        </div>
      )}
    </CartProvider>
  );
}
