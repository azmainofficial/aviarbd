// app/about/page.tsx
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

export default function AboutPage() {
  return (
    <PageTransition>
      <main>
      <Navbar />
      <div style={{ height: "72px", background: "#0a0a0a" }} />

      {/* Hero */}
      <section style={{ background: "#0a0a0a", padding: "clamp(40px,7vw,60px) clamp(20px,5vw,48px) clamp(48px,8vw,80px)", textAlign: "center" }}>
        <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "16px" }}>Our Story</div>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(40px,6vw,88px)", fontWeight: 300, color: "#fafaf8", lineHeight: 1.1 }}>
          Designed with <em>intention</em>.<br />Built to last.
        </h1>
      </section>

      {/* Story */}
      <section style={{ background: "#fafaf8", padding: "clamp(40px,7vw,60px) clamp(20px,5vw,48px)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "24px" }}>Who We Are</div>
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(20px,2.5vw,32px)", fontWeight: 300, lineHeight: 1.6, color: "#0a0a0a", marginBottom: "40px" }}>
            AVIAR was founded on a simple belief — that clothing should be more than what you wear. It should be how you feel.
          </p>
          <p style={{ fontSize: "15px", lineHeight: 1.9, color: "#3a3835", marginBottom: "24px" }}>
            Every piece in our collection is crafted with the finest materials sourced from ethical suppliers around the world. We work with skilled artisans who share our commitment to quality, sustainability, and timeless design.
          </p>
          <p style={{ fontSize: "15px", lineHeight: 1.9, color: "#3a3835" }}>
            Our collections are designed to transcend seasons and trends. We believe in buying less and choosing better — pieces that become part of your story, worn for years, not weeks.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: "#f5f2ec", padding: "clamp(48px,8vw,80px) clamp(20px,5vw,48px)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "32px", textAlign: "center" }}>
          {[["5+", "Years of Craft"], ["100%", "Ethical Sourcing"], ["98%", "Customer Satisfaction"]].map(([num, label]) => (
            <div key={label}>
              <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(40px,6vw,56px)", fontWeight: 300, color: "#c9a96e", lineHeight: 1 }}>{num}</div>
              <div style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#8a8680", marginTop: "12px" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section style={{ background: "#0a0a0a", padding: "clamp(56px,9vw,120px) clamp(20px,5vw,48px)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "clamp(40px,6vw,72px)" }}>
            <div style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#c9a96e", marginBottom: "16px" }}>What We Stand For</div>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(28px,4vw,56px)", fontWeight: 300, color: "#fafaf8" }}>Our <em>Values</em></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "32px" }}>
            {[
              ["Quality", "Every stitch, every seam is held to the highest standard. We never compromise on materials or craft."],
              ["Sustainability", "We source responsibly, minimize waste, and partner only with suppliers who share our environmental values."],
              ["Timelessness", "We design pieces that outlast trends. Our collections are meant to be worn for years, not just one season."],
            ].map(([title, desc]) => (
              <div key={title} style={{ borderTop: "0.5px solid rgba(201,169,110,0.3)", paddingTop: "32px" }}>
                <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "24px", fontWeight: 300, color: "#fafaf8", marginBottom: "16px" }}>{title}</div>
                <p style={{ fontSize: "14px", lineHeight: 1.8, color: "rgba(255,255,255,0.5)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

        <Footer />
      </main>
    </PageTransition>
  );
}