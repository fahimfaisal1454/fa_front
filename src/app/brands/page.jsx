"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AxiosInstance from "@/app/components/AxiosInstance";

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await AxiosInstance.get("/companies/");
        // expected fields: id, company_name (from your CompanySerializer)
        setBrands(res.data || []);
      } catch (err) {
        console.error("Failed to load brands:", err);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-12">
      <h1 className="text-3xl font-bold mb-6">Find parts for your bike</h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl border bg-white shadow animate-pulse"
            />
          ))}
        </div>
      ) : brands.length === 0 ? (
        <div className="text-gray-600">No brands found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/brands/${b.id}`} // use id in the route; load models with ?company=<id> there
              className="group bg-white border rounded-xl shadow hover:shadow-md transition p-4 flex items-center justify-center h-32"
            >
              <span className="text-lg font-semibold group-hover:text-blue-600 text-center">
                {b.company_name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
