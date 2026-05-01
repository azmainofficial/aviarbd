// components/Footer.tsx
"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const SHOP_LINKS = [
  { href: "/shop?filter=new",        label: "New Arrivals" },
  { href: "/shop?filter=clothing",   label: "Clothing" },
  { href: "/shop?filter=accessories",label: "Accessories" },
  { href: "/shop?filter=home",       label: "Home Goods" },
  { href: "/shop?filter=sale",       label: "Sale" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "#",      label: "Sustainability" },
  { href: "#",      label: "Careers" },
  { href: "#",      label: "Press" },
];

const HELP_LINKS = [
  { href: "/track",   label: "Track Order" },
  { href: "#",        label: "Shipping & Returns" },
  { href: "#",        label: "Size Guide" },
  { href: "#",        label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

const linkStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  color: "rgba(255,255,255,0.5)",
  textDecoration: "none",
  marginBottom: "14px",
  lineHeight: "1.4",
  transition: "color 0.2s",
};

const headingStyle: React.CSSProperties = {
  fontSize: "10px",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "#c9a96e",
  marginBottom: "24px",
};

export default function Footer() {
  const [cols, setCols] = useState(4);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCols(w < 640 ? 1 : w < 1024 ? 2 : 4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <footer style={{
      background: "#0a0a0a",
      width: "100%",
      borderTop: "0.5px solid rgba(201,169,110,0.15)",
      paddingTop: cols === 1 ? "48px" : "64px",
      paddingBottom: cols === 1 ? "32px" : "40px",
      paddingLeft: cols === 1 ? "20px" : "48px",
      paddingRight: cols === 1 ? "20px" : "48px",
    }}>
      <div style={{ maxWidth: "1440px", margin: "0 auto" }}>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: cols === 1 ? "40px" : "48px" }}>

          {/* Brand */}
          <div>
            <Link href="/" style={{ display: "block", textDecoration: "none", marginBottom: "16px" }}>
              <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", letterSpacing: "0.15em", color: "#fafaf8" }}>AVIAR</div>
              <div style={{ fontSize: "9px", letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a96e", marginTop: "2px" }}>Premium Collection</div>
            </Link>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: "200px", margin: 0 }}>
              Timeless design, exceptional craft. Luxury that respects the planet.
            </p>
            {/* Socials */}
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              {[
                { label: "Instagram", icon: "IG" },
                { label: "Pinterest", icon: "PT" },
                { label: "TikTok",    icon: "TK" },
              ].map(({ label, icon }) => (
                <a key={label} href="#" aria-label={label}
                  style={{ width: 36, height: 36, border: "0.5px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", textDecoration: "none", transition: "border-color 0.2s, color 0.2s" }}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <div style={headingStyle}>Shop</div>
            {SHOP_LINKS.map((l) => (
              <Link key={l.href} href={l.href} style={linkStyle}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Company */}
          <div>
            <div style={headingStyle}>Company</div>
            {COMPANY_LINKS.map((l) => (
              <Link key={l.label} href={l.href} style={linkStyle}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Help */}
          <div>
            <div style={headingStyle}>Help</div>
            {HELP_LINKS.map((l) => (
              <Link key={l.label} href={l.href} style={linkStyle}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                {l.label}
              </Link>
            ))}

            {/* Newsletter teaser */}
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: "0.5px solid rgba(255,255,255,0.07)" }}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: 12, letterSpacing: "0.06em" }}>
                Stay in the loop
              </div>
              <Link href="/#newsletter"
                style={{ display: "inline-block", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#c9a96e", textDecoration: "none", borderBottom: "0.5px solid rgba(201,169,110,0.4)", paddingBottom: 2 }}>
                Join our newsletter →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          marginTop: "56px",
          paddingTop: "24px",
          borderTop: "0.5px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: cols === 1 ? "column" : "row",
          justifyContent: "space-between",
          alignItems: cols === 1 ? "flex-start" : "center",
          gap: "12px",
        }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
            © {new Date().getFullYear()} AVIAR. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((t) => (
              <a key={t} href="#"
                style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}>
                {t}
              </a>
            ))}
          </div>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>
            Crafted by Samrise Digital
          </span>
        </div>

      </div>
    </footer>
  );
}
