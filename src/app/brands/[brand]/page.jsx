"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import AxiosInstance from "@/app/components/AxiosInstance";

export default function BrandModelsPage() {
  const { brand } = useParams(); // company id
  const [models, setModels] = useState([]);
  const [brandInfo, setBrandInfo] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <div className="text-sm text-gray-600 mb-4">
        <Link href="/brands" className="hover:underline">Brands</Link>
        <span className="mx-2">›</span>
        <span className="font-semibold">{brandInfo?.company_name || "Brand"}</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">
        {brandInfo?.company_name || "Brand"} Models
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border bg-white shadow animate-pulse" />
          ))}
        </div>
      ) : models.length === 0 ? (
        <div className="text-gray-600">No models found for this brand.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {models.map((m) => (
            <Link
              key={m.id}
              href={`/brands/${brand}/${m.id}`}  // model = bikeModelId
              className="group bg-white border rounded-xl shadow hover:shadow-md transition p-4 flex flex-col items-center justify-center h-28 text-center"
            >
              {m.image && (
                <img src={m.image} alt={m.name} className="w-12 h-12 mb-2 object-contain" />
              )}
              <span className="text-[15px] font-semibold group-hover:text-blue-600">
                {m.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
