"use client";
import { useState } from "react";

export default function PayReceipt({ receiptData }) {
  const [data] = useState(
    receiptData || {
      date: "2025-11-10",
      receiptNo: "HA49281",
      voucherNo: "SA00041122",
      accountTitle: "GOODS RETURN",
      description: "GOODS RETURN",
      transactionType: "Cash",
      amount: 2622.12,
      remarks: "BF",
      inWords: "TAKA TWO THOUSAND SIX HUNDRED TWENTY TWO AND TWELVE PAISE ONLY",
    }
  );

  // 🧾 Download PDF
  const handleDownloadPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById("pay-receipt");

    const opt = {
      margin: [0.2, 0.3],
      filename: `${data.voucherNo || "pay_receipt"}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      {/* Printable Section */}
      <div
        id="receive-receipt"
        className="bg-white w-full max-w-2xl mx-auto border border-gray-400 p-6 text-sm leading-relaxed"
        style={{ minWidth: '600px' }} // Force minimum width
      >
        {/* Header */}
        <div className="text-center border-b border-gray-400 pb-2 mb-3">
          <div className="flex justify-between items-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-16 object-contain"
            />
            <div className="text-right text-xs">
              <p><strong>SUZUKI | YAMAHA | BAJAJ</strong></p>
            </div>
          </div>

          <h1 className="text-2xl font-bold mt-2">Heaven Autos</h1>
          <p className="text-sm font-semibold">
            Genuine Motorcycle Parts Importer & Wholesaler
          </p>
          <p className="text-xs">
            77 R.N. Road, Noldanga Road (Heaven Building), Jashore-7400
          </p>
          <p className="text-xs">
            Phone: 0421-66095, Mob: 01924-331354, 01711-355328, 01778-117515
          </p>
          <p className="text-xs">
            E-mail: heavenautos77jsr@yahoo.com / heavenautojessore@gmail.com
          </p>
        </div>

        {/* Title and Info */}
        <div className="flex justify-between mb-2">
          <h2 className="font-bold text-lg underline mx-auto">Pay Receipt</h2>
        </div>
        <div className="flex justify-between mb-2 text-sm">
          <p>Date : {data.date}</p>
          <p>Receipt No : {data.receiptNo}</p>
        </div>

        {/* Table */}
        <table className="w-full border border-gray-500 text-center text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-500">
              <th className="border border-gray-500 py-1">Voucher No</th>
              <th className="border border-gray-500 py-1">Account Title</th>
              <th className="border border-gray-500 py-1">Description</th>
              <th className="border border-gray-500 py-1">Transaction Type</th>
              <th className="border border-gray-500 py-1">Amount</th>
              <th className="border border-gray-500 py-1">Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-500 py-1">{data.voucherNo}</td>
              <td className="border border-gray-500 py-1">{data.accountTitle}</td>
              <td className="border border-gray-500 py-1">{data.description}</td>
              <td className="border border-gray-500 py-1">
                {data.transactionType.toUpperCase()}
              </td>
              <td className="border border-gray-500 py-1">{data.amount}</td>
              <td className="border border-gray-500 py-1">{data.remarks}</td>
            </tr>
            <tr>
              <td
                colSpan={4}
                className="border border-gray-500 py-1 text-right font-semibold"
              >
                Total:
              </td>
              <td
                colSpan={2}
                className="border border-gray-500 py-1 text-left font-semibold"
              >
                {data.amount}
              </td>
            </tr>
          </tbody>
        </table>

        {/* In Words */}
        <p className="mt-3 text-sm">
          <strong>In Words:</strong> {data.inWords}
        </p>

        {/* Signature and Footer */}
        <div className="flex justify-between mt-12">
          <div></div>
          <div className="text-center">
            <p>----------------------</p>
            <p className="text-xs font-semibold">Authorized Signature</p>
          </div>
        </div>

        <p className="text-right text-xs mt-4 italic">
          Print : Admin , {new Date().toDateString()}{" "}
          {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownloadPDF}
        className="mt-6 bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg shadow-md text-sm"
      >
        Download PDF
      </button>
    </div>
  );
}
