"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { apiUrl } from "@/lib/api";


interface HeroSlide {
  id: number;
  image: string;
  label: string;
  headline: string;
  sub: string;
  cta: string;
  href: string;
  accent: string;
  is_active: boolean;
  order_index: number;
}

export default function AdminHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // new slide form
  const [showForm, setShowForm] = useState(false);
  const [slideType, setSlideType] = useState<"custom" | "product">("custom");
  const [imageSource, setImageSource] = useState<"url" | "upload">("url");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [form, setForm] = useState<Partial<HeroSlide>>({
    image: "", label: "New Arrival", headline: "", sub: "", cta: "Shop Now", href: "/shop", accent: "#c9a96e", is_active: true, order_index: 0
  });

  const fetchSlides = async () => {
    try {
      const res = await fetch(apiUrl("/admin/hero-slides"));

      if (res.ok) {
        setSlides(await res.json());
      }
      const prodRes = await fetch(apiUrl("/admin/products"));

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(Array.isArray(prodData) ? prodData : (prodData.data ?? []));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlides(); }, []);

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setSelectedProduct(pId);
    const p = products.find(x => String(x.id ?? x._id) === pId);
    if (p) {
      const img = Array.isArray(p.images) && p.images.length ? p.images[0] : (p.image ?? "");
      setForm({
        ...form,
        image: img,
        headline: p.name ?? "",
        sub: p.description ? p.description.substring(0, 100) + "..." : "Premium quality, crafted with care",
        href: `/product/?slug=${p.slug ?? p.id}`,
        label: p.badge === "new" ? "New Arrival" : "Collection",
        cta: "Shop Now"
      });
      setImageSource("url"); // force url mode since we filled it from product
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    try {
      const res = await fetch(apiUrl("/upload"), { method: "POST", body: formData });

      if (res.ok) {
        const data = await res.json();
        setForm({ ...form, image: data.url });
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      alert("Upload error.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(apiUrl("/admin/hero-slides"), {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ image: "", label: "New Arrival", headline: "", sub: "", cta: "Shop Now", href: "/shop", accent: "#c9a96e", is_active: true, order_index: 0 });
        fetchSlides();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;
    await fetch(apiUrl(`/admin/hero-slides/${id}`), { method: "DELETE" });

    fetchSlides();
  };

  const toggleActive = async (slide: HeroSlide) => {
    await fetch(apiUrl(`/admin/hero-slides/${slide.id}`), {

      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !slide.is_active })
    });
    fetchSlides();
  };

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={{ padding: "40px 40px 60px", minHeight: "100vh", background: "#f8f7f5" }}>
      <div style={{ marginBottom: "36px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "8px" }}>Settings</div>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "40px", fontWeight: 300, color: "#0a0a0a" }}>
            Hero Slides
          </h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ background: "#0a0a0a", color: "#fff", border: "none", padding: "12px 24px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
          {showForm ? "Cancel" : "+ Add New Slide"}
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSave}
          style={{ background: "#fff", padding: "30px", marginBottom: "30px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

          <div style={{ gridColumn: "1 / -1", display: "flex", gap: "20px", marginBottom: "10px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "12px", letterSpacing: "0.05em", color: "#8a8680", marginBottom: "8px", textTransform: "uppercase" }}>Slide Type</label>
              <select value={slideType} onChange={e => setSlideType(e.target.value as any)} style={{ width: "100%", padding: "12px", border: "1px solid #e0dfdc" }}>
                <option value="custom">Custom Banner / Scenario</option>
                <option value="product">Auto-link to Product</option>
              </select>
            </div>
            {slideType === "product" && (
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: "12px", letterSpacing: "0.05em", color: "#8a8680", marginBottom: "8px", textTransform: "uppercase" }}>Select Product</label>
                <select value={selectedProduct} onChange={handleProductSelect} style={{ width: "100%", padding: "12px", border: "1px solid #e0dfdc" }}>
                  <option value="">-- Choose a Product --</option>
                  {products.map(p => (
                    <option key={p.id ?? p._id} value={p.id ?? p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <label style={{ fontSize: "12px", letterSpacing: "0.05em", color: "#8a8680", textTransform: "uppercase" }}>Image Source</label>
              <div style={{ display: "flex", gap: "16px" }}>
                <label style={{ fontSize: "12px", color: "#0a0a0a", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input type="radio" checked={imageSource === "url"} onChange={() => setImageSource("url")} /> URL link
                </label>
                <label style={{ fontSize: "12px", color: "#0a0a0a", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <input type="radio" checked={imageSource === "upload"} onChange={() => setImageSource("upload")} /> Upload File
                </label>
              </div>
            </div>
            {imageSource === "url" ? (
              <input required type="text" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="e.g. /images/products/silk-wrap-blouse.png" style={{ width: "100%", padding: "12px", border: "1px solid #e0dfdc" }} />
            ) : (
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: "100%", padding: "9px", border: "1px dashed #c9a96e", background: "#fdfbf8" }} />
                {uploading && <span style={{ fontSize: "12px", color: "#c9a96e", whiteSpace: "nowrap" }}>Uploading...</span>}
                {form.image && imageSource === "upload" && !uploading && <span style={{ fontSize: "12px", color: "#065f46", whiteSpace: "nowrap" }}>Uploaded! ✓</span>}
              </div>
            )}
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", letterSpacing: "0.05em", color: "#8a8680", marginBottom: "8px" }}>Headline</label>
            <input required type="text" value={form.headline} onChange={e => setForm({ ...form, headline: e.target.value })} style={{ width: "100%", padding: "12px", border: "1px solid #e0dfdc" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", letterSpacing: "0.05em", color: "#8a8680", marginBottom: "8px" }}>Subheadline</label>
            <input type="text" value={form.sub} onChange={e => setForm({ ...form, sub: e.target.value })} style={{ width: "100%", padding: "12px", border: "1px solid #e0dfdc" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", letterSpacing: "0.05em", color: "#8a8680", marginBottom: "8px" }}>Label (e.g. New Arrival)</label>
            <input type="text" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} style={{ width: "100%", padding: "12px", border: "1px solid #e0dfdc" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", letterSpacing: "0.05em", color: "#8a8680", marginBottom: "8px" }}>Button Text</label>
            <input type="text" value={form.cta} onChange={e => setForm({ ...form, cta: e.target.value })} style={{ width: "100%", padding: "12px", border: "1px solid #e0dfdc" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", letterSpacing: "0.05em", color: "#8a8680", marginBottom: "8px" }}>Button Link (e.g. /shop)</label>
            <input type="text" value={form.href} onChange={e => setForm({ ...form, href: e.target.value })} style={{ width: "100%", padding: "12px", border: "1px solid #e0dfdc" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", letterSpacing: "0.05em", color: "#8a8680", marginBottom: "8px" }}>Accent Color (Hex)</label>
            <input type="text" value={form.accent} onChange={e => setForm({ ...form, accent: e.target.value })} style={{ width: "100%", padding: "12px", border: "1px solid #e0dfdc" }} />
          </div>

          <div style={{ gridColumn: "1 / -1", marginTop: "10px" }}>
            <button type="submit" disabled={saving} style={{ background: "#c9a96e", color: "#fff", border: "none", padding: "12px 24px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", width: "100%" }}>
              {saving ? "Saving..." : "Save Slide"}
            </button>
          </div>
        </motion.form>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {slides.length === 0 ? (
          <div style={{ padding: "40px", background: "#fff", textAlign: "center", color: "#8a8680", fontSize: "14px" }}>
            No custom slides found. The storefront is currently showing the default static slides.
          </div>
        ) : slides.map(slide => (
          <div key={slide.id} style={{ background: "#fff", padding: "20px", display: "flex", alignItems: "center", gap: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ width: "120px", height: "80px", background: "#ece9e3", flexShrink: 0, position: "relative", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "10px", color: slide.accent, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: "4px" }}>{slide.label}</div>
              <div style={{ fontSize: "18px", fontFamily: "Cormorant Garamond, serif", fontWeight: 600, marginBottom: "4px" }}>{slide.headline}</div>
              <div style={{ fontSize: "13px", color: "#8a8680" }}>{slide.sub}</div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => toggleActive(slide)} style={{ padding: "8px 16px", background: slide.is_active ? "#d1fae5" : "#fee2e2", color: slide.is_active ? "#065f46" : "#991b1b", border: "none", borderRadius: "100px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
                {slide.is_active ? "Active" : "Hidden"}
              </button>
              <button onClick={() => handleDelete(slide.id)} style={{ padding: "8px 16px", background: "transparent", color: "#991b1b", border: "1px solid #fee2e2", borderRadius: "100px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
