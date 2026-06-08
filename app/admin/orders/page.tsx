"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiUrl } from "@/lib/api";
import type { OrderStatus } from "@/lib/types";


interface OrderItem { name?: string; price?: number; qty?: number; size?: string; color?: string; image?: string; }
interface Order {
  _id?: string; id?: number | string; orderNumber: string;
  customer: { name?: string; firstName?: string; phone?: string; address?: string; };
  items: OrderItem[]; total: number; status: OrderStatus; paymentMethod?: string; createdAt: string;
}

const ALL_STATUSES: OrderStatus[] = ["pending", "Processing", "Shipped", "Delivered", "paid"];
const S: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "#92400e", bg: "#fef3c7" },
  paid: { label: "Paid", color: "#1e40af", bg: "#dbeafe" },
  Processing: { label: "Processing", color: "#b45309", bg: "#fef3c7" },
  processing: { label: "Processing", color: "#b45309", bg: "#fef3c7" },
  Shipped: { label: "Shipped", color: "#1e40af", bg: "#dbeafe" },
  shipped: { label: "Shipped", color: "#1e40af", bg: "#dbeafe" },
  Delivered: { label: "Delivered", color: "#065f46", bg: "#d1fae5" },
  delivered: { label: "Delivered", color: "#065f46", bg: "#d1fae5" },
  Cancelled: { label: "Cancelled", color: "#991b1b", bg: "#fee2e2" },
  cancelled: { label: "Cancelled", color: "#991b1b", bg: "#fee2e2" },
};

const STATUS_FILTERS = [
  { val: "all", label: "All" },
  { val: "pending", label: "Pending" },
  { val: "paid", label: "Paid" },
  { val: "processing", label: "Processing" },
  { val: "shipped", label: "Shipped" },
  { val: "delivered", label: "Delivered" },
  { val: "cancelled", label: "Cancelled" },
];

