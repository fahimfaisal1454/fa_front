"use client";
import Link from "next/link";

const BRANDS = [
  { key: "hero", name: "Hero" },
  { key: "yamaha", name: "Yamaha" },
  { key: "honda", name: "Honda" },
  { key: "tvs", name: "TVS" },
  { key: "suzuki", name: "Suzuki" },
  { key: "bajaj", name: "Bajaj" },
  { key: "mahindra", name: "Mahindra" },
  { key: "kawasaki", name: "Kawasaki" },
];

export default function BrandsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-12">
      <h1 className="text-3xl font-bold mb-6">Find parts for your bike</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {BRANDS.map(b => (
          <Link
            key={b.key}
            href={`/brands/${b.key}`}
            className="group bg-white border rounded-xl shadow hover:shadow-md transition p-4 flex items-center justify-center h-32"
          >
            <span className="text-lg font-semibold group-hover:text-blue-600">
              {b.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
