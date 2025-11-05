"use client";

import React, { useState, useEffect } from "react";
import AxiosInstance from "@/app/components/AxiosInstance";
import { useParams } from "next/navigation";

export default function PaymentVoucherPage() {
  const [receiptData, setReceiptData] = useState(null);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      AxiosInstance.get(`add-income/${id}/`)
        .then((res) => {
          console.log(res.data);
          setReceiptData(res.data);
        })
        .catch((err) => console.error("Error fetching income:", err));
    }
  }, [id]);

  // Auto-generate PDF when receiptData is available
  useEffect(() => {
    if (receiptData && !pdfGenerated) {
      generatePDF();
      setPdfGenerated(true);
    }
  }, [receiptData, pdfGenerated]);

  const generatePDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      
      // Create new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set margins and initial position
      const margin = 15;
      let yPosition = margin;

      // Company Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('HEAVEN AUTOS', 105, yPosition, { align: 'center' });
      yPosition += 8;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Genuine Motorcycle Parts Importer & Wholesaler', 105, yPosition, { align: 'center' });
      yPosition += 5;

      pdf.setFontSize(10);
      pdf.text('77 R.N. Road, Noldanga Road (Heaven Building), Jashore-7400', 105, yPosition, { align: 'center' });
      yPosition += 4;
      pdf.text('Phone: 0421-66095, Mob: 01924-331354, 01711-355328, 01778-117515', 105, yPosition, { align: 'center' });
      yPosition += 4;
      pdf.text('E-mail: heavenautos77jsr@yahoo.com / heavenautojessore@gmail.com', 105, yPosition, { align: 'center' });
      yPosition += 4;
      pdf.text('SUZUKI | YAMAHA | BAJAJ - Authorized Dealer', 105, yPosition, { align: 'center' });
      yPosition += 8;

      // Separator line
      pdf.setDrawColor(0, 0, 0);
      pdf.line(margin, yPosition, 200 - margin, yPosition);
      yPosition += 10;

      // Receipt Title
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RECEIVE RECEIPT', 105, yPosition, { align: 'center' });
      yPosition += 10;

      // Date and Receipt No
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Date: ${new Date(receiptData.date).toLocaleDateString('en-GB')}`, margin, yPosition);
      pdf.text(`Receipt No: ${receiptData.receiptNo}`, 200 - margin, yPosition, { align: 'right' });
      yPosition += 8;

      // Table Header
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      
      const colWidths = [25, 35, 35, 25, 25, 25];
      const headers = ['Voucher No', 'Account Title', 'Description', 'Trans Type', 'Amount', 'Remarks'];
      
      let xPosition = margin;
      
      // Draw table headers with borders
      headers.forEach((header, index) => {
        pdf.rect(xPosition, yPosition, colWidths[index], 8);
        pdf.text(header, xPosition + 2, yPosition + 5);
        xPosition += colWidths[index];
      });
      
      yPosition += 8;

      // Table Data Row
      pdf.setFont('helvetica', 'normal');
      xPosition = margin;
      
      const rowData = [
        receiptData.voucherNo || '-',
        receiptData.accountTitle || '-',
        receiptData.description || '-',
        (receiptData.transactionType || '-').toUpperCase(),
        parseFloat(receiptData.amount || 0).toFixed(2),
        receiptData.remarks || '-'
      ];

      // Draw table data row
      colWidths.forEach((width, index) => {
        pdf.rect(xPosition, yPosition, width, 8);
        const text = rowData[index].toString();
        // Adjust text position for amount (right aligned)
        if (index === 4) { // Amount column
          pdf.text(text, xPosition + width - 2, yPosition + 5, { align: 'right' });
        } else {
          pdf.text(text, xPosition + 2, yPosition + 5);
        }
        xPosition += width;
      });

      yPosition += 8;

      // Total Row
      pdf.setFont('helvetica', 'bold');
      xPosition = margin;
      
      // Draw "TOTAL" spanning first 4 columns
      const totalSpanWidth = colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3];
      pdf.rect(xPosition, yPosition, totalSpanWidth, 8);
      pdf.text('TOTAL:', xPosition + totalSpanWidth - 2, yPosition + 5, { align: 'right' });
      xPosition += totalSpanWidth;
      
      // Draw amount in 5th column
      pdf.rect(xPosition, yPosition, colWidths[4], 8);
      pdf.text(parseFloat(receiptData.amount || 0).toFixed(2), xPosition + colWidths[4] - 2, yPosition + 5, { align: 'right' });
      xPosition += colWidths[4];
      
      // Empty 6th column
      pdf.rect(xPosition, yPosition, colWidths[5], 8);

      yPosition += 15;

      // In Words Section
      const inWords = receiptData.inWords || convertToWords(receiptData.amount);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('In Words:', margin, yPosition);
      
      // Split long text into multiple lines
      pdf.setFont('helvetica', 'normal');
      const words = inWords.split(' ');
      let currentLine = '';
      const maxWidth = 180;
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = pdf.getTextWidth(testLine);
        
        if (testWidth > maxWidth && currentLine) {
          pdf.text(currentLine, margin, yPosition + 4);
          yPosition += 4;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      
      if (currentLine) {
        pdf.text(currentLine, margin, yPosition + 4);
        yPosition += 8;
      }

      yPosition += 10;

      // Signatures Section
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Customer Signature
      pdf.text('_____________________', margin + 20, yPosition);
      pdf.text('Customer Signature', margin + 30, yPosition + 5);
      
      // Authorized Signature
      pdf.text('_____________________', 200 - margin - 60, yPosition);
      pdf.text('Authorized Signature', 200 - margin - 50, yPosition + 5);

      yPosition += 20;

      // Footer
      pdf.setFontSize(8);
      const footerText = `Printed by: Admin | Date: ${new Date().toLocaleDateString('en-GB')} | Time: ${new Date().toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
      pdf.text(footerText, 200 - margin, yPosition, { align: 'right' });

      // Open PDF in new tab automatically
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);

    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  };

  const convertToWords = (amount) => {
    if (!amount) return "";
    
    const num = parseFloat(amount);
    if (isNaN(num)) return "";

    const units = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];
    const teens = ["TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];
    const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];

    if (num === 0) return "ZERO";

    let words = "";
    let integerPart = Math.floor(num);
    let decimalPart = Math.round((num - integerPart) * 100);

    // Handle thousands
    if (integerPart >= 1000) {
      const thousands = Math.floor(integerPart / 1000);
      if (thousands > 0) {
        words += units[thousands] + " THOUSAND ";
      }
      integerPart %= 1000;
    }

    // Handle hundreds
    if (integerPart >= 100) {
      const hundreds = Math.floor(integerPart / 100);
      words += units[hundreds] + " HUNDRED ";
      integerPart %= 100;
    }

    // Handle tens and units
    if (integerPart >= 20) {
      const tensDigit = Math.floor(integerPart / 10);
      words += tens[tensDigit] + " ";
      integerPart %= 10;
    }

    if (integerPart >= 10 && integerPart < 20) {
      words += teens[integerPart - 10] + " ";
      integerPart = 0;
    }

    if (integerPart > 0) {
      words += units[integerPart] + " ";
    }

    words += "TAKA";

    // Handle paise
    if (decimalPart > 0) {
      words += " AND ";
      if (decimalPart >= 20) {
        const tensDigit = Math.floor(decimalPart / 10);
        words += tens[tensDigit] + " ";
        decimalPart %= 10;
      }
      if (decimalPart >= 10 && decimalPart < 20) {
        words += teens[decimalPart - 10] + " ";
        decimalPart = 0;
      }
      if (decimalPart > 0) {
        words += units[decimalPart] + " ";
      }
      words += "PAISE";
    }

    return words + " ONLY";
  };

//   // Show only loading state, then auto-open PDF
//   return (
//     <div style={{ 
//       display: 'flex', 
//       justifyContent: 'center', 
//       alignItems: 'center', 
//       height: '100vh',
//       flexDirection: 'column',
//       gap: '16px',
//       backgroundColor: '#f8f9fa'
//     }}>
//       <div style={{
//         animation: 'spin 1s linear infinite',
//         height: '2rem',
//         width: '2rem',
//         border: '4px solid #3b82f6',
//         borderTop: '4px solid transparent',
//         borderRadius: '50%'
//       }}></div>
//       <p style={{ color: '#6b7280', fontSize: '16px' }}>Generating PDF voucher...</p>
//     </div>
//   );
}