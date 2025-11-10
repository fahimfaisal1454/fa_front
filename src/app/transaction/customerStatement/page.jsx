"use client";

import React, { useState, useEffect } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";
import { toast } from "react-hot-toast";
import {handleDownloadPDF} from "./customerReceipt"

export default function CustomerStatementReport() {
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [filters, setFilters] = useState({
    customer: "",
    from_date: "",
    to_date: "",
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await AxiosInstance.get("/customers/");
        setCustomers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCustomers();
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
      const res = await AxiosInstance.get("sales/", { params: filters });
      setSales(res.data);
      if (res.data.length === 0) toast.info("No sales records found.");
    } catch (error) {
      toast.error("Failed to fetch sales data.");
      console.error(error);
    }
  };

  const totalSales = sales.reduce(
    (acc, sale) => acc + parseFloat(sale.total_amount || 0),
    0
  );

  const totalPaid = sales.reduce(
    (acc, sale) =>
      acc +
      sale.payments.reduce(
        (sum, p) => sum + parseFloat(p.paid_amount || 0),
        0
      ),
    0
  );
  const totalDue = totalSales - totalPaid;

  return (
    <div className="p-8 bg-white shadow-md rounded-md">
      
      <h2 className="text-lg font-semibold text-center underline mb-4">
        Sales Statement
      </h2>

      {/* Filters */}
      <div className="grid grid-cols-4 gap-4 mb-8 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">
            Customer Name:
          </label>
          <select
            name="customer"
            value={filters.customer}
            onChange={handleChange}
            className="w-full border rounded-md px-2 py-1"
          >
            <option value="">--Select--</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.customer_name}
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
      {sales.length > 0 && (
        <div>
            <div className="flex justify-end mb-3">
                <button
                onClick={() => handleDownloadPDF(sales, filters, totalSales, totalPaid, totalDue, toast)}
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
              {sales[0]?.customer?.customer_name || "—"}
            </p>
            <p>
              <strong>Shop Name:</strong> {sales[0]?.customer?.shop_name || "—"}
            </p>
            <p>
              <strong>Address:</strong> {sales[0]?.customer?.address || "—"}
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-400 text-sm">
              <thead className="bg-gray-100 text-gray-800">
                <tr>
                  <th className="border px-3 py-2">Date</th>
                  <th className="border px-3 py-2">Bill No</th>
                  <th className="border px-3 py-2">Transaction Type</th>
                  <th className="border px-3 py-2 text-right">Sales Amount</th>
                  <th className="border px-3 py-2 text-right">Received</th>
                  <th className="border px-3 py-2 text-right">Due</th>
                  <th className="border px-3 py-2">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => {
                  const paid = sale.payments.reduce(
                    (sum, p) => sum + parseFloat(p.paid_amount || 0),
                    0
                  );
                  const due = parseFloat(sale.total_amount) - paid;

                  return (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="border px-3 py-2">{sale.sale_date}</td>
                      <td className="border px-3 py-2">{sale.invoice_no}</td>
                      <td className="border px-3 py-2">
                        {sale.payments && sale.payments.length > 0
                        ? sale.payments.map(p => p.payment_mode).join(", ")
                        : "—"}</td>
                      <td className="border px-3 py-2 text-right">
                        {sale.total_amount}
                      </td>
                      <td className="border px-3 py-2 text-right">{paid}</td>
                      <td className="border px-3 py-2 text-right">{due}</td>
                      <td className="border px-3 py-2">—</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-100 font-semibold">
                <tr>
                  <td className="border px-3 py-2 text-right" colSpan={3}>
                    Total:
                  </td>
                  <td className="border px-3 py-2 text-right">
                    {totalSales.toFixed(2)}
                  </td>
                  <td className="border px-3 py-2 text-right">
                    {totalPaid.toFixed(2)}
                  </td>
                  <td className="border px-3 py-2 text-right">
                    {totalDue.toFixed(2)}
                  </td>
                  <td className="border px-3 py-2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
