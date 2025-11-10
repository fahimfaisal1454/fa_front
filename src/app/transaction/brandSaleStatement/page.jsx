"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import AxiosInstance from "@/app/components/AxiosInstance";
import { handleDownloadPDF } from "./brandReceipt";

export default function BrandSaleReport() {
  const [companies, setCompanies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [company, setCompany] = useState("");
  const [customer, setCustomer] = useState("");
  const [fromDate, setFromDate] = useState("2025-08-01");
  const [toDate, setToDate] = useState("2025-11-06");
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch filters (companies + customers)
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [companyRes, customerRes] = await Promise.all([
          AxiosInstance.get("/companies/"),
          AxiosInstance.get("/customers/"),
        ]);
        setCompanies(companyRes.data);
        setCustomers(customerRes.data);
      } catch (err) {
        console.error("Error fetching filter data:", err);
      }
    };
    fetchFilters();
  }, []);

  // Fetch sales
  const fetchSalesData = async () => {
    if (!fromDate || !company) {
      toast.error("Please select a Company and From Date");
      return;
    }

    try {
      setLoading(true);
      const res = await AxiosInstance.get("sales/", {
        params: { company, customer, from_date: fromDate, to_date: toDate },
      });
      console.log("SalesData", res.data);
      setSalesData(res.data);
    } catch (err) {
      console.error("Error fetching sales data:", err);
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSalesData();
  };

  const handleDownload = () => {
    alert("Download Excel clicked");
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate total from nested products
  const totalAmount = salesData.reduce((acc, sale) => {
    const subtotal = sale.products.reduce(
      (sum, p) => sum + parseFloat(p.total_price || 0),
      0
    );
    return acc + subtotal;
  }, 0);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-semibold mb-4">
        Brand Wise Sale Statement Report
      </h1>

      {/* Filter Form */}
      <form
        className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-4"
        onSubmit={handleSearch}
      >
        <div>
          <label className="block font-medium mb-1">Company Name: *</label>
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1"
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
          <label className="block font-medium mb-1">Customer Name:</label>
          <select
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1"
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
          <label className="block font-medium mb-1">From Date: *</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">To Date: *</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
          >
            Search
          </button>
        </div>
      </form>

      {/* Download / Print Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={handleDownload}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded"
        >
          Download Excel
        </button>
        <button
          onClick={handlePrint}
          className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-4 py-2 rounded"
        >
          Print
        </button>
      </div>

      {/* Report Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center py-4">Loading data...</p>
        ) : salesData.length === 0 ? (
          <p className="text-center py-4">No data found for selected filters.</p>
        ) : (

        <div>
          <div className="flex justify-end mb-3">
              <button
              onClick={() => handleDownloadPDF(salesData,fromDate,toDate,customer,company,totalAmount,toast)}
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
              <strong>Date:</strong> From {fromDate || "—"} To{" "}
              {toDate || "—"}
            </p>
            <p>
              <strong>Company Name:</strong> {company || "—"}
            </p>
          </div>

          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Date</th>
                <th className="border px-2 py-1">Invoice No</th>
                <th className="border px-2 py-1">Part No</th>
                <th className="border px-2 py-1">Product Name</th>
                <th className="border px-2 py-1">Customer Name</th>
                <th className="border px-2 py-1">Qty</th>
                <th className="border px-2 py-1">Sale Amount</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((sale, saleIdx) => (
                <React.Fragment key={saleIdx}>
                  {sale.products.map((product, prodIdx) => (
                    <tr key={prodIdx} className="text-center">
                      {/* Show date and invoice only once per sale */}
                      {prodIdx === 0 && (
                        <>
                          <td
                            className="border px-2 py-1"
                            rowSpan={sale.products.length}
                          >
                            {new Date(sale.sale_date).toLocaleDateString()}
                          </td>
                          <td
                            className="border px-2 py-1"
                            rowSpan={sale.products.length}
                          >
                            {sale.invoice_no}
                          </td>
                        </>
                      )}

                      <td className="border px-2 py-1">
                        {product.part_no || ""}
                      </td>
                      <td className="border px-2 py-1">
                        {product.product?.product_name || ""}
                      </td>
                      <td className="border px-2 py-1">
                        {sale.customer?.customer_name || ""}
                      </td>
                      <td className="border px-2 py-1">
                        {parseFloat(product.sale_quantity || 0).toFixed(2)}
                      </td>
                      <td className="border px-2 py-1  text-right">
                        {parseFloat(product.total_price || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}

              {/* Grand Total */}
              <tr className="font-bold bg-gray-100 text-right">
                <td colSpan="6" className="border px-2 py-1 text-right">
                  Total:
                </td>
                <td className="border px-2 py-1 text-right">
                  {totalAmount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
