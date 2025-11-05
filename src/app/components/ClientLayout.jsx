"use client";

import React from "react";
import SidebarContent from "./Sidebar";
import ProtectedRoute from "../provider/ProtectedRoute";
import { usePathname } from "next/navigation";

import Footer from "./Footer";
import Navbar from "./Navbar";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const isHomePage = pathname === "/";
  const isLoginPage = pathname === "/authentication";
  // ✅ include all /brands paths
  const isShop = pathname.startsWith("/brands");

  const user =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const isAuthenticated =
    user !== null && user !== undefined && user !== "null";

  console.log("Authenticated:", isAuthenticated);

  // ✅ Navbar + Footer for home and shop
  if (isHomePage || isShop) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-200">
        <Navbar />
        {/* Add top padding to push content below the navbar */}
        <main className="flex-grow pt-[140px]">{children}</main>
        <Footer />
      </div>
    );
  }

  // ✅ Show login page plainly
  if (isLoginPage) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-200">
        <main className="flex-grow">{children}</main>
      </div>
    );
  }

  // ✅ Default: admin protected with sidebar
  return (
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
  );
}
