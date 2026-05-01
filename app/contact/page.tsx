"use client";
import { useState, useEffect, type SyntheticEvent, type CSSProperties } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    border: "0.5px solid rgba(0,0,0,0.15)",
    background: "none",
    fontSize: "14px",
    outline: "none",
    fontFamily: "DM Sans, sans-serif",
    color: "#0a0a0a",
    marginBottom: "16px",
    boxSizing: "border-box",
  };

  return (
    <PageTransition>
      <main>
        <Navbar />
        <div style={{ height: "72px", background: "#0a0a0a" }} />

        <section style={{ background: "#0a0a0a", padding: isDesktop ? "80px 48px" : "56px 20px", textAlign: "center" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "16px" }}>
            Get In Touch
          </div>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(40px,5vw,72px)", fontWeight: 300, color: "#fafaf8", lineHeight: 1.1 }}>
            We&apos;d love to <em>hear from you</em>
          </h1>
        </section>

        <section style={{ background: "#fafaf8", padding: isDesktop ? "120px 48px" : "60px 20px" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: isDesktop ? "80px" : "40px", alignItems: "start" }}>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "24px" }}>
                Contact Information
              </div>
              <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(28px,3vw,48px)", fontWeight: 300, color: "#0a0a0a", marginBottom: "32px", lineHeight: 1.2 }}>
                Let&apos;s start a <em>conversation</em>
              </h2>
              <p style={{ fontSize: "15px", lineHeight: 1.8, color: "#3a3835", marginBottom: "48px" }}>
                Have a question about our products, an order, or just want to say hello? We&apos;re here to help.
              </p>
              {[
                ["Email", "hello@aviarbd.com"],
                ["Phone", "+880 1700 000000"],
                ["Address", "Dhaka, Bangladesh"],
                ["Hours", "Mon–Fri, 9am–6pm BST"],
              ].map(([label, value]) => (
                <div key={label} style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
                  <div style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8680", marginBottom: "6px" }}>{label}</div>
                  <div style={{ fontSize: "15px", color: "#0a0a0a" }}>{value}</div>
                </div>
              ))}
            </div>

            <div>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "80px 40px", border: "0.5px solid rgba(0,0,0,0.08)" }}>
                  <div style={{ fontSize: "32px", marginBottom: "16px" }}>✓</div>
                  <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", fontWeight: 300, marginBottom: "12px" }}>Message Sent</div>
                  <p style={{ fontSize: "14px", color: "#8a8680" }}>We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                  <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr", gap: "16px" }}>
                    <input placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={inputStyle} />
                    <input type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={inputStyle} />
                  </div>
                  <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required style={inputStyle} />
                  <textarea placeholder="Your message..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={6} style={{ ...inputStyle, resize: "vertical" }} />
                  <button type="submit" style={{ width: "100%", background: "#0a0a0a", color: "#fafaf8", border: "none", padding: "16px", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </PageTransition>
  );
}
