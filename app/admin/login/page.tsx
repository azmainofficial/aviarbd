// app/admin/login/page.tsx
"use client";
import { useState, type SyntheticEvent, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function AdminLoginPage() {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/admin/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      // Store token in localStorage for client-side auth checks
      localStorage.setItem("admin_token", data.token);
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <main
      data-admin="true"
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "#0a0a0a",
      }}
    >
      {/* ── Left panel: branding / visual ─────────────────────── */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          background: "linear-gradient(145deg, #111 0%, #1a1712 60%, #2a2318 100%)",
        }}
      >
        {/* Decorative rings */}
        {[560, 400, 260].map((size, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              border: `0.5px solid rgba(201,169,110,${0.06 - i * 0.015})`,
              borderRadius: "50%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              animation: `${i % 2 === 0 ? "rotateCW" : "rotateCCW"} ${30 + i * 10}s linear infinite`,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Gold accent orb */}
        <div style={{
          position: "absolute",
          width: 320,
          height: 320,
          background: "radial-gradient(circle, rgba(201,169,110,0.12) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", letterSpacing: "0.2em", color: "#fafaf8" }}>
              AVIAR
            </div>
            <div style={{ fontSize: "9px", letterSpacing: "0.28em", textTransform: "uppercase", color: "#c9a96e", marginTop: "4px" }}>
              Admin Portal
            </div>
          </Link>
        </div>

        {/* Center quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          style={{ position: "relative", zIndex: 2 }}
        >
          <div style={{ width: "40px", height: "1px", background: "#c9a96e", marginBottom: "24px" }} />
          <p style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "clamp(28px, 3vw, 40px)",
            fontWeight: 300,
            color: "#fafaf8",
            lineHeight: 1.2,
            marginBottom: "16px",
          }}>
            Manage your<br /><em style={{ color: "#c9a96e" }}>collection</em> with<br />confidence.
          </p>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", fontFamily: "DM Sans, sans-serif" }}>
            Products · Orders · Customers · Analytics
          </p>
        </motion.div>

        {/* Bottom note */}
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", fontFamily: "DM Sans, sans-serif", letterSpacing: "0.05em" }}>
          © 2025 AVIAR. All rights reserved.
        </div>

        <style>{`
          @keyframes rotateCW  { to { transform: translate(-50%,-50%) rotate(360deg);  } }
          @keyframes rotateCCW { to { transform: translate(-50%,-50%) rotate(-360deg); } }
        `}</style>
      </div>

      {/* ── Right panel: login form ───────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 32px",
          background: "#fafaf8",
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", maxWidth: "380px" }}
        >
          {/* Header */}
          <div style={{ marginBottom: "40px" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "10px", fontFamily: "DM Sans, sans-serif" }}>
              Welcome back
            </div>
            <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "36px", fontWeight: 300, color: "#0a0a0a", margin: 0 }}>
              Sign in to<br /><em>your dashboard</em>
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Email */}
            <div>
              <label style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#8a8680", display: "block", marginBottom: "8px", fontFamily: "DM Sans, sans-serif" }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@aviar.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  background: "#fff",
                  border: "0.5px solid rgba(0,0,0,0.15)",
                  color: "#0a0a0a",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "DM Sans, sans-serif",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#c9a96e")}
                onBlur={(e)  => (e.target.style.borderColor = "rgba(0,0,0,0.15)")}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#8a8680", display: "block", marginBottom: "8px", fontFamily: "DM Sans, sans-serif" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  style={{
                    width: "100%",
                    padding: "13px 48px 13px 16px",
                    background: "#fff",
                    border: "0.5px solid rgba(0,0,0,0.15)",
                    color: "#0a0a0a",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "DM Sans, sans-serif",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#c9a96e")}
                  onBlur={(e)  => (e.target.style.borderColor = "rgba(0,0,0,0.15)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "#8a8680", fontSize: "14px", padding: "4px",
                  }}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: "12px 16px",
                  background: "rgba(192,57,43,0.08)",
                  border: "0.5px solid rgba(192,57,43,0.25)",
                  color: "#c0392b",
                  fontSize: "12px",
                  fontFamily: "DM Sans, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>⚠</span> {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "8px",
                background: loading ? "#8a8680" : "#0a0a0a",
                color: "#fafaf8",
                border: "none",
                padding: "16px",
                fontSize: "11px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 600,
                transition: "background 0.2s, transform 0.1s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#c9a96e"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#0a0a0a"; }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 14, height: 14,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    display: "inline-block",
                  }} />
                  Signing in…
                </>
              ) : "Sign In →"}
            </button>
          </form>

          {/* Hint */}
          <div style={{ marginTop: "32px", padding: "16px", background: "rgba(0,0,0,0.04)", borderLeft: "2px solid #c9a96e" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a8680", marginBottom: "6px", fontFamily: "DM Sans, sans-serif" }}>
              Default Credentials
            </div>
            <div style={{ fontSize: "12px", color: "#5a5a5a", fontFamily: "DM Sans, sans-serif", lineHeight: 1.8 }}>
              Email: <code style={{ background: "rgba(0,0,0,0.06)", padding: "1px 5px" }}>admin@aviar.com</code><br />
              Pass: <code style={{ background: "rgba(0,0,0,0.06)", padding: "1px 5px" }}>admin123</code>
            </div>
          </div>

          <Link href="/" style={{ display: "block", textAlign: "center", marginTop: "24px", fontSize: "11px", color: "#8a8680", textDecoration: "none", letterSpacing: "0.08em", fontFamily: "DM Sans, sans-serif" }}>
            ← Back to Store
          </Link>
        </motion.div>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          main[data-admin] { grid-template-columns: 1fr !important; }
          main[data-admin] > div:first-child { display: none !important; }
        }
      `}</style>
    </main>
  );
}
