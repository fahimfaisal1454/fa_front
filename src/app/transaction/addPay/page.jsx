"use client";
import { useState } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function AddPayReceipt() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    voucherNo: "",
    accountTitle: "",
    costCategory: "",
    employeeName: "",
    borrowerName: "",
    owedName: "",
    description: "",
    bankName: "",
    accountNo: "",
    chequeNo: "",
    amount: "",
    transactionType: "",
    remarks: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFormData({
      date: "",
      voucherNo: "",
      accountTitle: "",
      costCategory: "",
      employeeName: "",
      borrowerName: "",
      owedName: "",
      description: "",
      bankName: "",
      accountNo: "",
      chequeNo: "",
      amount: "",
      transactionType: "",
      remarks: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await AxiosInstance.post("add-expense/", formData);
      toast.success("Pay receipt saved successfully!");
      console.log("Response:", response.data);
      handleReset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.response?.data?.message || "Failed to save receipt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto p-8 bg-white shadow-lg rounded-xl mt-6"
    >
      <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-6">
        🧾 Add Pay Receipt
      </h2>

      {/* Red Notes Section */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700 leading-relaxed">
        <p>
          <strong>Note 1:</strong> To pay salary, select{" "}
          <strong>Cost Category → Salary Statement</strong>.
        </p>
        <p>
          <strong>Note 2:</strong> To return amount to a customer, select{" "}
          <strong>Cost Category → Sale Return</strong>.
        </p>
        <p>
          <strong>Note 3:</strong> To pay a borrow, select{" "}
          <strong>Cost Category → Borrow Pay</strong>.
        </p>
        <p>
          <strong>Note 4:</strong> To return owed amount, select{" "}
          <strong>Cost Category → Owed Return</strong>.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Date */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3  focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {/* Receipt No */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Receipt No</label>
          <input
            type="text"
            value="AUTO GENERATE"
            readOnly
            className="w-full border bg-gray-100 rounded-lg px-3 "
          />
        </div>

        {/* Voucher No */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">
            Voucher No
            <span className="ml-1 text-red-500 font-medium">*</span>
          </label>
          <input
            type="text"
            name="voucherNo"
            value={formData.voucherNo}
            onChange={handleChange}
            placeholder="Enter voucher number"
            className="w-full border border-gray-300 rounded-lg px-3  focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Account Title */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">
            Account Title 
            <span className="ml-1 text-red-500 font-medium">*</span>
          </label>
          <input
            type="text"
            name="accountTitle"
            value={formData.accountTitle}
            onChange={handleChange}
            placeholder="Enter account title"
            required
            className="w-full border border-gray-300 rounded-lg px-3  focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Cost Category */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">
            Cost Category
            <span className="ml-1 text-red-500 font-medium">*</span>
          </label>
          <select
            name="costCategory"
            value={formData.costCategory}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-sky-500"
          >
            <option value="">--Select--</option>
            <option value="salary">Salary Statement</option>
            <option value="sale_return">Sale Return</option>
            <option value="borrow_pay">Borrow Pay</option>
            <option value="owed_return">Owed Return</option>
          </select>
        </div>

        {/* Employee Name */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Employee Name
             <span className="ml-1 text-red-500 font-medium">*</span>
          </label>
          <select
            name="employeeName"
            value={formData.employeeName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-1"
          >
            <option value="">--Select--</option>
            <option value="John">John</option>
            <option value="Mamun">Mamun</option>
          </select>
        </div>

        {/* Borrower */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Borrower Name</label>
          <select
            name="borrowerName"
            value={formData.borrowerName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-1"
          >
            <option value="">--Select--</option>
            <option value="Borrower1">Borrower 1</option>
          </select>
        </div>

        {/* Owed Name */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Owed Name</label>
          <select
            name="owedName"
            value={formData.owedName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-1"
          >
            <option value="">--Select--</option>
            <option value="Owed1">Owed 1</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional description"
            className="w-full border border-gray-300 rounded-lg px-3"
          />
        </div>


        {/* Transaction Type */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Transaction Type
            <span className="ml-1 text-red-500 font-medium">*</span>
          </label>
          <select
            name="transactionType"
            value={formData.transactionType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-1"
          >
            <option value="">--Select--</option>
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
          </select>
        </div>

        {/* Bank Name */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Bank Name</label>
          <select
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-1"
          >
            <option value="">--Select--</option>
            <option value="BRAC">BRAC Bank</option>
            <option value="DBBL">DBBL</option>
          </select>
        </div>

        {/* Account No */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Account No</label>
          <input
            type="text"
            name="accountNo"
            value={formData.accountNo}
            onChange={handleChange}
            placeholder="Enter account number"
            className="w-full border border-gray-300 rounded-lg px-3"
          />
        </div>

        {/* Cheque No */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Cheque No</label>
          <input
            type="text"
            name="chequeNo"
            value={formData.chequeNo}
            onChange={handleChange}
            placeholder="Enter cheque no"
            className="w-full border border-gray-300 rounded-lg px-3"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Amount 
            <span className="ml-1 text-red-500 font-medium">*</span>
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter amount"
            className="w-full border border-gray-300 rounded-lg px-3"
          />
        </div>

        {/* Remarks */}
        <div className="md:col-span-2">
          <label className="block text-gray-700 mb-1 font-medium">Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Any remarks..."
            rows="3"
            className="w-full border border-gray-300 rounded-lg px-3"
          />
        </div>

        {/* Buttons */}
        <div className="md:col-span-3 flex gap-4 mt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-1 rounded-lg text-white ${
              loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            } transition`}
          >
            {loading ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-1 rounded-lg text-white bg-gray-500 hover:bg-gray-600 transition"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-6 py-1 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            Print
          </button>
        </div>
      </form>
    </motion.div>
  );
}
