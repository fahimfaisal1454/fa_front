import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const handleDownloadPDF = (
  salesData,
  fromDate,
  toDate,
  customer,
  company,
  totalAmount,
  toast
) => {
  if (!salesData || salesData.length === 0) {
    toast.error("No data available to export!");
    return;
  }

  const doc = new jsPDF("p", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  // ===== HEADER =====
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Heaven Autos", pageWidth / 2, 40, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    "Genuine Motorcycle Parts Importer & Wholesaler",
    pageWidth / 2,
    55,
    { align: "center" }
  );
  doc.text(
    "77 R.N. Road, Noldanga Road (Heaven Building), Jashore-7400",
    pageWidth / 2,
    68,
    { align: "center" }
  );
  doc.text(
    "Phone: 0421-66095, Mob: 01924-331354 | Email: heavenautos77jsr@yahoo.com",
    pageWidth / 2,
    81,
    { align: "center" }
  );

  doc.setLineWidth(0.5);
  doc.line(40, 90, pageWidth - 40, 90);

  // ===== TITLE =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Brand Wise Sale Statement Report", pageWidth / 2, 115, {
    align: "center",
  });

  // ===== FILTER INFO =====
  const yStart = 140;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Company Name: ${company || "—"}`, 40, yStart);
  doc.text(`Date Range: ${fromDate || "—"} to ${toDate || "—"}`, 40, yStart + 18);

  // ===== TABLE HEAD =====
  const tableColumn = [
    "Date",
    "Invoice No",
    "Part No",
    "Product Name",
    "Customer Name",
    "Qty",
    "Sale Amount",
  ];

  const tableRows = [];

  // Flatten data
  salesData.forEach((sale) => {
    sale.products.forEach((product) => {
      tableRows.push([
        sale.sale_date || "—",
        sale.invoice_no || "—",
        product.part_no || "—",
        product.product.product_name || "—",
        sale.customer?.customer_name || "—",
        product.sale_quantity?.toFixed(2) || "0.00",
        product.total_price
          ? parseFloat(product.total_price).toFixed(2)
          : "0.00",
      ]);
    });
  });

  // ===== TABLE =====
  autoTable(doc, {
    startY: yStart + 40,
    head: [tableColumn],
    body: tableRows,
    styles: {
      fontSize: 10,
      halign: "center",
      textColor: [0, 0, 0],
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineWidth: 0.5,
      lineColor: [0, 0, 0],
    },
  });

  // ===== TOTAL =====
  const finalY = doc.lastAutoTable.finalY || 750;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(
    `Grand Total: ${totalAmount?.toFixed(2) || "0.00"} BDT`,
    pageWidth - 60,
    finalY + 20,
    { align: "right" }
  );

  // ===== FOOTER =====
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Authorized Signature: ___________________", 40, finalY + 60);

  // ===== SAVE PDF =====
  doc.save(
    `${company}_sale report_${fromDate || ""}_to_${toDate || ""}.pdf`
  );
};
