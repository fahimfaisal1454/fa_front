"use client";

import React, { useState, useEffect } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const BorrowerListPage = () => {
  const [borrowers, setBorrowers] = useState([]);
  const router = useRouter();

  // Fetch borrowers
  useEffect(() => {
    const fetchBorrowers = async () => {
      try {
        const res = await AxiosInstance.get("borrowers/");
        setBorrowers(res.data);
      } catch (error) {
        console.error("Error fetching borrowers:", error);
      }
    };
    fetchBorrowers();
  }, []);

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this borrower?")) return;

    try {
      await AxiosInstance.delete(`borrowers/${id}/`);
      setBorrowers(borrowers.filter((b) => b.id !== id));

      toast.success("Borrower deleted successfully!");
    } catch (error) {
      console.error("Error deleting borrower:", error);
      toast.error("Failed to delete borrower.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Borrowers List</h1>
        <button
          onClick={() => router.push("/borrower/addBorrower")}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Add Borrower
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                Phone 1
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                Phone 2
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                Due Amount
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {borrowers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No borrowers found.
                </td>
              </tr>
            )}
            {borrowers.map((borrower) => (
              <tr key={borrower.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-800">{borrower.borrower_name}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{borrower.borrower_type}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{borrower.phone1}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{borrower.phone2}</td>
                <td className="px-6 py-4 text-sm text-gray-800 text-right">{borrower.due_amount}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => router.push(`/borrower/addBorrower?id=${borrower.id}`)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(borrower.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BorrowerListPage;
