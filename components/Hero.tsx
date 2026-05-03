// components/Hero.tsx
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

/* ─── Slide type ─────────────────────────────────────────────────── */
type Slide = {
  image: string;
  label: string;
  headline: string;
  sub: string;
  cta: string;
  href: string;
  accent: string; // text accent colour per slide
};

/* ─── Static fallback slides (used when no DB images exist) ─────── */
const STATIC_SLIDES: Slide[] = [
  {
    image: "/images/products/silk-wrap-blouse.png",
    label: "New Arrival",
    headline: "Wear the\nDifference",
    sub: "Premium silk craftsmanship for those who demand excellence",
    cta: "Shop Now",
    href: "/shop",
    accent: "#c9a96e",
  },
  {
    image: "/images/products/cashmere-turtleneck.png",
    label: "SS 2025 Collection",
    headline: "Define\nYour Style",
    sub: "Pure cashmere comfort — effortless luxury for every season",
    cta: "Explore",
    href: "/shop?filter=new",
    accent: "#e8d5b0",
  },
  {
    image: "/images/products/leather-crossbody-bag.png",
    label: "Accessories",
    headline: "Carry\nConfidence",
    sub: "Handcrafted leather goods built to last a lifetime",
    cta: "View Collection",
    href: "/shop?category=accessories",
    accent: "#d4a56a",
  },
];

const AUTOPLAY_MS = 6000;

/* ─── Slide direction variants ───────────────────────────────────── */
const imageVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "100%" : "-100%",
    scale: 1.05,
    opacity: 0,
  }),
  center: { x: 0, scale: 1, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? "-100%" : "100%",
    scale: 0.97,
    opacity: 0,
  }),
};