function mapApiOrder(p: any): Order {
  return {
    _id: String(p.id ?? p._id ?? ""),
    id: p.id,
    orderNumber: String(p.order_number ?? p.orderNumber ?? "N/A"),
    customer: {
      name: p.customer?.name ?? p.customer_first_name ?? null,
      firstName: p.customer?.firstName ?? p.customer_first_name,
      phone: p.customer?.phone ?? p.customer_phone,
      address: p.customer?.address ?? p.customer_address,
    },
    items: Array.isArray(p.items) ? p.items : (Array.isArray(p.order_items) ? p.order_items : []),
    total: Number(p.total ?? 0),
    status: (p.status ?? "pending") as OrderStatus,
    paymentMethod: p.payment_method ?? p.paymentMethod,
    createdAt: p.created_at ?? p.createdAt ?? new Date().toISOString(),
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState({ show: false, message: "", ok: true });
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const showToast = (message: string, ok = true) => {
    setToast({ show: true, message, ok });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  useEffect(() => {
    fetch(apiUrl("/admin/orders"))

      .then(r => r.json())
      .then((d: any) => setOrders(Array.isArray(d) ? d.map(mapApiOrder) : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(apiUrl(`/admin/orders/${orderId}`), {

        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(p => p.map(o => (o._id === orderId || String(o.id) === orderId) ? { ...o, status: newStatus } : o));
        if (selected?._id === orderId || String(selected?.id) === orderId) {
          setSelected(p => p ? { ...p, status: newStatus } : null);
        }
        showToast("Status updated");
      } else {
        showToast("Failed to update", false);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const cName = (o: Order) => o.customer?.name ?? o.customer?.firstName ?? "—";

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== "all") list = list.filter(o => String(o.status || "").toLowerCase() === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        cName(o).toLowerCase().includes(q) ||
        (o.customer?.phone ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ padding: "28px 20px 80px", minHeight: "100vh" }}
    >
      <style>{`
        .orders-filter-bar {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #fff;
          padding: 14px 16px;
          margin-bottom: 16px;
          border-radius: 12px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        @media (min-width: 768px) {
          .orders-filter-bar {
            flex-direction: row;
            align-items: center;
          }
        }
        .status-pills {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .order-card {
          background: #fff;
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 10px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .order-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }
        .order-card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 12px;
          color: #8a8680;
        }
        .order-card-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        .action-select {
          border: 1px solid rgba(0,0,0,0.12);
          padding: 7px 10px;
          font-size: 12px;
          outline: none;
          background: #fafaf8;
          font-family: DM Sans, sans-serif;
          border-radius: 8px;
          cursor: pointer;
          flex: 1;
          min-width: 120px;
        }
        .action-btn {
          padding: 7px 14px;
          font-size: 11px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-family: DM Sans, sans-serif;
          letter-spacing: 0.04em;
          transition: opacity 0.2s;
          white-space: nowrap;
        }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-confirm { background: #065f46; color: #fff; }
        .btn-reject  { background: #991b1b; color: #fff; }
        .btn-detail  { background: #f4f4f2; color: #0a0a0a; border: 1px solid rgba(0,0,0,0.1); }
        .drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 40;
        }
        .drawer {
          position: fixed;
          top: 0;
          right: 0;
          height: 100vh;
          width: min(420px, 100vw);
          background: #fff;
          z-index: 50;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          box-shadow: -4px 0 24px rgba(0,0,0,0.12);
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 6 }}>Management</div>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: 300, color: "#0a0a0a", margin: 0 }}>
          All <em>Orders</em>
        </h1>
      </div>

      {/* Filter bar */}
      <div className="orders-filter-bar">
        <input
          type="text"
          placeholder="Search order ID or customer…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, minWidth: 0, border: "1px solid rgba(0,0,0,0.12)", padding: "9px 12px", fontSize: "13px", outline: "none", fontFamily: "DM Sans, sans-serif", background: "#fafaf8", borderRadius: "8px" }}
        />
        <div className="status-pills">
          {STATUS_FILTERS.map(({ val, label }) => (
            <button
              key={val}
              onClick={() => { setStatusFilter(val); setPage(1); }}
              style={{
                padding: "7px 12px", fontSize: "11px", letterSpacing: "0.05em",
                textTransform: "uppercase", border: "1px solid",
                borderColor: statusFilter === val ? "#0a0a0a" : "rgba(0,0,0,0.15)",
                background: statusFilter === val ? "#0a0a0a" : "transparent",
                color: statusFilter === val ? "#fff" : "#8a8680",
                borderRadius: "8px", cursor: "pointer", transition: "all 0.18s",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: "11px", color: "#8a8680", marginBottom: 12 }}>
        {filtered.length} {filtered.length === 1 ? "order" : "orders"}
      </div>

      {/* Orders List */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ height: 96, background: "#ece9e3", borderRadius: 14 }} />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: "#8a8680" }}>
          <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", marginBottom: 8 }}>No orders found</div>
          <p style={{ fontSize: "13px" }}>Orders placed by customers will appear here.</p>
        </div>
      ) : (
        <>
          <AnimatePresence>
            {paginated.map((order, i) => {
              const cfg = S[order.status] ?? S.pending;
              const orderId = order._id || String(order.id) || order.orderNumber;
              const isUpdating = updatingId === orderId;
              const isPending = order.status.toLowerCase() === "pending";

              return (
                <motion.div
                  key={orderId}
                  className="order-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  {/* Top row: order ID + status badge + date */}
                  <div className="order-card-top">
                    <div>
                      <button
                        onClick={() => setSelected(order)}
                        style={{ fontFamily: "monospace", fontSize: "13px", color: "#c9a96e", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: "3px" }}
                      >
                        #{order.orderNumber}
                      </button>
                      <div style={{ fontSize: "13px", fontWeight: 500, marginTop: 4 }}>{cName(order)}</div>
                      {order.customer?.phone && (
                        <div style={{ fontSize: "11px", color: "#aaa" }}>📞 {order.customer.phone}</div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, padding: "4px 10px", borderRadius: 100, color: cfg.color, background: cfg.bg, whiteSpace: "nowrap" }}>
                        {cfg.label}
                      </span>
                      <div style={{ fontSize: "11px", color: "#aaa", marginTop: 6 }}>
                        {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  </div>

                  {/* Meta row */}
                  <div className="order-card-meta">
                    <span>🛍 {order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
                    <span style={{ fontWeight: 600, color: "#0a0a0a" }}>৳{Number(order.total || 0).toFixed(0)}</span>
                    {order.paymentMethod && <span>💳 {order.paymentMethod}</span>}
                  </div>

                  {/* Action row — always visible */}
                  <div className="order-card-actions">
                    <select
                      value={order.status}
                      disabled={isUpdating}
                      onChange={e => handleStatusUpdate(orderId, e.target.value as OrderStatus)}
                      className="action-select"
                    >
                      {ALL_STATUSES.map(s => (
                        <option key={s} value={s}>{S[s]?.label ?? s}</option>
                      ))}
                    </select>

                    {isPending && (
                      <>
                        <button
                          className="action-btn btn-confirm"
                          disabled={isUpdating}
                          onClick={() => handleStatusUpdate(orderId, "Processing")}
                        >
                          ✓ Confirm
                        </button>
                        <button
                          className="action-btn btn-reject"
                          disabled={isUpdating}
                          onClick={() => handleStatusUpdate(orderId, "Cancelled" as OrderStatus)}
                        >
                          ✕ Reject
                        </button>
                      </>
                    )}

                    <button
                      className="action-btn btn-detail"
                      onClick={() => setSelected(order)}
                    >
                      View
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
              <span style={{ fontSize: "12px", color: "#8a8680" }}>Page {page} of {totalPages}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ padding: "8px 16px", fontSize: "11px", border: "1px solid rgba(0,0,0,0.15)", background: "transparent", borderRadius: 8, cursor: "pointer", opacity: page === 1 ? 0.4 : 1 }}
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ padding: "8px 16px", fontSize: "11px", border: "1px solid rgba(0,0,0,0.15)", background: "transparent", borderRadius: 8, cursor: "pointer", opacity: page === totalPages ? 0.4 : 1 }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Order detail drawer ── */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              className="drawer-overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />
            <motion.div
              className="drawer"
              initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
            >
              {/* Drawer header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid rgba(0,0,0,0.07)", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#c9a96e" }}>#{selected.orderNumber}</div>
                  <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "20px", fontWeight: 300, marginTop: 2 }}>Order Details</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "18px", color: "#8a8680", cursor: "pointer", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>

              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Status + Date */}
                {(() => {
                  const cfg = S[selected.status] ?? S.pending;
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, padding: "5px 12px", borderRadius: 100, color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                      <span style={{ fontSize: "12px", color: "#aaa" }}>{new Date(selected.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                    </div>
                  );
                })()}

                {/* Customer */}
                <div>
                  <div style={{ fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#aaa", marginBottom: 8 }}>Customer</div>
                  <div style={{ fontSize: "14px", fontWeight: 500 }}>{cName(selected)}</div>
                  {selected.customer?.phone && <div style={{ fontSize: "13px", color: "#8a8680", marginTop: 3 }}>📞 {selected.customer.phone}</div>}
                  {selected.customer?.address && (
                    <div style={{ fontSize: "12px", color: "#aaa", marginTop: 3 }}>
                      {selected.customer.address}
                    </div>
                  )}
                </div>

                {/* Items */}
                <div>
                  <div style={{ fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#aaa", marginBottom: 8 }}>Items ({selected.items.length})</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {selected.items.map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f5f2ec", borderRadius: 10 }}>
                        <div style={{ width: 36, height: 36, background: "#fff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                          {item.image && item.image.length <= 2 ? item.image : "🛍️"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name ?? "Product"}</div>
                          <div style={{ fontSize: "11px", color: "#aaa" }}>{item.size} · {item.color} · Qty {item.qty}</div>
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 600, flexShrink: 0 }}>৳{(Number(item.price ?? 0) * Number(item.qty ?? 1)).toFixed(0)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderTop: "1px solid rgba(0,0,0,0.07)" }}>
                  <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#8a8680" }}>Order Total</span>
                  <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "26px", fontWeight: 300 }}>৳{Number(selected.total || 0).toFixed(0)}</span>
                </div>

                {/* Status update grid */}
                <div>
                  <div style={{ fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#aaa", marginBottom: 10 }}>Update Status</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {ALL_STATUSES.map(s => {
                      const isActive = selected.status === s;
                      const selectedId = selected._id || String(selected.id) || selected.orderNumber;
                      return (
                        <button
                          key={s}
                          disabled={isActive || updatingId === selectedId}
                          onClick={() => handleStatusUpdate(selectedId, s)}
                          style={{
                            padding: "10px 8px", fontSize: "11px", letterSpacing: "0.06em",
                            textTransform: "uppercase", border: "1px solid",
                            borderColor: isActive ? "#0a0a0a" : "rgba(0,0,0,0.15)",
                            background: isActive ? "#0a0a0a" : "transparent",
                            color: isActive ? "#fff" : "#0a0a0a",
                            borderRadius: 8, opacity: updatingId === selectedId ? 0.6 : 1,
                            transition: "all 0.2s", fontFamily: "DM Sans, sans-serif", cursor: isActive ? "default" : "pointer",
                          }}
                        >
                          {S[s]?.label ?? s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <div style={{
        position: "fixed", bottom: 32, left: "50%",
        transform: `translateX(-50%) translateY(${toast.show ? 0 : 16}px)`,
        background: toast.ok ? "#0a0a0a" : "#c0392b",
        color: "#fafaf8", padding: "11px 22px", fontSize: "12px",
        letterSpacing: "0.05em", zIndex: 400, opacity: toast.show ? 1 : 0,
        transition: "all 0.3s", pointerEvents: "none", whiteSpace: "nowrap",
        borderRadius: 8,
      }}>
        {toast.ok ? "✓ " : "✕ "}{toast.message}
      </div>
    </motion.div>
  );
}
