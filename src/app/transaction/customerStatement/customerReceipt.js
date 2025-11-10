import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const handleDownloadPDF = (sales, filters, totalSales, totalPaid, totalDue, toast) => {
  if (!sales || sales.length === 0) {
    toast.error("No data available to export!");
    return;
  }

  const doc = new jsPDF("p", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  // ====== SET BLACK COLOR ======
  doc.setTextColor(0, 0, 0); // ensure all text is black

  // ====== HEADER SECTION ======
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Heaven Autos", pageWidth / 2, 40, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Genuine Motorcycle Parts Importer & Wholesaler", pageWidth / 2, 55, { align: "center" });
  doc.text("77 R.N. Road, Noldanga Road (Heaven Building), Jashore-7400", pageWidth / 2, 68, { align: "center" });
  doc.text("Phone: 0421-66095, Mob: 01924-331354 | Email: heavenautos77jsr@yahoo.com", pageWidth / 2, 81, { align: "center" });

  doc.setLineWidth(0.5);
  doc.line(40, 90, pageWidth - 40, 90);

  // ====== TITLE ======
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Customer Sales Statement", pageWidth / 2, 115, { align: "center" });

  // ====== CUSTOMER INFO ======
  const customer = sales[0]?.customer || {};
  const yStart = 140;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Date Range: ${filters.from_date || "—"} to ${filters.to_date || "—"}`, 40, yStart);
  doc.text(`Customer Name: ${customer.customer_name || "—"}`, 40, yStart + 18);
  doc.text(`Shop Name: ${customer.shop_name || "—"}`, 40, yStart + 36);
  doc.text(`Address: ${customer.address || "—"}`, 40, yStart + 56);

  // ====== TABLE ======
  const tableColumn = [
    "Date",
    "Bill No",
    "Transaction Type",
    "Sales Amount",
    "Received",
    "Due",
    "Remarks",
  ];

  const tableRows = sales.map((sale) => {
    const paid = sale.payments?.reduce((sum, p) => sum + parseFloat(p.paid_amount || 0), 0) || 0;
    const due = parseFloat(sale.total_amount || 0) - paid;
    const paymentModes =
      sale.payments?.length > 0 ? sale.payments.map((p) => p.payment_mode).join(", ") : "—";

    return [
      sale.sale_date || "—",
      sale.invoice_no || "—",
      paymentModes,
      (parseFloat(sale.total_amount) || 0).toFixed(2),
      paid.toFixed(2),
      due.toFixed(2),
      "—",
    ];
  });

  autoTable(doc, {
    startY: yStart + 70,
    head: [tableColumn],
    body: tableRows,
    styles: { 
        fontSize: 10, 
        halign: "center", 
        textColor: [0, 0, 0], 
        lineWidth: 0.5,        // border thickness
        lineColor: [0, 0, 0],  // border color
    },
    foot: [
        [
        { content: "Total:", colSpan: 3, styles: { halign: "right", textColor: [0, 0, 0] } },
        { content: (totalSales || 0).toFixed(2), styles: { halign: "right", textColor: [0, 0, 0] } },
        { content: (totalPaid || 0).toFixed(2), styles: { halign: "right", textColor: [0, 0, 0] } },
        { content: (totalDue || 0).toFixed(2), styles: { halign: "right", textColor: [0, 0, 0] } },
        "",
        ],
    ],
    headStyles: { 
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0], 
        lineWidth: 0.5, 
        lineColor: [0, 0, 0] 
    },
    bodyStyles: { 
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0], 
        lineWidth: 0.5, 
        lineColor: [0, 0, 0] 
    },
    footStyles: { 
        fillColor: [255, 255, 255], 
        textColor: [0, 0, 0], 
        lineWidth: 0.5, 
        lineColor: [0, 0, 0] 
    },
    // ensure borders for all cells
    didParseCell: function (data) {
        data.cell.styles.lineWidth = 0.5;
        data.cell.styles.lineColor = [0, 0, 0];
    }
  });

  // ====== FOOTER ======
  const finalY = doc.lastAutoTable?.finalY || 750;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Authorized Signature: ___________________", 40, finalY + 30);

  // ====== SAVE PDF ======
  doc.save(`Customer_Statement_${filters.from_date || ""}_to_${filters.to_date || ""}.pdf`);
};
