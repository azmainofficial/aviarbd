"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion"; // keep for text/UI but remove for heavy bg images
import Link from "next/link";
import Image from "next/image";
import { resolveMediaUrl, apiUrl } from "@/lib/api";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/* ─── Types & Constants ─────────────────────────────────────────── */
type Slide = {
  image: string;
  label: string;
  headline: string;
  sub: string;
  cta: string;
  href: string;
  accent: string;
};

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

const AUTOPLAY_MS = 7000;

export default function Hero() {
  const [slides, setSlides] = useState<Slide[]>(STATIC_SLIDES);
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(-1);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  /* ── Fetch & Preload ── */
  useEffect(() => {
    fetch(apiUrl("/hero-slides"))

      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((p: any) => ({
            image: String(p.image ?? ""),
            label: String(p.label ?? "Collection"),
            headline: String(p.headline ?? ""),
            sub: String(p.sub ?? ""),
            cta: String(p.cta ?? "Shop Now"),
            href: String(p.href ?? "/shop"),
            accent: String(p.accent ?? "#c9a96e"),
          }));
          setSlides(mapped);

          // Preload next image immediately
          if (mapped.length > 1) {
            const nextImg = new window.Image();
            nextImg.src = resolveMediaUrl(mapped[1].image);
          }
        }
      })
      .catch(() => { });
  }, []);

  /* ── GSAP Transition ── */
  useGSAP(() => {
    if (prevIndex === -1) return; // skip initial mount

    const nextSlide = slideRefs.current[index];
    const prevSlide = slideRefs.current[prevIndex];
    if (!nextSlide || !prevSlide) return;

    const tl = gsap.timeline({ defaults: { ease: "power4.inOut", duration: 1.2 } });

    // Ensure next slide is on top but invisible
    gsap.set(nextSlide, { zIndex: 5, opacity: 0, scale: 1.1, xPercent: 100 });
    gsap.set(prevSlide, { zIndex: 1 });

    tl.to(nextSlide, {
      opacity: 1,
      xPercent: 0,
      scale: 1,
    })
      .to(prevSlide, {
        opacity: 0,
        xPercent: -30,
        scale: 0.95,
      }, "<");

    // Preload the next slide's image after transition finishes
    const nextIdx = (index + 1) % slides.length;
    const preloader = new window.Image();
    preloader.src = resolveMediaUrl(slides[nextIdx].image);

  }, { dependencies: [index], scope: containerRef });

  /* ── Progress & Autoplay ── */
  const resetProgress = useCallback(() => {
    setProgress(0);
    if (progressRef.current) clearInterval(progressRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + 100 / (AUTOPLAY_MS / 50), 100));
    }, 50);

    intervalRef.current = setInterval(() => {
      if (!paused) {
        setPrevIndex(index);
        setIndex((i) => (i + 1) % slides.length);
        setProgress(0);
      }
    }, AUTOPLAY_MS);
  }, [slides.length, paused, index]);

  useEffect(() => {
    resetProgress();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [resetProgress]);

  const go = (next: number) => {
    if (next === index) return;
    setPrevIndex(index);
    setIndex(next);
    setProgress(0);
  };

  const slide = slides[index];

  return (
    <section
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: "#0a0a0a" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Slide Layers ────────────────────────────────────────── */}
      {slides.map((s, i) => (
        <div
          key={i}
          ref={(el) => { slideRefs.current[i] = el; }}
          style={{
            position: "absolute",
            inset: 0,
            opacity: i === 0 ? 1 : 0,
            zIndex: i === 0 ? 1 : 0,
            willChange: "transform, opacity",
          }}
        >
          <Image
            src={resolveMediaUrl(s.image)}
            alt={s.headline}
            fill
            priority={i === 0}
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center top" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(105deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.15) 100%)",
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "180px",
            background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
          }} />
        </div>
      ))}

      <div style={{
        position: "absolute", inset: 0, zIndex: 10,
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "clamp(24px,6vw,100px)",
        paddingTop: "clamp(80px,12vh,140px)",
        pointerEvents: "none",
      }}>
        <div style={{ pointerEvents: "auto" }}>
          {/* Label pill */}
          <motion.div
            key={`label-${index}`}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
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
          <motion.h1
            key={`head-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontWeight: 300,
              fontSize: "clamp(52px, 9vw, 120px)",
              lineHeight: 0.92,
              color: "#fafaf8",
              marginBottom: "clamp(16px,2.5vh,28px)",
              whiteSpace: "pre-line",
              letterSpacing: "-0.01em",
            }}
          >
            {slide.headline.split("\n").map((line, i) =>
              i === 1
                ? <em key={i} style={{ color: slide.accent, fontStyle: "italic" }}>{line}</em>
                : <span key={i}>{line}<br /></span>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            key={`sub-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              fontSize: "clamp(13px,1.2vw,16px)",
              color: "rgba(255,255,255,0.55)",
              fontFamily: "DM Sans, sans-serif",
              fontWeight: 300,
              maxWidth: "420px",
              lineHeight: 1.7,
              marginBottom: "clamp(28px,4vh,44px)",
            }}
          >
            {slide.sub}
          </motion.p>

          {/* CTAs */}
          <motion.div
            key={`cta-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}
          >
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
          </motion.div>
        </div>
      </div>

      {/* ── Slide Controls ───────────────────────── */}
      <div style={{
        position: "absolute", bottom: "clamp(24px,4vh,48px)",
        left: "clamp(20px,4vw,60px)",
        zIndex: 20,
        display: "flex", alignItems: "center", gap: "40px",
        flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
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

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{
            fontSize: "11px", letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.45)",
            fontFamily: "DM Sans, sans-serif",
            minWidth: "36px",
          }}>
            {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>

          <button
            onClick={() => go((index - 1 + slides.length) % slides.length)}
            style={{
              width: "44px", height: "44px",
              border: "0.5px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(8px)",
              color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            ←
          </button>

          <button
            onClick={() => go((index + 1) % slides.length)}
            style={{
              width: "44px", height: "44px",
              border: "0.5px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(8px)",
              color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
