"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import AxiosInstance from "@/app/components/AxiosInstance";

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Base URL for media
  const apiBase = useMemo(() => {
    const base = AxiosInstance.defaults.baseURL || "";
    return base.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  }, []);

  const getImageUrl = (src) => {
    if (!src) return null;
    return src.startsWith("http") ? src : `${apiBase}${src.startsWith("/") ? "" : "/"}${src}`;
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await AxiosInstance.get("/companies/");
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
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Find parts for your bike
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
      ) : brands.length === 0 ? (
        <div className="text-gray-600 text-center">No brands found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 place-items-center">
          {brands.map((b) => {
            const img = getImageUrl(b.image);
            return (
              <Link
                key={b.id}
                href={`/brands/${b.id}`}
                className="group bg-white border border-gray-300 rounded-2xl shadow-sm hover:shadow-lg transition p-4 flex flex-col items-center justify-between w-52 aspect-square"
              >
                <div className="flex items-center justify-center flex-1 w-full">
                  {img ? (
                    <img
                      src={img}
                      alt={b.company_name}
                      className="max-h-28 max-w-[90%] object-contain"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-100 grid place-items-center text-lg font-semibold text-gray-500">
                      {b.company_name?.[0]}
                    </div>
                  )}
                </div>

                <span className="text-base font-semibold text-center mt-3 group-hover:text-blue-600">
                  {b.company_name}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
