"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { OrderStatus } from "@/lib/types";

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  newCustomers: number;
  recentOrders: RecentOrder[];
  lowStock: LowStockProduct[];
}
interface RecentOrder {
  _id: string; orderNumber: string;
  customer: { name?: string; email?: string };
  total: number; status: OrderStatus; createdAt: string;
  items: { name?: string }[];
}
interface LowStockProduct {
  _id: string; name: string; stockCount: number; price: number;
}

const S: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: "Pending",    color: "#92400e", bg: "#fef3c7" },
  paid:       { label: "Paid",       color: "#1e40af", bg: "#dbeafe" },
  Processing: { label: "Processing", color: "#b45309", bg: "#fef3c7" },
  Shipped:    { label: "Shipped",    color: "#1e40af", bg: "#dbeafe" },
  Delivered:  { label: "Delivered",  color: "#065f46", bg: "#d1fae5" },
  Cancelled:  { label: "Cancelled",  color: "#991b1b", bg: "#fee2e2" },
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(r => r.json())
      .then((d: DashboardData) => { if (typeof d?.totalRevenue === "number") setData(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Revenue", value: data ? `$${(data.totalRevenue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—", sub: "All time" },
    { label: "Total Orders",  value: data ? String(data.totalOrders ?? 0) : "—",   sub: "All time" },
    { label: "Total Products",value: data ? String(data.totalProducts ?? 0) : "—", sub: "In catalogue" },
    { label: "New Customers", value: data ? String(data.newCustomers ?? 0) : "—",  sub: "This month" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      style={{ padding: "40px 40px 60px", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ marginBottom: "36px" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "8px" }}>Dashboard</div>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "40px", fontWeight: 300, color: "#0a0a0a" }}>
          Good morning, <em>Admin</em>
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "32px" }}>
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.07 }}
            style={{ background: "#fff", padding: "28px 24px", borderBottom: "3px solid #c9a96e", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: "12px" }}>{stat.label}</div>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "36px", fontWeight: 300, color: "#0a0a0a", marginBottom: "6px" }}>
              {loading ? <span style={{ display: "inline-block", width: 80, height: 32, background: "#ece9e3", borderRadius: 4 }} /> : stat.value}
            </div>
            <div style={{ fontSize: "11px", color: "#8a8680" }}>{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px", alignItems: "start" }}>

        {/* Recent Orders */}
        <div style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 28px", borderBottom: "0.5px solid rgba(0,0,0,0.07)" }}>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", fontWeight: 300 }}>Recent Orders</div>
            <Link href="/admin/orders" style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", border: "0.5px solid rgba(0,0,0,0.2)", padding: "8px 16px", textDecoration: "none", color: "#0a0a0a", transition: "all 0.2s" }}>
              View All
            </Link>
          </div>
          {loading ? (
            <div style={{ padding: "28px" }}>
              {[...Array(4)].map((_, i) => <div key={i} style={{ height: 48, background: "#ece9e3", borderRadius: 4, marginBottom: 10 }} />)}
            </div>
          ) : !(data?.recentOrders?.length) ? (
            <div style={{ padding: "60px 28px", textAlign: "center", color: "#8a8680" }}>
              <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", marginBottom: 8 }}>No orders yet</div>
              <p style={{ fontSize: "13px" }}>Orders will appear here once customers checkout.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "0.5px solid rgba(0,0,0,0.07)" }}>
                    {["Order", "Customer", "Total", "Status", "Date"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 16px 12px 28px", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentOrders ?? []).map(order => {
                    const cfg = S[order.status] ?? S.pending;
                    return (
                      <tr key={order._id} style={{ borderBottom: "0.5px solid rgba(0,0,0,0.04)" }}>
                        <td style={{ padding: "16px 16px 16px 28px", fontFamily: "monospace", fontSize: "12px", color: "#c9a96e" }}>{order.orderNumber}</td>
                        <td style={{ padding: "16px", fontSize: "13px" }}>{order.customer?.name ?? order.customer?.email ?? "—"}</td>
                        <td style={{ padding: "16px", fontSize: "13px", fontWeight: 500 }}>${order.total.toFixed(2)}</td>
                        <td style={{ padding: "16px" }}>
                          <span style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, padding: "4px 10px", borderRadius: 100, color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                        </td>
                        <td style={{ padding: "16px", fontSize: "12px", color: "#8a8680" }}>
                          {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Quick Actions */}
          <div style={{ background: "#fff", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "20px", fontWeight: 300, marginBottom: "18px" }}>Quick Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/admin/products/new" style={{ display: "flex", alignItems: "center", gap: "8px", background: "#c9a96e", color: "#0a0a0a", padding: "12px 16px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Add New Product
              </Link>
              <Link href="/admin/orders" style={{ display: "flex", alignItems: "center", gap: "8px", border: "0.5px solid rgba(0,0,0,0.2)", color: "#0a0a0a", padding: "12px 16px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /></svg>
                View Orders
              </Link>
            </div>
          </div>

          {/* Low Stock */}
          <div style={{ background: "#fff", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "20px", fontWeight: 300, marginBottom: "18px" }}>Low Stock Alerts</div>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[...Array(3)].map((_, i) => <div key={i} style={{ height: 44, background: "#ece9e3", borderRadius: 4 }} />)}
              </div>
            ) : !(data?.lowStock?.length) ? (
              <p style={{ fontSize: "13px", color: "#8a8680" }}>All products are well stocked.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(data?.lowStock ?? []).map(p => (
                  <Link key={p._id} href={`/admin/products/${p._id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", background: "#fffbeb", border: "0.5px solid rgba(245,158,11,0.25)", textDecoration: "none" }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "#0a0a0a" }}>{p.name}</div>
                      <div style={{ fontSize: "11px", color: "#8a8680", marginTop: 2 }}>${p.price}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#92400e" }}>{p.stockCount} left</div>
                      <div style={{ fontSize: "10px", color: "#b45309", textTransform: "uppercase", letterSpacing: "0.05em" }}>Low</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
