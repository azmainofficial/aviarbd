// components/Hero.tsx
"use client";
import { useRef, useState, useEffect, useMemo } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

type BgProduct = { image: string; name: string; price: number };

const FALLBACK_PRODUCTS: BgProduct[] = [
  { image: "/images/products/silk-wrap-blouse.png", name: "Silk Wrap Blouse", price: 295 },
  { image: "/images/products/cashmere-turtleneck.png", name: "Cashmere Turtleneck", price: 450 },
  { image: "/images/products/leather-crossbody-bag.png", name: "Leather Crossbody", price: 320 },
  { image: "/images/products/tailored-trousers.png", name: "Tailored Trousers", price: 250 },
  { image: "/images/products/woven-sun-hat.png", name: "Woven Sun Hat", price: 95 },
];

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const [dbProducts, setDbProducts] = useState<BgProduct[]>([]);
  const [currentProduct, setCurrentProduct] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);
  const [loading, setLoading] = useState(true);

  const displayProducts = useMemo(() => {
    return dbProducts.length > 0 ? dbProducts : FALLBACK_PRODUCTS;
  }, [dbProducts]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.4], [0, -50]);

  // Fetch real products
  useEffect(() => {
    let cancelled = false;
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data
            .filter((p: any) => (p.images && p.images.length > 0) || p.image)
            .map((p: any) => ({
              image: p.images?.[0] || p.image,
              name: p.name,
              price: p.price,
            }));
          if (mapped.length > 0) setDbProducts(mapped);
        }
      })
      .catch((err) => console.error("Hero fetch error:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProduct((prev) => (prev + 1) % displayProducts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [displayProducts.length]);

  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <section ref={containerRef} style={{ position: "relative", height: isDesktop ? "150vh" : "100vh", width: "100%" }}>
      <div style={{ height: "100vh", position: "sticky", top: 0, overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #0a0a0a 0%, #1c1a17 50%, #2a2520 100%)" }}>

        {/* Background Product Slideshow */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProduct + (loading ? "loading" : "ready")}
              initial={{ opacity: 0, scale: 0.9, filter: "grayscale(100%) brightness(0)" }}
              animate={{ opacity: 0.1, scale: 1, filter: "grayscale(100%) brightness(1.2)" }}
              exit={{ opacity: 0, scale: 1.05, filter: "grayscale(100%) brightness(0.5)" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              style={{ width: "min(800px, 80vw)", height: "min(800px, 80vh)", position: "absolute", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Image
                src={displayProducts[currentProduct].image}
                alt={displayProducts[currentProduct].name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                style={{ objectFit: "contain", userSelect: "none" }}
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Product indicator dots */}
        <div style={{ position: "absolute", bottom: "60px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", zIndex: 10 }}>
          {displayProducts.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentProduct(i)}
              style={{ width: i === currentProduct ? "24px" : "6px", height: "6px", borderRadius: "3px", background: i === currentProduct ? "#c9a96e" : "rgba(255,255,255,0.3)", border: "none", cursor: "pointer", transition: "all 0.3s ease", padding: 0 }}
            />
          ))}
        </div>

        {/* Decorative Circles */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }}>
          <div style={{ width: "min(560px, 90vw)", height: "min(560px, 90vw)", borderRadius: "50%", border: "0.5px solid rgba(201,169,110,0.15)", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", animation: "rotateCW 30s linear infinite" }} />
          <div style={{ width: "min(380px, 62vw)", height: "min(380px, 62vw)", borderRadius: "50%", border: "0.5px solid rgba(201,169,110,0.1)", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", animation: "rotateCCW 20s linear infinite" }} />
        </div>

        {/* Main Content */}
        <motion.div style={{ opacity, y, position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 24px", width: "100%" }}>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{ color: "#c9a96e", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "24px" }}
          >
            New Collection 2025
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 300, color: "#fafaf8", lineHeight: 1, marginBottom: "20px", fontSize: "clamp(52px,8vw,100px)" }}
          >
            Wear the
            <br />
            <em style={{ color: "#e8d5b0" }}>Difference</em>
          </motion.h1>

          {/* Current product name */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProduct + (loading ? "loading-text" : "ready-text")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              style={{ fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}
            >
              {displayProducts[currentProduct].name} — ${displayProducts[currentProduct].price}
            </motion.div>
          </AnimatePresence>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            style={{ fontSize: "14px", fontWeight: 300, color: "rgba(255,255,255,0.5)", marginBottom: "40px", maxWidth: "400px" }}
          >
            Premium clothing crafted for those who demand excellence
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}
          >
            <Link href="/shop" style={{ background: "#c9a96e", color: "#0a0a0a", padding: "14px 32px", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", display: "inline-block", minWidth: isDesktop ? "160px" : "140px", textAlign: "center" }}>
              Shop Collection
            </Link>
            <Link href="/about" style={{ background: "transparent", border: "0.5px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.7)", padding: "14px 32px", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", display: "inline-block", minWidth: isDesktop ? "160px" : "140px", textAlign: "center" }}>
              Our Story
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 10 }}
        >
          <span style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Scroll</span>
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{ width: "1px", height: "40px", background: "linear-gradient(to bottom, #c9a96e, transparent)" }}
          />
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes rotateCW { to { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes rotateCCW { to { transform: translate(-50%, -50%) rotate(-360deg); } }
      `}</style>
    </section>
  );
}