const textVariants = {
  enter: (dir: number) => ({ y: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (dir: number) => ({ y: dir > 0 ? -40 : 40, opacity: 0 }),
};

export default function Hero() {
  const [slides, setSlides] = useState<Slide[]>(STATIC_SLIDES);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Drag / swipe state
  const dragStartX = useRef(0);

  /* ── Fetch custom slides from Laravel API ── */
  useEffect(() => {
    fetch("/api/hero-slides")
      .then((r) => r.json())
      .then((data: Record<string, unknown>[]) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const mapped: Slide[] = data.map((p) => ({
          image: String(p.image ?? ""),
          label: String(p.label ?? "Collection"),
          headline: String(p.headline ?? ""),
          sub: String(p.sub ?? ""),
          cta: String(p.cta ?? "Shop Now"),
          href: String(p.href ?? "/shop"),
          accent: String(p.accent ?? "#c9a96e"),
        }));
        if (mapped.length > 0) setSlides(mapped);
      })
      .catch(() => {/* keep static slides */});
  }, []);

  /* ── Progress bar & autoplay ── */
  const resetProgress = useCallback(() => {
    setProgress(0);
    if (progressRef.current) clearInterval(progressRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + 100 / (AUTOPLAY_MS / 50), 100));
    }, 50);

    intervalRef.current = setInterval(() => {
      if (!paused) {
        setDir(1);
        setIndex((i) => (i + 1) % slides.length);
        setProgress(0);
      }
    }, AUTOPLAY_MS);
  }, [slides.length, paused]);

  useEffect(() => {
    resetProgress();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [index, paused, resetProgress]);

  const go = useCallback((next: number) => {
    setDir(next > index ? 1 : -1);
    setIndex(next);
    setProgress(0);
  }, [index]);

  const prev = () => go((index - 1 + slides.length) % slides.length);
  const next = () => go((index + 1) % slides.length);

  const slide = slides[index];

  return (
    <section
      style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: "#0a0a0a" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { dragStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const dx = dragStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(dx) > 50) dx > 0 ? next() : prev();
      }}
    >
      {/* ── Full-bleed image layer ─────────────────────────────────── */}
      <AnimatePresence custom={dir} initial={false}>
        <motion.div
          key={`img-${index}`}
          custom={dir}
          variants={imageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.9, ease: [0.77, 0, 0.18, 1] }}
          style={{ position: "absolute", inset: 0 }}
        >
          <Image
            src={slide.image}
            alt={slide.headline}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center top" }}
          />
          {/* Cinematic dark gradient overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(105deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.15) 100%)",
          }} />
          {/* Bottom fade for nav readability */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "180px",
            background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
          }} />
        </motion.div>
      </AnimatePresence>

      {/* ── Text content ──────────────────────────────────────────── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 10,
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "clamp(24px,6vw,100px)",
        paddingTop: "clamp(80px,12vh,140px)",
      }}>
        <AnimatePresence custom={dir} initial={false} mode="wait">
          <motion.div
            key={`text-${index}`}
            custom={dir}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Label pill */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                marginBottom: "clamp(16px,2.5vh,28px)",
              }}
            >
              <span style={{ width: "28px", height: "1px", background: slide.accent, display: "inline-block" }} />
              <span style={{
                fontSize: "10px", letterSpacing: "0.28em", textTransform: "uppercase",
                color: slide.accent, fontFamily: "DM Sans, sans-serif",
              }}>
                {slide.label}
              </span>
            </motion.div>

            {/* Main headline */}
            <h1 style={{
              fontFamily: "Cormorant Garamond, serif",
              fontWeight: 300,
              fontSize: "clamp(52px, 9vw, 120px)",
              lineHeight: 0.92,
              color: "#fafaf8",
              marginBottom: "clamp(16px,2.5vh,28px)",
              whiteSpace: "pre-line",
              letterSpacing: "-0.01em",
            }}>
              {slide.headline.split("\n").map((line, i) =>
                i === 1
                  ? <em key={i} style={{ color: slide.accent, fontStyle: "italic" }}>{line}</em>
                  : <span key={i}>{line}<br /></span>
              )}
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: "clamp(13px,1.2vw,16px)",
              color: "rgba(255,255,255,0.55)",
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 300,
              maxWidth: "420px",
              lineHeight: 1.7,
              marginBottom: "clamp(28px,4vh,44px)",
            }}>
              {slide.sub}
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              <Link
                href={slide.href}
                style={{
                  background: slide.accent,
                  color: "#0a0a0a",
                  padding: "15px 36px",
                  fontSize: "11px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  fontFamily: "DM Sans, sans-serif",
                  fontWeight: 600,
                  display: "inline-block",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {slide.cta}
              </Link>
              <Link
                href="/shop"
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: "11px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  fontFamily: "DM Sans, sans-serif",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "color 0.2s",
                  paddingLeft: "4px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
              >
                View All <span style={{ fontSize: "16px" }}>→</span>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Slide Controls (Bottom Left) ───────────────────────── */}
      <div style={{
        position: "absolute", bottom: "clamp(24px,4vh,48px)",
        left: "clamp(20px,4vw,60px)",
        zIndex: 20,
        display: "flex", alignItems: "center", gap: "40px",
        flexWrap: "wrap"
      }}>
        {/* Dot indicators */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                padding: 0, width: i === index ? "32px" : "8px", height: "3px", border: "none",
                background: i === index ? slide.accent : "rgba(255,255,255,0.25)",
                transition: "width 0.4s ease, background 0.3s ease",
                cursor: "pointer", overflow: "hidden", position: "relative",
              }}
            >
              {i === index && <span style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.35)", width: `${progress}%`, transition: "width 50ms linear" }} />}
            </button>
          ))}
        </div>

        {/* Counter & arrows */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Counter */}
        <span style={{
          fontSize: "11px", letterSpacing: "0.15em",
          color: "rgba(255,255,255,0.45)",
          fontFamily: "DM Sans, sans-serif",
          minWidth: "36px",
        }}>
          {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>

        {/* Prev */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          style={{
            width: "44px", height: "44px",
            border: "0.5px solid rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            fontSize: "18px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.2s, border-color 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
        >
          ←
        </button>

        {/* Next */}
        <button
          onClick={next}
          aria-label="Next slide"
          style={{
            width: "44px", height: "44px",
            border: "0.5px solid rgba(255,255,255,0.25)",
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            fontSize: "18px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.2s, border-color 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
        >
          →
        </button>
      </div>
    </div>

    {/* ── Scroll hint ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        style={{
          position: "absolute",
          bottom: "clamp(24px,4vh,52px)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
        }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          style={{ width: "20px", height: "32px", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "10px", display: "flex", justifyContent: "center", paddingTop: "5px" }}
        >
          <motion.div
            animate={{ opacity: [1, 0], y: [0, 10] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            style={{ width: "3px", height: "6px", borderRadius: "2px", background: "rgba(255,255,255,0.5)" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
