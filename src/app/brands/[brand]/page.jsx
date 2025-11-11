"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import AxiosInstance from "@/app/components/AxiosInstance";

export default function BrandModelsPage() {
  const { brand } = useParams(); // company id
  const [models, setModels] = useState([]);
  const [brandInfo, setBrandInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Base URL for API media
  const apiBase = useMemo(() => {
    const base = AxiosInstance.defaults.baseURL || "";
    return base.replace(/\/api\/?$/, "").replace(/\/+$/, "");
  }, []);

  const toImg = (src) =>
    !src ? null : /^https?:\/\//i.test(src)
      ? src
      : `${apiBase}${src.startsWith("/") ? "" : "/"}${src}`;

  useEffect(() => {
    if (!brand) return;
    (async () => {
      try {
        const companyRes = await AxiosInstance.get(`/companies/${brand}/`);
        setBrandInfo(companyRes.data);

        const modelRes = await AxiosInstance.get(`/bike-models/?company=${brand}`);
        setModels(modelRes.data || []);
      } catch (err) {
        console.error(err);
        setModels([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [brand]);

  if (!loading && !brandInfo) return notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-12">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600 mb-4">
        <Link href="/brands" className="hover:underline">Brands</Link>
        <span className="mx-2">›</span>
        <span className="font-semibold">{brandInfo?.company_name || "Brand"}</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {brandInfo?.company_name || "Brand"} Models
      </h1>

      {/* Model Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl border bg-gray-100 shadow animate-pulse" />
          ))}
        </div>
      ) : models.length === 0 ? (
        <div className="text-gray-600 text-center">No models found for this brand.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 place-items-center">
          {models.map((m) => {
            const img = toImg(m.image);
            return (
              <Link
                key={m.id}
                href={`/brands/${brand}/${m.id}`}
                className="group bg-white border border-gray-300 rounded-2xl shadow-sm hover:shadow-lg transition p-4 flex flex-col items-center justify-between w-52 aspect-square text-center"
              >
                <div className="flex items-center justify-center flex-1 w-full">
                  {img ? (
                    <img
                      src={img}
                      alt={m.name}
                      className="max-h-32 max-w-[95%] object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-100 grid place-items-center text-lg font-semibold text-gray-500">
                      {m.name?.[0]}
                    </div>
                  )}
                </div>

                <span className="text-[15px] font-semibold mt-3 group-hover:text-blue-600">
                  {m.name}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
