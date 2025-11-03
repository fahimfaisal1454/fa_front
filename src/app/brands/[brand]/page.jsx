"use client";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";

const CATALOG = {
  hero: [
    { key: "glamour", name: "Hero Glamour" },
    { key: "hf-deluxe", name: "Hero HF Deluxe" },
    { key: "hunk-glossy", name: "Hero Hunk Glossy" },
    { key: "ignitor-125", name: "Hero Ignitor 125" },
    { key: "maestro-edge-110-xtec", name: "Hero Maestro Edge 110 XTEC" },
    { key: "passion-xpro-i3s", name: "Hero Passion XPro i3S" },
    { key: "passion-xpro-xtec", name: "Hero Passion XPro XTEC" },
  ],
  yamaha: [
    { key: "fz", name: "Yamaha FZ" },
    { key: "r15", name: "Yamaha R15" },
  ],
  honda: [
    { key: "cb-shine", name: "Honda CB Shine" },
    { key: "unicorn", name: "Honda Unicorn" },
  ],
  tvs: [{ key: "apache", name: "TVS Apache" }],
  suzuki: [{ key: "gixxer", name: "Suzuki Gixxer" }],
  bajaj: [{ key: "pulsar-150", name: "Bajaj Pulsar 150" }],
  mahindra: [{ key: "centuro", name: "Mahindra Centuro" }],
  kawasaki: [{ key: "ninja-250", name: "Kawasaki Ninja 250" }],
};

export default function BrandModelsPage() {
  const { brand } = useParams();
  const models = CATALOG[brand];

  if (!models) return notFound();

  const brandTitle = brand.toUpperCase();

  return (
    <div className="max-w-6xl mx-auto px-4 pt-6 pb-12">
      {/* breadcrumb */}
      <div className="text-sm text-gray-600 mb-4">
        <Link href="/brands" className="hover:underline">Brands</Link>
        <span className="mx-2">›</span>
        <span className="font-semibold">{brandTitle}</span>
      </div>

      <h1 className="text-2xl font-bold mb-6">{brandTitle} Models</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {models.map(m => (
          <Link
            key={m.key}
            href={`/brands/${brand}/${m.key}`}
            className="group bg-white border rounded-xl shadow hover:shadow-md transition p-4 flex items-center justify-center h-28"
          >
            <span className="text-[15px] font-semibold text-center group-hover:text-blue-600">
              {m.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
