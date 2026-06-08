"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import Breadcrumb from "@/components/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(apiUrl("/customers/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data: any = {};
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      login(data.token, data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <main>
        <Navbar />
        <div style={{ height: "72px", background: "#0a0a0a" }} />

        <section style={{ background: "#fafaf8", padding: "60px 20px", minHeight: "70vh" }}>
          <div style={{ maxWidth: "480px", margin: "0 auto" }}>
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Login" }]} />

            <div style={{ background: "#fff", padding: "40px", border: "0.5px solid rgba(0,0,0,0.08)", marginTop: "32px", textAlign: "center" }}>
              <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "40px", color: "#0a0a0a", marginBottom: "8px" }}>Welcome Back</h1>
              <p style={{ fontSize: "14px", color: "#8a8680", marginBottom: "32px" }}>Sign in to access your account and track orders.</p>

              {error && (
                <div style={{ padding: "12px", background: "#fef2f2", color: "#991b1b", fontSize: "13px", marginBottom: "24px", border: "1px solid #fecaca" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a8680", marginBottom: "8px" }}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: "100%", padding: "14px", border: "1px solid rgba(0,0,0,0.15)", background: "#fafaf8", fontSize: "14px", outline: "none", fontFamily: "DM Sans, sans-serif" }}
                  />
                </div>

                <div style={{ marginBottom: "32px" }}>
                  <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a8680", marginBottom: "8px" }}>Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: "100%", padding: "14px", border: "1px solid rgba(0,0,0,0.15)", background: "#fafaf8", fontSize: "14px", outline: "none", fontFamily: "DM Sans, sans-serif" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: "100%", padding: "16px", background: "#0a0a0a", color: "#fff", border: "none", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "opacity 0.2s" }}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>

              <div style={{ marginTop: "24px", fontSize: "13px", color: "#8a8680" }}>
                Don't have an account?{" "}
                <Link href="/register" style={{ color: "#c9a96e", textDecoration: "none" }}>
                  Create one here
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </PageTransition>
  );
}
