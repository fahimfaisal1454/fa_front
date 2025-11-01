"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AxiosInstance from "@/app/components/AxiosInstance";

/* UI helpers */
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
    className={"px-4 py-2 rounded border shadow-sm active:scale-[.99] " + (className || "")}
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

  /* Header */
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));

  /* Lookups */
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [stocks, setStocks] = useState([]);

  /* Search controls (empty by default) */
  const [companyId, setCompanyId] = useState("");
  const [productId, setProductId] = useState("");
  const [partNo, setPartNo] = useState("");
  const [currentStock, setCurrentStock] = useState(0);
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");

  /* Order lines + editing */
  const [rows, setRows] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);

  /* Load lookups once */
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

  /* Load order (edit mode) */
  useEffect(() => {
    if (!orderId) return;
    (async () => {
      try {
        const { data } = await AxiosInstance.get(`orders/${orderId}/`);
        if (data?.order_date) setOrderDate(data.order_date);

        const rowsMapped =
          (data?.items || []).map((it) => ({
            product_id: it.product_id ?? it.product, // serializer exposes product_id
            company_name: "", // will be displayed after company select/edit; optional
            part_no: it?.product_details?.part_no ?? "",
            product_name: it?.product_details?.product_name ?? "",
            price: Number(it?.order_price || 0),
            qty: Number(it?.quantity || 0),
          })) || [];

        setRows(rowsMapped);
      } catch (e) {
        console.error(e);
        alert("Failed to load order.");
      }
    })();
  }, [orderId]);

  /* Derived lists per company */
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

  /* keep stock/price in sync */
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

  /* Controls helpers */
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
      if (editingIndex !== null) {
        copy[editingIndex] = newRow; // replace (no doubling)
      } else {
        copy.push(newRow);
      }
      return copy;
    });
    setEditingIndex(null);
    clearControls();
  };

  const editLine = (i) => {
    const r = rows[i];
    setEditingIndex(i);
    if (!companyId) {
      // infer & lock the company only if blank (optional)
      const prodCompany = products.find((p) => p.id === r.product_id)?.company;
      if (prodCompany) setCompanyId(String(prodCompany));
    }
    setProductId(String(r.product_id));
    setPartNo(r.part_no || "");
    setQty(String(r.qty || ""));
    setPrice(String(r.price || ""));
    // stock display
    const st = stocks.find((s) => String(s.product?.id || s.product) === String(r.product_id));
    setCurrentStock(st?.current_stock_quantity || 0);
  };

  const cancelLineEdit = () => {
    setEditingIndex(null);
    clearControls();
  };

  const removeLine = (i) => {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
    if (editingIndex === i) cancelLineEdit();
  };

  const total = useMemo(() => rows.reduce((s, r) => s + Number(r.price) * Number(r.qty), 0), [rows]);

  /* Submit: PUT replaces items list; POST creates */
  const submit = async () => {
    if (!rows.length) return alert("Add at least one line.");
    const payload = {
      order_date: orderDate,
      items: rows.map((r) => ({
        product_id: r.product_id,
        quantity: Number(r.qty),
        order_price: Number(r.price),
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
            <Input value={orderId ? `Editing #${orderId}` : "AUTO GENERATED"} readOnly />
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
            <Label>Company Name: <span className="text-red-600">*</span></Label>
            <div className="flex gap-2">
              <Select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                <option value="">--Select--</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.company_name}</option>
                ))}
              </Select>
              <Button className="bg-emerald-400 text-white">Search</Button>
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
              className={(editingIndex !== null ? "bg-amber-500 text-white " : "bg-violet-600 text-white ") + "w-full"}
              onClick={addOrSaveLine}
              disabled={!productId || !qty}
            >
              {editingIndex !== null ? "Save Line" : "Add"}
            </Button>
            {editingIndex !== null && (
              <Button className="w-full" onClick={cancelLineEdit}>Cancel</Button>
            )}
          </div>
        </div>
      </Box>

      {/* Table */}
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
                const sub = Number(r.price) * Number(r.qty);
                return (
                  <tr key={`${r.product_id}-${i}`}>
                    <td className="border p-2 text-center">{i + 1}</td>
                    <td className="border p-2">{r.company_name}</td>
                    <td className="border p-2">{r.part_no}</td>
                    <td className="border p-2">{r.product_name}</td>
                    <td className="border p-2 text-right">{Number(r.price).toFixed(2)}</td>
                    <td className="border p-2 text-right">{r.qty}</td>
                    <td className="border p-2 text-right">{currency(sub)}</td>
                    <td className="border p-2 text-center">
                      <div className="inline-flex items-center">
                        <button onClick={() => editLine(i)} className="text-emerald-600 hover:underline">Edit</button>
                        <span className="inline-block w-px h-4 bg-gray-300 mx-3" />
                        <button onClick={() => removeLine(i)} className="text-red-600 hover:underline">Remove</button>
                      </div>
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

      <div className="mt-6 flex justify-end">
        <Button className="bg-emerald-400 text-white" onClick={submit} disabled={saving || rows.length === 0}>
          {orderId ? (saving ? "Updating..." : "Update Order") : saving ? "Submitting..." : "Submit Order"}
        </Button>
      </div>
    </div>
  );
}
