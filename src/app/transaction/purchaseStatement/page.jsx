"use client";

import React, { useState, useEffect } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";
import { toast } from "react-hot-toast";


export default function PurchaseStatementReport() {
  const [companies, setCompanies] = useState([]);
  const [purchase, setPurchase] = useState([]);
  const [filters, setFilters] = useState({
    company: "",
    from_date: "",
    to_date: "",
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await AxiosInstance.get("companies/");
        setCompanies(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCompany();
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async () => {
    if (!filters.from_date) {
      toast.error("Please select a From Date");
      return;
    }
    try {
      const res = await AxiosInstance.get("purchase-report/", { params: filters });
      setPurchase(res.data);
    } catch (error) {
      toast.error("Failed to fetch purchase data.");
      console.error(error);
    }
  };

  console.log("Purchases", purchase)

//   const totalpurchase = purchase.reduce(
//     (acc, p) => acc + parseFloat(p.purchase_amount || 0),
//     0
//   );

  const totalpurchase = 0

  
  return (
    <div className="p-8 bg-white shadow-md rounded-md">
      
      <h2 className="text-lg font-semibold text-center underline mb-4">
        Purchase Statement
      </h2>

      {/* Filters */}
      <div className="grid grid-cols-4 gap-4 mb-8 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">
            Company:
          </label>
          <select
            name="company"
            value={filters.company}
            onChange={handleChange}
            className="w-full border rounded-md px-2 py-1"
          >
            <option value="">--Select--</option>
            {companies.map((c) => (
              <option key={c.id} value={c.company_name}>
                {c.company_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            From Date: <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="from_date"
            value={filters.from_date}
            onChange={handleChange}
            className="w-full border rounded-md px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">To Date:</label>
          <input
            type="date"
            name="to_date"
            value={filters.to_date}
            onChange={handleChange}
            className="w-full border rounded-md px-2 py-1"
          />
        </div>

        <button
          onClick={handleSearch}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Search
        </button>
      </div>



    
      {/* Report Info */}
      {purchase.length > 0 && (
        <div>
            <div className="flex justify-end mb-3">
                <button
                onClick={() => handleDownloadPDF(purchase, filters, totalpurchase, totalPaid, totalDue, toast)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                Download PDF
                </button>
            </div>

            <div className="text-center border-b border-gray-400 pb-3 mb-6">
                <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-800">
                Heaven Autos
                </h1>
                <p className="text-sm text-gray-700">
                Genuine Motorcycle Parts Importer & Wholesaler
                </p>
                <p className="text-sm text-gray-600">
                77 R.N. Road, Noldanga Road (Heaven Building), Jashore-7400 <br />
                Phone: 0421-66095, Mob: 01924-331354 | Email: heavenautos77jsr@yahoo.com
                </p>
            </div>

          <div className="mb-4 text-sm text-gray-700">
            <p>
              <strong>Date:</strong> From {filters.from_date || "—"} To{" "}
              {filters.to_date || "—"}
            </p>
            <p>
              <strong>Name of Customer:</strong>{" "}
              {purchase[0]?.customer?.customer_name || "—"}
            </p>
            <p>
              <strong>Shop Name:</strong> {purchase[0]?.customer?.shop_name || "—"}
            </p>
            <p>
              <strong>Address:</strong> {purchase[0]?.customer?.address || "—"}
            </p>
          </div>

        {/* Table */}
        <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-400 text-sm">
            <thead className="bg-gray-100 text-gray-800">
            <tr>
                <th className="border px-3 py-2">Date</th>
                <th className="border px-3 py-2">Invoice No</th>
                <th className="border px-3 py-2">Part No</th>
                <th className="border px-3 py-2">Product Name</th>
                <th className="border px-3 py-2">Supplier/Exporter Name</th>
                <th className="border px-3 py-2 text-right">Quantity</th>
                <th className="border px-3 py-2 text-right">Purchase Amount</th>
            </tr>
            </thead>
            <tbody>
            {purchase.map((p, index) => (
                <tr key={index} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{p.date || "—"}</td>
                <td className="border px-3 py-2">{p.invoice_no || "—"}</td>
                <td className="border px-3 py-2">{p.part_no || "—"}</td>
                <td className="border px-3 py-2">{p.product_name || "—"}</td>
                <td className="border px-3 py-2">{p.supplier_or_exporter || "—"}</td>
                <td className="border px-3 py-2 text-right">{p.quantity || 0}</td>
                <td className="border px-3 py-2 text-right">
                    {parseFloat(p.purchase_amount || 0).toFixed(2)}
                </td>
                </tr>
            ))}
            </tbody>

    <tfoot className="bg-gray-100 font-semibold">
      <tr>
        <td className="border px-3 py-2 text-right" colSpan={6}>
          Total Purchase:
        </td>
        <td className="border px-3 py-2 text-right">
          {purchase
            .reduce(
              (acc, p) => acc + parseFloat(p.purchase_amount || 0),
              0
            )
            .toFixed(2)}
        </td>
      </tr>
    </tfoot>
  </table>
</div>

        </div>
      )}
    </div>
  );
}
