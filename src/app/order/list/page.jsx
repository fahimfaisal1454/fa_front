"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AxiosInstance from "@/app/components/AxiosInstance";

/* UI bits */
const Input = (p) => (
  <input
    {...p}
    className={
      "border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 " +
      (p.className || "")
    }
  />
);
const Button = ({ children, className, ...rest }) => (
  <button
    {...rest}
    className={"px-4 py-2 rounded border shadow-sm active:scale-[.99] " + (className || "")}
    type="button"
  >
    {children}
  </button>
);

const currency = (n) =>
  Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* Helpers for exports */
function downloadBlob(filename, mime, content) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function orderToCSV(order) {
  const rows = [];
  rows.push(["Order No", order.order_no]);
  rows.push(["Order Date", order.order_date]);
  rows.push([]);
  rows.push(["#", "Part No", "Product", "Qty", "Price", "Subtotal"]);

  let i = 1;
  (order.items || []).forEach((it) => {
    const part = it?.product_details?.part_no ?? "";
    const name = it?.product_details?.product_name ?? "";
    const qty = Number(it.quantity || 0);
    const price = Number(it.order_price || 0);
    rows.push([i++, part, name, qty, price, qty * price]);
  });

  return rows
    .map((r) =>
      r
        .map((c) => {
          const s = String(c ?? "");
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    )
    .join("\n");
}
function orderToPrintableHTML(order) {
  const bodyRows = (order.items || [])
    .map((it, idx) => {
      const part = it?.product_details?.part_no ?? "";
      const name = it?.product_details?.product_name ?? "";
      const qty = Number(it.quantity || 0);
      const price = Number(it.order_price || 0);
      return `<tr>
        <td style="border:1px solid #000;padding:6px;text-align:center;">${idx + 1}</td>
        <td style="border:1px solid #000;padding:6px;">${part}</td>
        <td style="border:1px solid #000;padding:6px;">${name}</td>
        <td style="border:1px solid #000;padding:6px;text-align:right;">${qty}</td>
        <td style="border:1px solid #000;padding:6px;text-align:right;">${price.toFixed(2)}</td>
        <td style="border:1px solid #000;padding:6px;text-align:right;">${(qty * price).toFixed(2)}</td>
      </tr>`;
    })
    .join("");

  const totalQty = (order.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0);
  const totalAmount = (order.items || []).reduce(
    (s, it) => s + Number(it.quantity || 0) * Number(it.order_price || 0),
    0
  );

  return `<!doctype html><html><head><meta charset="utf-8"/><title>${order.order_no}</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;padding:24px}
    h1{margin:0 0 8px 0}
    table{border-collapse:collapse;width:100%}
    th{border:1px solid #000;padding:6px;background:#f3f4f6;text-align:left}
    td{border:1px solid #000;padding:6px}
    tfoot td{font-weight:bold}
    .right{text-align:right}
  </style></head>
  <body>
    <h1>Order</h1>
    <p><strong>No:</strong> ${order.order_no} &nbsp;&nbsp; <strong>Date:</strong> ${order.order_date}</p>
    <table>
      <thead><tr>
        <th style="text-align:center;width:48px;">#</th>
        <th>Part No</th><th>Product</th>
        <th class="right" style="width:90px;">Qty</th>
        <th class="right" style="width:110px;">Price</th>
        <th class="right" style="width:130px;">Subtotal</th>
      </tr></thead>
      <tbody>${bodyRows || `<tr><td colspan="6" style="text-align:center;padding:10px">No items</td></tr>`}</tbody>
      <tfoot>
        <tr><td colspan="3" class="right">Totals</td>
        <td class="right">${totalQty}</td><td></td><td class="right">${totalAmount.toFixed(2)}</td></tr>
      </tfoot>
    </table>
    <script>window.print()</script>
  </body></html>`;
}

export default function OrderListPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await AxiosInstance.get("orders/");
      setOrders(Array.isArray(data) ? data : data?.results || []);
    } catch (e) {
      console.error(e);
      alert("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return orders;
    return orders.filter(
      (o) =>
        String(o.order_no || "").toLowerCase().includes(t) ||
        (o.items || []).some((it) =>
          String(it?.product_details?.part_no || "").toLowerCase().includes(t)
        )
    );
  }, [orders, q]);

  const exportExcel = (order) => downloadBlob(`${order.order_no}.csv`, "text/csv;charset=utf-8", orderToCSV(order));
  const exportPdf = (order) => {
    const html = orderToPrintableHTML(order);
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return alert("Popup blocked. Allow popups for PDF export.");
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const handleEdit = (order) => router.push(`/order/form?orderId=${order.id}`);
  const handleDelete = async (order) => {
    if (!confirm(`Delete order ${order.order_no}?`)) return;
    try {
      await AxiosInstance.delete(`orders/${order.id}/`);
      await load();
    } catch (e) {
      console.error(e);
      alert("Delete failed.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Order List</h1>

      <div className="flex gap-2 items-center mb-4">
        <Input placeholder="Search by Order No or Part No" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button className="border-emerald-300" onClick={load}>Refresh</Button>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 border w-14 text-center">SL.</th>
              <th className="p-2 border">Order No</th>
              <th className="p-2 border">Order date</th>
              <th className="p-2 border text-right">Items</th>
              <th className="p-2 border text-right">Quantity</th>
              <th className="p-2 border text-right">Total Amount</th>
              <th className="p-2 border text-center">Excel</th>
              <th className="p-2 border text-center">PDF</th>
              <th className="p-2 border text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="p-3 text-center" colSpan={9}>Loading...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td className="p-3 text-center text-gray-500" colSpan={9}>No orders found</td></tr>
            )}
            {!loading && filtered.map((o, idx) => {
              const totalQty = (o.items || []).reduce((s, it) => s + Number(it.quantity || 0), 0);
              const totalAmount = (o.items || []).reduce(
                (s, it) => s + Number(it.quantity || 0) * Number(it.order_price || 0), 0
              );
              return (
                <tr key={o.id}>
                  <td className="border p-2 text-center">{idx + 1}.</td>
                  <td className="border p-2">{o.order_no}</td>
                  <td className="border p-2">{o.order_date}</td>
                  <td className="border p-2 text-right">{o.items?.length || 0}</td>
                  <td className="border p-2 text-right">{totalQty}</td>
                  <td className="border p-2 text-right">{currency(totalAmount)}</td>
                  <td className="border p-2 text-center">
                    <button onClick={() => exportExcel(o)} title="Export Excel" className="inline-flex">
                      {/* Excel icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13l3 3m0-3l-3 3"/>
                      </svg>
                    </button>
                  </td>
                  <td className="border p-2 text-center">
                    <button onClick={() => exportPdf(o)} title="Export PDF" className="inline-flex">
                      {/* PDF icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="M9 18h3"/><path d="M12 12h3"/>
                      </svg>
                    </button>
                  </td>
                  <td className="border p-2 text-center">
                    <div className="inline-flex items-center">
                      <button onClick={() => handleEdit(o)} title="Edit order" className="inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(5,150,105)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
                        </svg>
                      </button>
                      <span className="inline-block w-px h-4 bg-gray-300 mx-3" />
                      <button onClick={() => handleDelete(o)} title="Delete order" className="inline-flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(220,38,38)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
