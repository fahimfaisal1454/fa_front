"use client";
import React, { useState, useEffect } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";
import { useRouter, useSearchParams } from "next/navigation";

const AddBorrowerPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const borrowerId = searchParams.get("id"); // for edit mode

    const [formData, setFormData] = useState({
        borrower_name: "",
        borrower_type: "",
        phone1: "",
        phone2: "",
        address: "",
        remarks: "",
        due_amount: "",
    });

    // ✅ Fetch borrborrowerr details if editing
    useEffect(() => {
        if (borrowerId) {
            const fetchBorrower = async () => {
                try {
                    const res = await AxiosInstance.get(`borrowers/${borrowerId}/`);
                    setFormData(res.data);
                } catch (error) {
                    console.error("Error fetching borrower:", error);
                }
            };
            fetchBorrower();
        }
    }, [borrowerId]);

    // ✅ Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ✅ Handle create/update submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (borrowerId) {
                await AxiosInstance.put(`borrowers/${borrowerId}/`, formData);
            } else {
                await AxiosInstance.post("borrowers/", formData);
            }
            router.push("/borrower/borrowerList");
        } catch (error) {
            console.error("Error submitting borrower:", error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {borrowerId ? "Edit Borrower" : "Add New Borrower"}
            </h1>

            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-4 gap-4 bg-white p-8 rounded-2xl shadow-lg border border-gray-200"
            >
                <div className="col-span-4 sm:col-span-2">
                    <label className="block text-gray-700 font-medium">Borrower Name</label>
                    <input
                        type="text"
                        name="borrower_name"
                        value={formData.borrower_name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                        placeholder="Enter Borrower Name"
                    />
                </div>

                <div className="col-span-4 sm:col-span-2">
                    <label className="block text-gray-700 font-medium">Borrower Type</label>
                    <select
                        name="borrower_type"
                        value={formData.borrower_type}
                        onChange={handleChange}
                        className="w-full px-4 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    >
                        <option value="">Select Type</option>
                        <option value="regular">Regular</option>
                        <option value="irregular">Irregular</option>
                    </select>
                </div>

                <div className="col-span-4 sm:col-span-2">
                    <label className="block text-gray-700 font-medium">Phone 1</label>
                    <input
                        type="text"
                        name="phone1"
                        value={formData.phone1}
                        onChange={handleChange}
                        className="w-full px-4 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                        placeholder="Primary contact number"
                    />
                </div>

                <div className="col-span-4 sm:col-span-2">
                    <label className="block text-gray-700 font-medium">Phone 2</label>
                    <input
                        type="text"
                        name="phone2"
                        value={formData.phone2}
                        onChange={handleChange}
                        className="w-full px-4 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                        placeholder="Secondary contact number"
                    />
                </div>

                <div className="col-span-4 sm:col-span-2">
                    <label className="block text-gray-700 font-medium">Address</label>
                    <textarea
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                        placeholder="Enter address"
                    />
                </div>

                <div className="col-span-4 sm:col-span-2">
                    <label className="block text-gray-700 font-medium">Remarks</label>
                    <textarea
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        className="w-full px-4 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                        placeholder="Any additional notes..."
                    />
                </div>

                <div className="col-span-4 text-center">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    >
                        {borrowerId ? "Update Borrower" : "Add Borrower"}
                    </button>
                </div>
            </form>
        </div>

    );
};

export default AddBorrowerPage;
