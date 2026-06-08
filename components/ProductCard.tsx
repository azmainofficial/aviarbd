// components/ProductCard.tsx
"use client";
import { useState, memo, type MouseEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/context/WishlistContext";
import { resolveMediaUrl } from "@/lib/api";

export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  icon?: string;
  category: string;
  badge?: "new" | "sale";
  slug?: string;
};

type ProductCardProps = {
  product: Product;
  onAddToCart: (product: Product) => void;
  priority?: boolean;
};

const ProductCard = memo(function ProductCard({ product, onAddToCart, priority }: ProductCardProps) {
  const [imgHovered, setImgHovered] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const inWishlist = isInWishlist(product.id);
  const slug = product.slug || product.name.toLowerCase().replace(/\s+/g, "-");
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleWishlist = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      slug,
      icon: product.icon || "🛍️",
    });
  };

  const handleAddToCart = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  };

  const handleBuyNow = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
    router.push("/checkout");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: "100%",
        borderRadius: "20px",
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "DM Sans, sans-serif",
        position: "relative",
      }}
    >
      {/* ── Image Area ── */}
      <Link
        href={`/product/?slug=${slug}`}
        style={{ display: "block", position: "relative", textDecoration: "none" }}
        aria-label={`View ${product.name}`}
        onMouseEnter={() => setImgHovered(true)}
        onMouseLeave={() => setImgHovered(false)}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 1",
            background: "linear-gradient(145deg, #f9f5f0 0%, #ede8df 100%)",
            overflow: "hidden",
          }}
        >
          {product.image ? (
            <Image
              src={resolveMediaUrl(product.image)}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
              style={{
                objectFit: "cover",
                transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                transform: imgHovered ? "scale(1.07)" : "scale(1)",
              }}
              priority={priority}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "64px",
                transition: "transform 0.5s ease",
                transform: imgHovered ? "scale(1.1)" : "scale(1)",
              }}
            >
              {product.icon}
            </div>
          )}

          {/* Overlay on hover (desktop) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.12)",
              opacity: imgHovered ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          />
        </div>

        {/* Badge */}
        {product.badge && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: product.badge === "sale" ? "#c0392b" : "#0a0a0a",
              color: "#fff",
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: "100px",
            }}
          >
            {product.badge === "sale" && discount ? `-${discount}%` : product.badge}
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: inWishlist ? "#c0392b" : "rgba(255,255,255,0.85)",
            backdropFilter: "blur(6px)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            cursor: "pointer",
            color: inWishlist ? "#fff" : "#333",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            transition: "all 0.2s ease",
            zIndex: 10,
          }}
        >
          {inWishlist ? "♥" : "♡"}
        </button>
      </Link>

      {/* ── Info Area ── */}
      <div style={{ padding: "14px 14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>

        {/* Category + Name + Price */}
        <div>
          <p style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa", margin: "0 0 4px" }}>
            {product.category}
          </p>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
            <Link
              href={`/product/?slug=${slug}`}
              style={{ textDecoration: "none", flex: 1, minWidth: 0 }}
            >
              <h3
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#1a1a1a",
                  margin: 0,
                  lineHeight: 1.25,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {product.name}
              </h3>
            </Link>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1a1a" }}>
                ৳{product.price}
              </div>
              {product.originalPrice && (
                <div style={{ fontSize: "11px", textDecoration: "line-through", color: "#bbb" }}>
                  ৳{product.originalPrice}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleAddToCart}
            style={{
              flex: 1,
              background: "#0a0a0a",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "10px 6px",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "DM Sans, sans-serif",
              transition: "background 0.2s ease, transform 0.15s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#2a2a2a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#0a0a0a"; }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
            Add
          </button>

          <button
            onClick={handleBuyNow}
            style={{
              flex: 1,
              background: "linear-gradient(135deg, #c9a96e 0%, #b8924a 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "10px 6px",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "DM Sans, sans-serif",
              transition: "filter 0.2s ease, transform 0.15s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 12 19 12" /><polyline points="13 6 19 12 13 18" /></svg>
            Buy
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export default ProductCard;
