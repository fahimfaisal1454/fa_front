"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AxiosInstance from "@/app/components/AxiosInstance";

const Box = ({ children }) => <div className="border rounded-md p-4">{children}</div>;
const Label = ({ children }) => <div className="text-sm font-semibold mb-1">{children}</div>;
const Input = (p) => (
  <input
    {...p}
    className={
      "border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 " +
      (p.className || "")
    }
  />
);
const Select = ({ children, className, ...rest }) => (
  <select
    {...rest}
    className={
      "border rounded px-3 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 " +
      (className || "")
    }
  >
    {children}
  </select>
);
const Button = ({ children, className, ...rest }) => (
  <button
    {...rest}
    className={
      "px-4 py-2 rounded border shadow-sm active:scale-[.99] transition-all cursor-pointer " +
      (className || "")
    }
    type="button"
  >
    {children}
  </button>
);
const currency = (n) =>
  Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function OrderFormPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [orderNo, setOrderNo] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));

  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [stocks, setStocks] = useState([]);

  const [companyId, setCompanyId] = useState("");
  const [productId, setProductId] = useState("");
  const [partNo, setPartNo] = useState("");
  const [currentStock, setCurrentStock] = useState(0);
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");

  const [rows, setRows] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load lookups
  useEffect(() => {
    (async () => {
      try {
        const [c, p, s] = await Promise.all([
          AxiosInstance.get("companies/"),
          AxiosInstance.get("products/"),
          AxiosInstance.get("stocks/"),
        ]);
        setCompanies(c.data || []);
        setProducts(Array.isArray(p.data) ? p.data : p.data?.results || []);
        setStocks(s.data || []);
      } catch (e) {
        console.error(e);
        alert("Failed to load dropdown data.");
      }
    })();
  }, []);

  // Load order (edit mode)
  useEffect(() => {
    if (!orderId || companies.length === 0) return;
    (async () => {
      try {
        const { data } = await AxiosInstance.get(`orders/${orderId}/`);
        setOrderNo(data.order_no || "");
        if (data?.order_date) setOrderDate(data.order_date);

        const mapped =
          (data?.items || []).map((it) => {
            const companyId =
              it?.product_details?.company?.id ||
              it?.product_details?.company ||
              null;
            const companyName =
              companies.find((c) => c.id === companyId)?.company_name || "";
            return {
              product_id: it.product_id ?? it.product,
              company_name: companyName,
              part_no: it?.product_details?.part_no ?? "",
              product_name: it?.product_details?.product_name ?? "",
              price: Number(it?.order_price || 0),
              qty: Number(it?.quantity || 0),
            };
          }) || [];

        setRows(mapped);
      } catch (e) {
        console.error(e);
        alert("Failed to load order.");
      }
    })();
  }, [orderId, companies]);

  // Filter products by company
  const productsForCompany = useMemo(() => {
    const id = Number(companyId);
    return products.filter((p) => p.company === id || p.company?.id === id);
  }, [companyId, products]);

  const productOptions = useMemo(
    () => productsForCompany.map((p) => ({ id: p.id, name: p.product_name, part: p.part_no })),
    [productsForCompany]
  );
  const partOptions = useMemo(
    () => productsForCompany.map((p) => ({ value: p.part_no, product_id: p.id })),
    [productsForCompany]
  );

  // Sync stock & price
  useEffect(() => {
    if (!productId && !partNo) {
      setCurrentStock(0);
      setPrice("");
      return;
    }
    let prod = null;
    if (productId) {
      prod = productsForCompany.find((p) => String(p.id) === String(productId));
      if (prod && !partNo) setPartNo(prod.part_no);
    } else if (partNo) {
      const hit = partOptions.find((o) => o.value === partNo);
      if (hit) setProductId(String(hit.product_id));
      prod = productsForCompany.find((p) => p.id === hit?.product_id);
    }
    if (!prod) return;
    const st = stocks.find((s) => String(s.product?.id || s.product) === String(prod.id));
    setCurrentStock(st?.current_stock_quantity || 0);
    setPrice(Number(st?.sale_price || prod.product_bdt || 0).toFixed(2));
  }, [productId, partNo, productsForCompany, partOptions, stocks]);

  const clearControls = () => {
    setProductId("");
    setPartNo("");
    setCurrentStock(0);
    setPrice("");
    setQty("");
  };

  const addOrSaveLine = () => {
    const pid = Number(productId);
    const prod = products.find((p) => p.id === pid);
    if (!companyId) return alert("Choose company.");
    if (!prod) return alert("Select product.");
    const qn = Number(qty || 0);
    if (qn <= 0) return alert("Enter quantity.");
    const pr = Number(price || 0);

    const newRow = {
      product_id: pid,
      company_name:
        companies.find((c) => String(c.id) === String(companyId))?.company_name || "",
      part_no: prod.part_no,
      product_name: prod.product_name,
      price: pr,
      qty: qn,
    };

    setRows((prev) => {
      const copy = [...prev];
      if (editingIndex !== null) copy[editingIndex] = newRow;
      else copy.push(newRow);
      return copy;
    });
    setEditingIndex(null);
    clearControls();
  };

  const editLine = (i) => {
    const r = rows[i];
    setEditingIndex(i);
    if (!companyId) {
      const prodCompany = products.find((p) => p.id === r.product_id)?.company;
      if (prodCompany) setCompanyId(String(prodCompany.id || prodCompany));
    }
    setProductId(String(r.product_id));
    setPartNo(r.part_no || "");
    setQty(String(r.qty || ""));
    setPrice(String(r.price || ""));
    const st = stocks.find((s) => String(s.product?.id || s.product) === String(r.product_id));
    setCurrentStock(st?.current_stock_quantity || 0);
  };

  // 🔥 Added delete confirmation
  const removeLine = (i) => {
    const r = rows[i];
    const confirmDelete = confirm(`Are you sure you want to remove ${r.product_name}?`);
    if (!confirmDelete) return;
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  };

  const cancelLineEdit = () => {
    setEditingIndex(null);
    clearControls();
  };

  const total = useMemo(() => rows.reduce((s, r) => s + r.price * r.qty, 0), [rows]);

  const submit = async () => {
    if (!rows.length) return alert("Add at least one line.");
    const payload = {
      order_date: orderDate,
      items: rows.map((r) => ({
        product_id: r.product_id,
        quantity: r.qty,
        order_price: r.price,
      })),
    };
    try {
      setSaving(true);
      if (orderId) {
        await AxiosInstance.put(`orders/${orderId}/`, payload);
        alert("Order updated.");
      } else {
        await AxiosInstance.post("orders/", payload);
        alert("Order submitted.");
        setRows([]);
        clearControls();
      }
    } catch (e) {
      console.error(e);
      alert(orderId ? "Failed to update order." : "Failed to submit order.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Product Order Entry</h1>

      {/* Header */}
      <Box>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Order No:</Label>
            <Input value={orderNo ? orderNo : orderId ? `Editing #${orderId}` : "AUTO GENERATED"} readOnly />
          </div>
          <div>
            <Label>Order Date: <span className="text-red-600">*</span></Label>
            <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
          </div>
        </div>
      </Box>

      {/* Search */}
      <h2 className="mt-6 mb-2 font-semibold">Product Search</h2>
      <Box>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <Label>Company Name:</Label>
            <div className="flex gap-2">
              <Select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                <option value="">--Select--</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </Select>
              <Button className="bg-emerald-400 text-white hover:bg-emerald-500">Search</Button>
            </div>
          </div>

          <div className="md:col-span-4">
            <Label>Product Name</Label>
            <Select disabled={!companyId} value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">Select product</option>
              {productOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </Select>
          </div>

          <div className="md:col-span-4">
            <Label>Part No</Label>
            <Select disabled={!companyId} value={partNo} onChange={(e) => setPartNo(e.target.value)}>
              <option value="">Select part</option>
              {partOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.value}</option>
              ))}
            </Select>
          </div>

          <div className="md:col-span-3">
            <Label>Current Stock</Label>
            <Input value={currentStock} readOnly />
          </div>

          <div className="md:col-span-3">
            <Label>Sale Price</Label>
            <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>

          <div className="md:col-span-3">
            <Label>Qty</Label>
            <Input type="number" min={0} value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>

          <div className="md:col-span-3 flex gap-2">
            <Button
              className={(editingIndex !== null ? "bg-amber-500 hover:bg-amber-600 text-white " : "bg-violet-600 hover:bg-violet-700 text-white ") + "w-full"}
              onClick={addOrSaveLine}
              disabled={!productId || !qty}
            >
              {editingIndex !== null ? "Save Line" : "Add"}
            </Button>
            {editingIndex !== null && (
              <Button className="w-full hover:bg-gray-100" onClick={cancelLineEdit}>Cancel</Button>
            )}
          </div>
        </div>
      </Box>

      {/* Product Table */}
      <h2 className="mt-6 mb-2 font-semibold">Product Details</h2>
      <div className="border rounded-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Company</th>
              <th className="p-2 border">Part No</th>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Subtotal</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={8} className="p-3 text-center text-gray-500">No items added</td></tr>
            ) : (
              rows.map((r, i) => {
                const sub = r.price * r.qty;
                return (
                  <tr key={`${r.product_id}-${i}`}>
                    <td className="border p-2 text-center">{i + 1}</td>
                    <td className="border p-2">{r.company_name}</td>
                    <td className="border p-2">{r.part_no}</td>
                    <td className="border p-2">{r.product_name}</td>
                    <td className="border p-2 text-right">{r.price.toFixed(2)}</td>
                    <td className="border p-2 text-right">{r.qty}</td>
                    <td className="border p-2 text-right">{currency(sub)}</td>
                    <td className="border p-2 text-center space-x-2">
                      <Button
                        onClick={() => editLine(i)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 cursor-pointer"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => removeLine(i)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 cursor-pointer"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6} className="border p-2 text-right font-semibold">Total</td>
              <td className="border p-2 text-right font-bold">{currency(total)}</td>
              <td className="border p-2" />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end">
        <Button className="bg-emerald-400 hover:bg-emerald-500 text-white" onClick={submit} disabled={saving || !rows.length}>
          {orderId ? (saving ? "Updating..." : "Update Order") : saving ? "Submitting..." : "Submit Order"}
        </Button>
      </div>
    </div>
  );
}
