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
      <>
      <Navbar />
      {/* Add top padding to push content below the navbar */}
      <main className="bg-slate-200 pt-[140px]">{children}</main>
      <Footer />
      </>
    );
  }

  // ✅ Show login page plainly
  if (isLoginPage) {
    return <>{children}</>;
  }

  // ✅ Default: admin protected with sidebar
  return (
    <div>
      <ProtectedRoute>
        <div className="flex h-screen">
          <SidebarContent />
          <div className="flex-1 p-10 overflow-y-auto">{children}</div>
        </div>
      </ProtectedRoute>
    </div>
  );
}
