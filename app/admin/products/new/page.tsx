"use client";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { ProductSection } from "@/lib/types";

const SECTIONS = [
  { id: "collection" as ProductSection, label: "Collection", desc: "Main catalogue", emoji: "📁" },
  { id: "new_arrival" as ProductSection, label: "New Arrival", desc: "Latest drops", emoji: "✨" },
  { id: "sale" as ProductSection, label: "Sale", desc: "Discounted items", emoji: "🏷️" },
];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const CATS = ["Clothing", "Accessories", "Home", "Shoes", "Bags"];

interface Img { preview: string; url: string; uploading: boolean; error: boolean; }

const inp: React.CSSProperties = { width: "100%", border: "0.5px solid rgba(0,0,0,0.15)", padding: "13px 14px", fontSize: "14px", outline: "none", fontFamily: "DM Sans, sans-serif", background: "#fafaf8", color: "#0a0a0a" };
const inpErr: React.CSSProperties = { ...inp, borderColor: "#c0392b" };
const card: React.CSSProperties = { background: "#fff", padding: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 };
const label: React.CSSProperties = { fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginBottom: "16px", display: "block" };

export default function AddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", price: "", originalPrice: "", stockCount: "0", inStock: true, category: "Clothing", sizes: [] as string[], colors: [] as string[], colorInput: "", section: "" as ProductSection | "" });
  const [images, setImages] = useState<Img[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState({ show: false, message: "", ok: true });
  const [dragging, setDragging] = useState(false);

  const showToast = (message: string, ok = true) => { setToast({ show: true, message, ok }); setTimeout(() => setToast(t => ({ ...t, show: false })), 3500); };

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("image", file);

    // POST to local Next.js API route — Node.js writes directly to disk.
    // Same origin → no CORS, no service worker, no proxy needed.
    const res = await fetch("/api/upload", { method: "POST", body: fd });

    const text = await res.text();
    let json: Record<string, unknown> = {};
    try {
      json = JSON.parse(text);
    } catch {
      console.error("Upload non-JSON response:", text.slice(0, 300));
      throw new Error("Server error — check Next.js terminal");
    }

    if (!res.ok) {
      throw new Error((json.message as string) || `Upload failed (${res.status})`);
    }

    const url = json.url as string | undefined;
    if (!url) throw new Error("Upload succeeded but no URL returned");

    return url;
  }, []);


  const addFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    const toAdd = Array.from(files).slice(0, 5 - images.length);
    if (!toAdd.length) return;

    // Use the blob preview URL as a stable identity key (avoids stale index closures)
    const newItems: Img[] = toAdd.map(f => ({
      preview: URL.createObjectURL(f),
      url: "",
      uploading: true,
      error: false,
    }));

    setImages(prev => [...prev, ...newItems]);

    await Promise.all(toAdd.map(async (file, i) => {
      const previewKey = newItems[i].preview; // stable identity for this file
      try {
        const url = await uploadFile(file);
        setImages(prev => prev.map(img =>
          img.preview === previewKey ? { ...img, url, uploading: false, error: false } : img
        ));
      } catch (err) {
        console.error("Upload error:", err);
        setImages(prev => prev.map(img =>
          img.preview === previewKey ? { ...img, uploading: false, error: true } : img
        ));
      }
    }));
  }, [images.length, uploadFile]);


  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.price || Number(form.price) <= 0) e.price = "Required";
    if (!form.section) e.section = "Please select a section";
    if (!images.filter(i => i.url).length) e.images = "At least one image required";
    setErrors(e); return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const urls = images.filter(i => i.url).map(i => i.url);
      // Use /backend/* — same-origin, routes through Node.js to Laravel (SW-safe)
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, description: form.description,
          price: Number(form.price),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
          category: form.category, section: form.section,
          sizes: form.sizes, colors: form.colors,
          stockCount: Number(form.stockCount), inStock: form.inStock,
          images: urls, image: urls[0] ?? "",
          badge: form.section === "sale" ? "sale" : form.section === "new_arrival" ? "new" : null,
        }),
      });
      const saved = await res.json();
      if (res.ok && (saved.id || saved._id)) {
        showToast("Product saved!");
        setTimeout(() => router.push("/admin/products"), 1200);
      } else {
        console.error("Save failed:", saved);
        showToast(saved.message || "Failed to save", false);
      }
    } catch (e) { console.error(e); showToast("An error occurred", false); }
    finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ padding: "40px 40px 80px", minHeight: "100vh" }}>
      <div style={{ marginBottom: 32 }}>
        <Link href="/admin/products" style={{ fontSize: "12px", color: "#8a8680", textDecoration: "none", letterSpacing: "0.06em" }}>← Back to Products</Link>
        <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginTop: 16, marginBottom: 8 }}>Products</div>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "40px", fontWeight: 300, color: "#0a0a0a" }}>Add New <em>Product</em></h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "24px", alignItems: "start" }}>
        {/* Left */}
        <div>
          {/* Images */}
          <div style={card}>
            <span style={label}>Product Images {images.length}/5</span>
            {images.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
                {images.map((img, i) => (
                  <div key={img.preview} style={{ position: "relative", aspectRatio: "1", background: "#f5f2ec", overflow: "hidden" }}>
                    {img.preview && <Image src={img.preview} alt="" fill style={{ objectFit: "cover", zIndex: 0 }} unoptimized />}

                    {/* Uploading spinner */}
                    {img.uploading && (
                      <div style={{ position: "absolute", inset: 0, zIndex: 2, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 22, height: 22, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      </div>
                    )}

                    {/* Failed overlay */}
                    {img.error && (
                      <div style={{ position: "absolute", inset: 0, zIndex: 2, background: "rgba(192,57,43,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                        <span style={{ color: "white", fontSize: "18px" }}>✕</span>
                        <span style={{ color: "white", fontSize: "10px", letterSpacing: "0.06em" }}>Upload Failed</span>
                      </div>
                    )}

                    {/* Success badge */}
                    {img.url && !img.uploading && !img.error && (
                      <div style={{ position: "absolute", top: 5, left: 5, zIndex: 2, width: 18, height: 18, background: "#16a34a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                      </div>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={() => setImages(p => p.filter(im => im.preview !== img.preview))}
                      style={{ position: "absolute", top: 4, right: 4, zIndex: 3, width: 22, height: 22, background: "rgba(0,0,0,0.7)", color: "white", border: "none", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
            {images.length < 5 && (
              <label onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `2px dashed ${errors.images ? "#c0392b" : dragging ? "#c9a96e" : "rgba(0,0,0,0.15)"}`, padding: "32px 16px", textAlign: "center", background: dragging ? "rgba(201,169,110,0.04)" : "transparent", transition: "all 0.2s" }}>
                <div style={{ fontSize: "28px", marginBottom: 10 }}>📸</div>
                <div style={{ fontSize: "13px", color: "#0a0a0a", marginBottom: 4 }}>Drag & drop images here</div>
                <div style={{ fontSize: "12px", color: "#8a8680", marginBottom: 8 }}>or click to browse</div>
                <div style={{ fontSize: "11px", color: "#8a8680" }}>PNG, JPG · Max 5 images</div>
                <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => addFiles(e.target.files)} />
              </label>
            )}
            {errors.images && <p style={{ fontSize: "11px", color: "#c0392b", marginTop: 8 }}>{errors.images}</p>}
          </div>

          {/* Section */}
          <div style={card}>
            <span style={{ ...label, color: errors.section ? "#c0392b" : "#8a8680" }}>Section {errors.section && `— ${errors.section}`}</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {SECTIONS.map(sec => (
                <button key={sec.id} type="button" onClick={() => { setForm(p => ({ ...p, section: sec.id })); setErrors(e => ({ ...e, section: "" })); }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "16px 8px", border: `2px solid ${form.section === sec.id ? "#c9a96e" : "rgba(0,0,0,0.12)"}`, background: form.section === sec.id ? "rgba(201,169,110,0.06)" : "transparent", transition: "all 0.2s" }}>
                  <span style={{ fontSize: "24px" }}>{sec.emoji}</span>
                  <div style={{ fontSize: "11px", fontWeight: 500, color: "#0a0a0a" }}>{sec.label}</div>
                  <div style={{ fontSize: "10px", color: "#8a8680" }}>{sec.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div>
          {/* Basic Info */}
          <div style={card}>
            <span style={label}>Basic Information</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <input placeholder="Product Name *" value={form.name} onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setErrors(er => ({ ...er, name: "" })); }} style={errors.name ? inpErr : inp} />
                {errors.name && <p style={{ fontSize: "11px", color: "#c0392b", marginTop: 4 }}>{errors.name}</p>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <input type="number" placeholder="Price ($) *" value={form.price} min="0" step="0.01" onChange={e => { setForm(p => ({ ...p, price: e.target.value })); setErrors(er => ({ ...er, price: "" })); }} style={errors.price ? inpErr : inp} />
                  {errors.price && <p style={{ fontSize: "11px", color: "#c0392b", marginTop: 4 }}>{errors.price}</p>}
                </div>
                <input type="number" placeholder="Original Price ($)" value={form.originalPrice} min="0" step="0.01" onChange={e => setForm(p => ({ ...p, originalPrice: e.target.value }))} style={inp} />
              </div>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ ...inp, appearance: "none" as const }}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={card}>
            <span style={label}>Description</span>
            <textarea placeholder="Product description…" value={form.description} rows={4} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} style={{ ...inp, resize: "vertical" as const }} />
          </div>

          <div style={card}>
            <span style={label}>Inventory</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input type="number" placeholder="Stock Count" value={form.stockCount} min="0" onChange={e => setForm(p => ({ ...p, stockCount: e.target.value }))} style={inp} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "0.5px solid rgba(0,0,0,0.15)", padding: "13px 14px", background: "#fafaf8" }}>
                <span style={{ fontSize: "13px" }}>In Stock</span>
                <button type="button" onClick={() => setForm(p => ({ ...p, inStock: !p.inStock }))}
                  style={{ width: 44, height: 24, borderRadius: 12, background: form.inStock ? "#c9a96e" : "rgba(0,0,0,0.15)", border: "none", position: "relative", transition: "background 0.2s" }}>
                  <span style={{ position: "absolute", top: 2, left: 2, width: 20, height: 20, background: "white", borderRadius: "50%", transition: "transform 0.2s", transform: form.inStock ? "translateX(20px)" : "none", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </button>
              </div>
            </div>
          </div>

          <div style={card}>
            <span style={label}>Sizes</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SIZES.map(size => (
                <button key={size} type="button" onClick={() => setForm(p => ({ ...p, sizes: p.sizes.includes(size) ? p.sizes.filter(s => s !== size) : [...p.sizes, size] }))}
                  style={{ padding: "8px 14px", fontSize: "12px", border: `${form.sizes.includes(size) ? "1px solid #0a0a0a" : "0.5px solid rgba(0,0,0,0.2)"}`, background: form.sizes.includes(size) ? "#0a0a0a" : "transparent", color: form.sizes.includes(size) ? "#fafaf8" : "#0a0a0a", transition: "all 0.15s" }}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div style={card}>
            <span style={label}>Colors</span>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input placeholder="Add color (e.g. Ivory)" value={form.colorInput} onChange={e => setForm(p => ({ ...p, colorInput: e.target.value }))} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const c = form.colorInput.trim(); if (c && !form.colors.includes(c)) setForm(p => ({ ...p, colors: [...p.colors, c], colorInput: "" })); } }}
                style={{ ...inp, flex: 1 }} />
              <button type="button" onClick={() => { const c = form.colorInput.trim(); if (c && !form.colors.includes(c)) setForm(p => ({ ...p, colors: [...p.colors, c], colorInput: "" })); }}
                style={{ padding: "0 20px", background: "#0a0a0a", color: "#fafaf8", border: "none", fontSize: "12px", letterSpacing: "0.06em" }}>Add</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {form.colors.map(c => (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 6, background: "#f5f2ec", padding: "6px 10px", fontSize: "12px" }}>
                  {c}
                  <button onClick={() => setForm(p => ({ ...p, colors: p.colors.filter(x => x !== c) }))} style={{ background: "none", border: "none", color: "#8a8680", fontSize: "14px", lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
            <Link href="/admin/products" style={{ padding: "13px 28px", border: "0.5px solid rgba(0,0,0,0.2)", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", color: "#0a0a0a" }}>Cancel</Link>
            <button onClick={handleSubmit} disabled={saving} style={{ padding: "13px 40px", background: "#0a0a0a", color: "#fafaf8", border: "none", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving…" : "Save Product"}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ position: "fixed", bottom: 32, left: "50%", transform: `translateX(-50%) translateY(${toast.show ? 0 : 16}px)`, background: toast.ok ? "#0a0a0a" : "#c0392b", color: "#fafaf8", padding: "12px 24px", fontSize: "12px", letterSpacing: "0.05em", zIndex: 400, opacity: toast.show ? 1 : 0, transition: "all 0.3s", pointerEvents: "none", whiteSpace: "nowrap" }}>
        {toast.ok ? "✓ " : "✕ "}{toast.message}
      </div>
    </motion.div>
  );
}

