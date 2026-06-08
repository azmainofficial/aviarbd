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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(apiUrl("/customers/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(formData),
      });

      let data: any = {};
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        // Laravel validation errors come as { errors: { field: ['msg'] } }
        const firstError = data.errors ? Object.values(data.errors).flat()[0] : null;
        throw new Error((firstError as string) || data.message || "An error occurred during registration");
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
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Create Account" }]} />

            <div style={{ background: "#fff", padding: "40px", border: "0.5px solid rgba(0,0,0,0.08)", marginTop: "32px", textAlign: "center" }}>
              <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "40px", color: "#0a0a0a", marginBottom: "8px" }}>Join Aviar</h1>
              <p style={{ fontSize: "14px", color: "#8a8680", marginBottom: "32px" }}>Create an account to track your orders and save details.</p>

              {error && (
                <div style={{ padding: "12px", background: "#fef2f2", color: "#991b1b", fontSize: "13px", marginBottom: "24px", border: "1px solid #fecaca" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a8680", marginBottom: "8px" }}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "14px", border: "1px solid rgba(0,0,0,0.15)", background: "#fafaf8", fontSize: "14px", outline: "none", fontFamily: "DM Sans, sans-serif" }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a8680", marginBottom: "8px" }}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "14px", border: "1px solid rgba(0,0,0,0.15)", background: "#fafaf8", fontSize: "14px", outline: "none", fontFamily: "DM Sans, sans-serif" }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a8680", marginBottom: "8px" }}>Phone Number (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "14px", border: "1px solid rgba(0,0,0,0.15)", background: "#fafaf8", fontSize: "14px", outline: "none", fontFamily: "DM Sans, sans-serif" }}
                  />
                </div>

                <div style={{ marginBottom: "32px" }}>
                  <label style={{ display: "block", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a8680", marginBottom: "8px" }}>Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "14px", border: "1px solid rgba(0,0,0,0.15)", background: "#fafaf8", fontSize: "14px", outline: "none", fontFamily: "DM Sans, sans-serif" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: "100%", padding: "16px", background: "#0a0a0a", color: "#fff", border: "none", fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "opacity 0.2s" }}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              <div style={{ marginTop: "24px", fontSize: "13px", color: "#8a8680" }}>
                Already have an account?{" "}
                <Link href="/login" style={{ color: "#c9a96e", textDecoration: "none" }}>
                  Sign in here
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
