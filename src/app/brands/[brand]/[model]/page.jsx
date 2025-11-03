"use client";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";

const PARTS = {
  glamour: [
    { sku: "CAM-ASM-GLA", name: "Cam Shaft Assembly" },
    { sku: "CARB-REP-GLA", name: "Carburetor Repair Kit" },
    { sku: "CLUTCH-ASM-GLA", name: "Clutch Assembly" },
  ],
  "hf-deluxe": [
    { sku: "CLUTCH-HFD", name: "Clutch Assembly" },
    { sku: "AIRFLT-HFD", name: "Air Filter" },
  ],
};

function titleCase(s) {
  return s.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export default function PartsPage() {
  const { brand, model } = useParams();
  const parts = PARTS[model];

  if (!parts) return notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-12">
      {/* breadcrumb */}
      <div className="text-sm text-gray-600 mb-4">
        <Link href="/brands" className="hover:underline">Brands</Link>
        <span className="mx-2">›</span>
        <Link href={`/brands/${brand}`} className="hover:underline">{brand.toUpperCase()}</Link>
        <span className="mx-2">›</span>
        <span className="font-semibold">{titleCase(model)}</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">
        {titleCase(model)} Spare Parts
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {parts.map(p => (
          <div key={p.sku} className="bg-white border rounded-xl shadow p-4">
            <div className="h-24 bg-gray-100 rounded mb-3 flex items-center justify-center text-xs text-gray-500">
              Image
            </div>
            <div className="font-semibold text-sm">{p.name}</div>
            <div className="text-xs text-gray-500">SKU: {p.sku}</div>
            <button className="mt-3 w-full text-center bg-blue-600 text-white text-sm py-1.5 rounded hover:bg-blue-700">
              View / Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
