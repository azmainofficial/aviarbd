// components/Products.tsx
"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import ProductCard, { Product } from "./ProductCard";
import { useCart } from "@/context/CartContext";
import { fetchAPI } from "@/lib/api";

const SAMPLE_PRODUCTS: Product[] = [
  { id: "1", name: "Silk Wrap Blouse", price: 295, icon: "👚", category: "Clothing", badge: "new", slug: "silk-wrap-blouse" },
  { id: "2", name: "Cashmere Turtleneck", price: 450, icon: "🧥", category: "Clothing", slug: "cashmere-turtleneck" },
  { id: "3", name: "Leather Crossbody", price: 320, originalPrice: 400, icon: "👜", category: "Accessories", badge: "sale", slug: "leather-crossbody" },
  { id: "4", name: "Tailored Trousers", price: 250, icon: "👖", category: "Clothing", slug: "tailored-trousers" },
  { id: "5", name: "Gold Plated Cuff", price: 180, icon: "✨", category: "Accessories", slug: "gold-plated-cuff" },
  { id: "6", name: "Ceramic Vase", price: 120, icon: "🏺", category: "Home", badge: "new", slug: "ceramic-vase" },
  { id: "7", name: "Linen Lounge Set", price: 210, icon: "👘", category: "Clothing", slug: "linen-lounge-set" },
  { id: "8", name: "Woven Sun Hat", price: 95, originalPrice: 150, icon: "👒", category: "Accessories", badge: "sale", slug: "woven-sun-hat" },
];

const TABS = ["All", "Clothing", "Accessories", "Home"];
const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
  { label: "Sale", value: "sale" },
];

function ProductSkeleton() {
  return (
    <div style={{ background: "white" }}>
      <div className="skeleton" style={{ aspectRatio: "3/4", width: "100%" }} />
      <div style={{ padding: "16px 20px" }}>
        <div className="skeleton" style={{ height: "18px", width: "70%", marginBottom: "8px", borderRadius: "2px" }} />
        <div className="skeleton" style={{ height: "13px", width: "40%", borderRadius: "2px" }} />
      </div>
    </div>
  );
}

interface ProductsProps {
  /** If true, renders as the full shop page with filter sidebar */
  shopMode?: boolean;
  initialFilter?: string;
}

