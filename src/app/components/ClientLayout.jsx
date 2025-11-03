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
  const isBrandpage = pathname === "/brands"
  
  const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;

  const isAuthenticated = user !== null && user !== undefined && user !== "null";

  console.log("Authenticated:", isAuthenticated);

  if (
    isHomePage ||
    
    
  ) {
    return (
      <>
        <Navbar />
        <div className="bg-slate-200 ">{children}</div>
        <Footer />
      </>
    );
  }
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div>
      <ProtectedRoute>
        <div className="flex h-screen">
          <SidebarContent />
          <div className="flex-1  p-10 overflow-y-auto">
            {children}
          </div>
        </div>
      </ProtectedRoute>
    </div>
  );
}
