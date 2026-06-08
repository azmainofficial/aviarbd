"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { apiUrl } from "@/lib/api";


interface Customer {
  id: number | null;
  email: string;
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  lastOrder: string | null;
  location: string;
  type: "registered" | "guest";
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "registered" | "guest">("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  useEffect(() => {
    fetch(apiUrl("/admin/customers"), { headers: { Accept: "application/json" } })

      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: any[]) => {
        if (Array.isArray(data)) setCustomers(data);
        else throw new Error("Unexpected response format");
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = customers;
    if (typeFilter !== "all") list = list.filter(c => c.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    }
    return list;
  }, [customers, search, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const registeredCount = customers.filter(c => c.type === "registered").length;
  const guestCount = customers.filter(c => c.type === "guest").length;

  const stats = [
    { label: "Total", val: customers.length.toString() },
    { label: "Registered", val: registeredCount.toString() },
    { label: "Guest", val: guestCount.toString() },
    { label: "Revenue", val: `৳${totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ padding: "40px 40px 60px", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: 8 }}>CRM</div>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "40px", fontWeight: 300, color: "#0a0a0a" }}>All <em>Customers</em></h1>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: "#fff", padding: "14px 20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", minWidth: 80 }}>
              <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "26px", fontWeight: 300, color: "#0a0a0a" }}>{s.val}</div>
              <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.15em", color: "#8a8680", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, background: "#fff", padding: "12px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <input type="text" placeholder="Search by name or email…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ width: "100%", border: "none", fontSize: "13px", outline: "none", fontFamily: "DM Sans, sans-serif", background: "transparent" }} />
        </div>
        <div style={{ display: "flex", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {(["all", "registered", "guest"] as const).map(t => (
            <button key={t} onClick={() => { setTypeFilter(t); setPage(1); }}
              style={{
                padding: "12px 18px", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", border: "none", cursor: "pointer", fontFamily: "DM Sans, sans-serif",
                background: typeFilter === t ? "#0a0a0a" : "transparent",
                color: typeFilter === t ? "#fff" : "#8a8680",
                transition: "all 0.2s",
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: "11px", color: "#8a8680", marginBottom: 12 }}>{filtered.length} {filtered.length === 1 ? "customer" : "customers"}</div>

      {error && (
        <div style={{ padding: "16px 20px", background: "#fef2f2", color: "#991b1b", fontSize: "13px", marginBottom: 16, border: "1px solid #fecaca" }}>
          Failed to load customers: {error}. Make sure the server has the latest PHP files deployed and migrations have been run (<code>php artisan migrate</code>).
        </div>
      )}

      <div style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 10 }}>
            {[...Array(6)].map((_, i) => <div key={i} style={{ height: 52, background: "#ece9e3", borderRadius: 4 }} />)}
          </div>
        ) : paginated.length === 0 ? (
          <div style={{ padding: "60px 28px", textAlign: "center", color: "#8a8680" }}>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", marginBottom: 8 }}>No customers yet</div>
            <p style={{ fontSize: "13px" }}>Customers appear here once they register an account or place an order.</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", background: "#fafaf8" }}>
                    {["Customer", "Phone", "Location", "Type", "Orders", "Total Spent", "Last Order"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "14px 16px", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", fontWeight: 400, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(c => (
                    <tr key={c.email} style={{ borderBottom: "0.5px solid rgba(0,0,0,0.05)" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                            background: c.type === "registered" ? "rgba(201,169,110,0.12)" : "rgba(0,0,0,0.05)",
                            border: `1px solid ${c.type === "registered" ? "rgba(201,169,110,0.3)" : "rgba(0,0,0,0.1)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center"
                          }}>
                            <span style={{ color: c.type === "registered" ? "#c9a96e" : "#8a8680", fontSize: "13px", fontWeight: 600 }}>
                              {c.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 500 }}>{c.name}</div>
                            <div style={{ fontSize: "11px", color: "#8a8680" }}>{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "12px", color: "#8a8680", whiteSpace: "nowrap" }}>{c.phone || "—"}</td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#8a8680", whiteSpace: "nowrap" }}>{c.location || "—"}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 100,
                          background: c.type === "registered" ? "rgba(201,169,110,0.15)" : "rgba(0,0,0,0.06)",
                          color: c.type === "registered" ? "#b8813c" : "#6b6560"
                        }}>
                          {c.type}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, background: "#0a0a0a", color: "#fafaf8", fontSize: "12px", fontWeight: 600 }}>{c.orderCount}</span>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" }}>৳{c.totalSpent.toFixed(2)}</td>
                      <td style={{ padding: "14px 16px", fontSize: "12px", color: "#8a8680", whiteSpace: "nowrap" }}>
                        {c.lastOrder ? new Date(c.lastOrder).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderTop: "0.5px solid rgba(0,0,0,0.07)" }}>
                <span style={{ fontSize: "12px", color: "#8a8680" }}>Page {page} of {totalPages}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "8px 16px", fontSize: "11px", border: "0.5px solid rgba(0,0,0,0.2)", background: "transparent", opacity: page === 1 ? 0.4 : 1, cursor: "pointer" }}>← Prev</button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "8px 16px", fontSize: "11px", border: "0.5px solid rgba(0,0,0,0.2)", background: "transparent", opacity: page === totalPages ? 0.4 : 1, cursor: "pointer" }}>Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
