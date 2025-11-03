"use client";
import { useState } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

export default function AddPayReceipt() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    receiptNo: "AUTO GENERATE",
    billNo: "",
    accountTitle: "",
    sourceCategory: "",
    collectionName: "",
    borrowerName: "",
    owedName: "",
    description: "",
    transactionType: "",
    bankName: "",
    accountNo: "",
    chequeNo: "",
    amount: "",
    remarks: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFormData({
      date: "",
      receiptNo: "AUTO GENERATE",
      billNo: "",
      accountTitle: "",
      sourceCategory: "",
      collectionName: "",
      borrowerName: "",
      owedName: "",
      description: "",
      transactionType: "",
      bankName: "",
      accountNo: "",
      chequeNo: "",
      amount: "",
      remarks: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await AxiosInstance.post("add-income/", formData);
      toast.success("Receipt saved successfully!");
      handleReset();
      console.log("Response:", response.data);
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {/* Date */}
        <Input label="Date" name="date" type="date" value={formData.date} onChange={handleChange} />

        {/* Receipt No */}
        <Input label="Receipt No*" name="receiptNo" value={formData.receiptNo} readOnly />

        {/* Bill No */}
        <Input label="Bill No" name="billNo" value={formData.billNo} onChange={handleChange} />

        {/* Account Title */}
        <Input
          label="Account Title*"
          name="accountTitle"
          value={formData.accountTitle}
          onChange={handleChange}
          required
        />

        {/* Source Category */}
        <Select
          label="Source Category*"
          name="sourceCategory"
          value={formData.sourceCategory}
          onChange={handleChange}
          required
          options={[
            { label: "Salary Statement", value: "salary" },
            { label: "Sale Return", value: "sale_return" },
            { label: "Borrow Pay", value: "borrow_pay" },
            { label: "Owed Return", value: "owed_return" },
          ]}
        />

        {/* Collection Name */}
        <Input
          label="Collection Name*"
          name="collectionName"
          value={formData.collectionName}
          onChange={handleChange}
          required
        />

        {/* Borrower Name */}
        <Input
          label="Borrower Name*"
          name="borrowerName"
          value={formData.borrowerName}
          onChange={handleChange}
          required
        />

        {/* Owed Name */}
        <Input
          label="Owed Name*"
          name="owedName"
          value={formData.owedName}
          onChange={handleChange}
          required
        />

        {/* Description */}
        <Input label="Description" name="description" value={formData.description} onChange={handleChange} />

        {/* Transaction Type */}
        <Select
          label="Transaction Type*"
          name="transactionType"
          value={formData.transactionType}
          onChange={handleChange}
          required
          options={[
            { label: "Cash", value: "cash" },
            { label: "Bank", value: "bank" },
          ]}
        />

        {/* Bank Name */}
        <Input label="Bank Name*" name="bankName" value={formData.bankName} onChange={handleChange} required />

        {/* Account No */}
        <Input label="Account No*" name="accountNo" value={formData.accountNo} onChange={handleChange} required />

        {/* Cheque No */}
        <Input label="Cheque No*" name="chequeNo" value={formData.chequeNo} onChange={handleChange} required />

        {/* Amount */}
        <Input label="Amount*" name="amount" type="number" value={formData.amount} onChange={handleChange} required />

        {/* Remarks */}
        <Textarea label="Remarks" name="remarks" value={formData.remarks} onChange={handleChange} rows="3" />

        {/* Buttons */}
        <div className="md:col-span-4 flex gap-4 mt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-1 rounded-lg text-white ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"} transition`}
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

/* ----- Reusable Form Components ----- */
const Input = ({ label, name, readOnly, type = "text", ...props }) => (
  <div>
    <label className="block text-gray-700 mb-1 font-medium">{label}</label>
    <input
      name={name}
      type={type}
      readOnly={readOnly}
      {...props}
      className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none`}
    />
  </div>
);

const Select = ({ label, name, value, onChange, options, required }) => (
  <div>
    <label className="block text-gray-700 mb-1 font-medium">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
    >
      <option value="">--Select--</option>
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const Textarea = ({ label, name, ...props }) => (
  <div className="md:col-span-4">
    <label className="block text-gray-700 mb-1 font-medium">{label}</label>
    <textarea
      name={name}
      {...props}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
    />
  </div>
);
