"use client";

import React, { useState, useEffect } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";
import { toast } from "react-hot-toast";

const CustomerStatementReport = () => {
    const [customers, setCustomers] = useState([]);
    const [sales, setSales] = useState([]);
    const [filters, setFilters] = useState({
        customer: "",
        from_date: "",
        to_date: "",
    });

    // Fetch customers for dropdown
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await AxiosInstance.get("customers/");
                setCustomers(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCustomers();
    }, []);

    // Handle input change
    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // Search button click
    const handleSearch = async () => {
        if (!filters.from_date) {
            toast.error("Please select a From Date");
            return;
        }
        try {
            const res = await AxiosInstance.get("sales/report/", { params: filters });
            setSales(res.data);
            if (res.data.length === 0) toast.info("No sales records found.");
        } catch (error) {
            toast.error("Failed to fetch sales data.");
            console.error(error);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Sales Statement Report</h2>

            {/* Filters */}
            <div className="grid grid-cols-4 gap-4 items-end mb-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Customer Name:</label>
                    <select
                        name="customer"
                        value={filters.customer}
                        onChange={handleChange}
                        className="w-full border rounded-md px-2 py-1"
                    >
                        <option value="">--Select--</option>
                        {customers.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
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

            {/* Results Table */}
            {sales.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 mb-4">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-3 py-2 text-left">Date</th>
                                <th className="border px-3 py-2 text-left">Invoice No</th>
                                <th className="border px-3 py-2 text-left">Customer</th>
                                <th className="border px-3 py-2 text-right">Total Amount</th>
                                <th className="border px-3 py-2 text-right">Paid</th>
                                <th className="border px-3 py-2 text-right">Due</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-gray-50">
                                    <td className="border px-3 py-2">{sale.sale_date}</td>
                                    <td className="border px-3 py-2">{sale.invoice_no}</td>
                                    <td className="border px-3 py-2">{sale.customer_name}</td>
                                    <td className="border px-3 py-2 text-right">{sale.total_amount}</td>
                                    <td className="border px-3 py-2 text-right">{sale.total_paid}</td>
                                    <td className="border px-3 py-2 text-right">{sale.total_due}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="text-right space-y-1">
                        <p><strong>Total Sales:</strong> {summary.total_sales_amount}</p>
                        <p><strong>Total Paid:</strong> {summary.total_paid_amount}</p>
                        <p><strong>Total Due:</strong> {summary.total_due_amount}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerStatementReport;
