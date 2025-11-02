"use client";

import React, { useState, useEffect } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const OweListPage = () => {
  const [owe, setOwe] = useState([]);
  const router = useRouter();

  // Fetch owe
  useEffect(() => {
    const fetchOwe = async () => {
      try {
        const res = await AxiosInstance.get("owe/");
        setOwe(res.data);
      } catch (error) {
        console.error("Error fetching owe:", error);
      }
    };
    fetchOwe();
  }, []);

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this owe?")) return;

    try {
      await AxiosInstance.delete(`owe/${id}/`);
      setOwe(owe.filter((o) => o.id !== id));

      toast.success("Owe deleted successfully!");
    } catch (error) {
      console.error("Error deleting owe:", error);
      toast.error("Failed to delete owe.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Owe List</h1>
        <button
          onClick={() => router.push("/owe/addOwe")}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Add Owe
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
            {owe.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No owe found.
                </td>
              </tr>
            )}
            {owe.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-800">{o.owed_name}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{o.owed_type}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{o.phone1}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{o.phone2}</td>
                <td className="px-6 py-4 text-sm text-gray-800 text-right">{o.due_amount}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => router.push(`/owe/addOwe?id=${o.id}`)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(o.id)}
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

export default OweListPage;