export default function Products({ shopMode = false, initialFilter }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [sort, setSort] = useState(initialFilter === "new" ? "newest" : "featured");
  const [showSaleOnly, setShowSaleOnly] = useState(initialFilter === "sale");
  const [cols, setCols] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);

  // JS-based responsive columns (works reliably with Turbopack)
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCols(w < 640 ? 2 : w < 1024 ? 3 : w < 1280 ? 4 : 4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    // Reset defaults first
    setSort("featured");
    setShowSaleOnly(false);
    setActiveTab("All");

    if (initialFilter === "new") {
      setSort("newest");
    } else if (initialFilter === "sale") {
      setShowSaleOnly(true);
    } else if (initialFilter === "clothing") {
      setActiveTab("Clothing");
    } else if (initialFilter === "accessories") {
      setActiveTab("Accessories");
    } else if (initialFilter === "home") {
      setActiveTab("Home");
    }
  }, [initialFilter]);
  const [toast, setToast] = useState({ show: false, message: "" });
  const { addToCart, openCart } = useCart();

  // Fetch from MongoDB, fall back to sample data
  useEffect(() => {
    let cancelled = false;
    fetchAPI("/products")
      .then((r) => r.json())
      .then((data: unknown) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          const mapped = (data as Record<string, unknown>[]).map((p) => {
            const images = Array.isArray(p.images) ? (p.images as string[]) : [];
            return {
              id: String(p._id ?? p.id ?? ""),
              name: String(p.name ?? ""),
              price: Number(p.price ?? 0),
              originalPrice: p.originalPrice != null ? Number(p.originalPrice) : undefined,
              image: images[0] ?? (p.image ? String(p.image) : undefined),
              icon: p.icon ? String(p.icon) : "🛍️",
              category: String(p.category ?? ""),
              badge: (p.badge as Product["badge"]) ?? undefined,
              slug: String(p.slug ?? p.name),
            };
          });
          setProducts(mapped);
        } else {
          setProducts(SAMPLE_PRODUCTS);
        }
      })
      .catch(() => {
        if (!cancelled) setProducts(SAMPLE_PRODUCTS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.icon || "",
        category: product.category,
        size: "OS",
        color: "Default",
        qty: 1,
      });
      openCart();
      setToast({ show: true, message: `${product.name} added to cart` });
    },
    [addToCart, openCart]
  );

  useEffect(() => {
    if (toast.show) {
      const t = setTimeout(() => setToast({ show: false, message: "" }), 3000);
      return () => clearTimeout(t);
    }
  }, [toast.show]);

  const filtered = useMemo(() => {
    let list = activeTab === "All" ? products : products.filter((p) => p.category === activeTab);
    if (showSaleOnly) list = list.filter((p) => p.badge === "sale");
    switch (sort) {
      case "price-asc": return [...list].sort((a, b) => a.price - b.price);
      case "price-desc": return [...list].sort((a, b) => b.price - a.price);
      case "newest": return [...list].sort((a) => (a.badge === "new" ? -1 : 1));
      case "sale": return [...list].sort((a) => (a.badge === "sale" ? -1 : 1));
      default: return list;
    }
  }, [products, activeTab, sort, showSaleOnly]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, sort, showSaleOnly]);

  const itemsPerPage = shopMode ? 8 : 8;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProducts = shopMode ? filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : filtered.slice(0, 8);

  const skeletonCount = shopMode ? itemsPerPage : 8;

  return (
    <section
      style={{
        background: "#f5f2ec",
        position: "relative",
        width: "100%",
        padding: cols <= 2 ? (shopMode ? "40px 20px" : "44px 20px") : (shopMode ? "60px max(20px, 5vw)" : "80px max(20px, 5vw)"),
      }}
    >
      <div style={{ maxWidth: "1440px", margin: "0 auto" }}>

        {/* Header */}
        {!shopMode && (
          <div style={{ textAlign: "center", marginBottom: cols <= 2 ? "28px" : "48px" }}>
            <div style={{ color: "#c9a96e", fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "12px" }}>
              The Collection
            </div>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 300, fontSize: "clamp(32px,4vw,56px)", color: "#0a0a0a", lineHeight: 1.1 }}>
              Seasonal <em>Picks</em>
            </h2>
          </div>
        )}

        {/* Toolbar: tabs + sort */}
        <div
          style={{
            display: "flex",
            alignItems: cols <= 2 ? "stretch" : "center",
            flexDirection: cols <= 2 ? "column" : "row",
            justifyContent: "space-between",
            marginBottom: "32px",
            flexWrap: "wrap",
            gap: "12px",
            borderBottom: "0.5px solid rgba(0,0,0,0.1)",
            paddingBottom: "16px",
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: "flex", gap: "0", ...(cols <= 2 ? { overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" } : {}) }}>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px 20px",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: activeTab === tab ? "#0a0a0a" : "#8a8680",
                  borderBottom: activeTab === tab ? "1.5px solid #0a0a0a" : "1.5px solid transparent",
                  marginBottom: cols <= 2 ? "0px" : "-17px",
                  transition: "color 0.2s",
                  fontFamily: "DM Sans, sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sort + Filters */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Sale toggle */}
            <button
              onClick={() => setShowSaleOnly(!showSaleOnly)}
              style={{
                padding: "8px 16px",
                fontSize: "11px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: showSaleOnly ? "#c0392b" : "none",
                color: showSaleOnly ? "white" : "#8a8680",
                border: "0.5px solid " + (showSaleOnly ? "#c0392b" : "rgba(0,0,0,0.15)"),
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Sale only
            </button>

            {/* Sort dropdown */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "11px",
                letterSpacing: "0.06em",
                color: "#8a8680",
                cursor: "pointer",
                outline: "none",
                fontFamily: "DM Sans, sans-serif",
                appearance: "none",
                paddingRight: "28px",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238a8680'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Count */}
        {!loading && (
          <div style={{ fontSize: "11px", color: "#8a8680", marginBottom: "24px", letterSpacing: "0.06em" }}>
            {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
          </div>
        )}

        {/* Product Grid */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: cols <= 2 ? 12 : 16 }}>
          {loading
            ? Array.from({ length: skeletonCount }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))
            : paginatedProducts.length === 0
              ? (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "80px 0", color: "#8a8680" }}>
                  <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔍</div>
                  <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "24px", marginBottom: "8px" }}>No pieces found</div>
                  <p style={{ fontSize: "13px" }}>Try adjusting your filters</p>
                </div>
              )
              : paginatedProducts.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  priority={idx < 2}
                />
              ))}
        </div>

        {/* Pagination */}
        {shopMode && totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "48px", gap: "16px" }}>
            <button
              onClick={() => {
                setCurrentPage(p => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={currentPage === 1}
              style={{
                padding: "10px 20px", border: "0.5px solid rgba(0,0,0,0.15)", background: "none",
                cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.3 : 1,
                fontFamily: "DM Sans, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { if (currentPage > 1) { e.currentTarget.style.background = "#0a0a0a"; e.currentTarget.style.color = "#fafaf8"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#0a0a0a"; }}
            >
              Prev
            </button>
            <span style={{ fontSize: "12px", color: "#8a8680", fontFamily: "DM Sans, sans-serif", letterSpacing: "0.08em" }}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => {
                setCurrentPage(p => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={currentPage === totalPages}
              style={{
                padding: "10px 20px", border: "0.5px solid rgba(0,0,0,0.15)", background: "none",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.3 : 1,
                fontFamily: "DM Sans, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { if (currentPage < totalPages) { e.currentTarget.style.background = "#0a0a0a"; e.currentTarget.style.color = "#fafaf8"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#0a0a0a"; }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      <div
        style={{
          position: "fixed",
          bottom: "32px",
          left: "50%",
          transform: `translateX(-50%) translateY(${toast.show ? "0" : "20px"})`,
          background: "#0a0a0a",
          color: "#fafaf8",
          padding: "12px 24px",
          fontSize: "12px",
          letterSpacing: "0.05em",
          zIndex: 400,
          opacity: toast.show ? 1 : 0,
          transition: "all 0.3s ease",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        ✓ {toast.message}
      </div>
    </section>
  );
}
