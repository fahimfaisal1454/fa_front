"use client";
import React, { useEffect, useState } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";
import { toast } from "react-hot-toast";
import { FaFilePdf, FaSearch } from "react-icons/fa";
import ReceiveReceipt from "./ReceiveReceipt";


const IncomePage = () => {
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    description: "",
  });

  const [filters, setFilters] = useState({
    from_date: "",
    to_date: "",
    receipt_no: "",
    account_title: "",
    cost_category: "",
  });


  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [incomes, setIncomes] = useState([]);

  // ✅ Fetch all Incomes
  const fetchIncomes = async (params = {}) => {
    try {
      const res = await AxiosInstance.get("add-income/", { params });
      setIncomes(res.data);
    } catch (err) {
      toast.error("Failed to load incomes");
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleDownloadPDF = async (expense) => {
    setSelectedExpense(expense);
    setTimeout(async () => {
        const html2pdf = (await import("html2pdf.js")).default;
        const element = document.getElementById("voucher-form");
        const opt = {
        margin: 0.5,
        filename: `${expense.receiptNo || "pay_receipt"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        };
        html2pdf().from(element).set(opt).save();
    }, 300);
  };


  // ✅ Apply filters
  const handleSearch = (e) => {
    e.preventDefault();
    fetchIncomes(filters);
  };

  return (
    <div className="p-6 space-y-8 bg-gray-100 min-h-screen">
      {/* 🌿 Header */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-400 text-white rounded-lg p-4 shadow-md text-center">
        <h1 className="text-2xl font-semibold mb-1">Daily Income Tracker</h1>
        <p className="text-sm opacity-90">Monitor and manage your daily spending</p>
      </div>

      {/* 🔍 Search Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-teal-700 flex items-center gap-2">
          <FaSearch /> Search Incomes
        </h2>

        <form
          onSubmit={handleSearch}
          className="grid md:grid-cols-5 sm:grid-cols-2 gap-4 text-sm"
        >
          <div>
            <label className="block mb-1 font-medium text-gray-700">From Date</label>
            <input
              type="date"
              value={filters.from_date}
              onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
              className="border px-2 py-1 rounded w-full focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">To Date</label>
            <input
              type="date"
              value={filters.to_date}
              onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
              className="border px-2 py-1 rounded w-full focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Receipt No*</label>
            <input
              type="text"
              placeholder="Enter Receipt No"
              value={filters.receipt_no}
              onChange={(e) => setFilters({ ...filters, receipt_no: e.target.value })}
              className="border px-2 py-1 rounded w-full focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Account Title*</label>
            <input
              type="text"
              placeholder="Enter Account Title"
              value={filters.account_title}
              onChange={(e) => setFilters({ ...filters, account_title: e.target.value })}
              className="border px-2 py-1 rounded w-full focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Cost Category*</label>
            <input
              type="text"
              placeholder="Enter Cost Category"
              value={filters.cost_category}
              onChange={(e) => setFilters({ ...filters, cost_category: e.target.value })}
              className="border px-2 py-1 rounded w-full focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
          </div>

          <div className="col-span-5 flex justify-center mt-3">
            <button
              type="submit"
              className="bg-teal-500 text-white px-6 py-1 rounded hover:bg-teal-600 transition-all font-medium"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* 📋 Income List */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-md overflow-x-auto">
        <h3 className="text-lg font-semibold mb-3 text-teal-700">
          Income List
        </h3>

        <table className="min-w-full border border-gray-300 text-sm text-center">
          <thead>
            <tr className="bg-gray-600 text-white font-semibold">
              <th className="border px-2 py-1">SL</th>
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Receipt No</th>
              <th className="border px-2 py-1">Voucher No</th>
              <th className="border px-2 py-1">Account Title</th>
              <th className="border px-2 py-1">Source Category</th>
              <th className="border px-2 py-1">Description</th>
              <th className="border px-2 py-1">Transaction Type</th>
              <th className="border px-2 py-1">Amount</th>
              <th className="border px-2 py-1">Remarks</th>
              <th className="border px-2 py-1">Print</th>
            </tr>
          </thead>

          <tbody>
            {incomes.length > 0 ? (
              incomes.map((income, index) => (
                <tr
                  key={income.id}
                  className={`hover:bg-teal-50 transition-colors ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="border px-2 py-1">{index + 1}</td>
                  <td className="border px-2 py-1">
                    {new Date(income.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="border px-2 py-1">{income.receiptNo || "-"}</td>
                  <td className="border px-2 py-1">{income.voucherNo}</td>
                  <td className="border px-2 py-1">{income.accountTitle}</td>
                  <td className="border px-2 py-1">{income.sourceCategory}</td>
                  <td className="border px-2 py-1">{income.description || "-"}</td>
                  <td className="border px-2 py-1">{income.transactionType}</td>
                  <td className="border px-2 py-1 font-semibold text-right text-emerald-700">
                    {parseFloat(income.amount).toLocaleString()}
                  </td>
                  <td className="border px-2 py-1">{income.remarks || "-"}</td>
                  <td className="border px-2 py-1">
                    <button
                    onClick={() => setSelectedReceipt(income)}
                    className="text-blue-600 hover:underline cursor-pointer"
                    >
                    Voucher
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center py-3 text-gray-500">
                  No Incomes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

        {/* Render PayReceipt if selected */}
        {selectedReceipt && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <ReceiveReceipt receiptData={selectedReceipt} />
                <button
                onClick={() => setSelectedReceipt(null)}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                >
                Close
                </button>
            </div>
            </div>
        )}
    </div>
  );
};

export default IncomePage;
