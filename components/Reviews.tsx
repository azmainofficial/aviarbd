// components/Reviews.tsx
"use client";
import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";

interface Review {
  id: number;
  text: string;
  name: string;
  subtitle: string;
  initials: string;
}

const REVIEWS: Review[] = [
  { id: 1, text: "The silk wrap blouse exceeded all my expectations. The drape is immaculate and the attention to detail in the stitching is nothing short of perfection.", name: "Eleanor Vance", subtitle: "Verified Buyer", initials: "EV" },
  { id: 2, text: "AVIAR has completely transformed my wardrobe. These aren't just clothes; they are investment pieces that feel as luxurious as they look.", name: "Sophia Laurent", subtitle: "Fashion Director", initials: "SL" },
  { id: 3, text: "Finding a brand that genuinely balances modern aesthetics with traditional craftsmanship is rare. I have never felt more confident.", name: "Clara Hughes", subtitle: "Verified Buyer", initials: "CH" },
];

export default function Reviews() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <section className="px-5 md:px-[48px] py-[60px] md:py-[120px] w-full" style={{ background: "var(--white)" }}>
      <div className="max-w-[1440px] mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-10 md:mb-16"
        >
          <div className="text-[10px] tracking-[0.25em] uppercase mb-4" style={{ color: "var(--muted)" }}>What they say</div>
          <div className="text-[16px] tracking-[0.2em] mb-4" style={{ color: "var(--gold)" }}>★★★★★</div>
          <h2 className="font-display font-light text-[clamp(36px,4vw,56px)]" style={{ color: "var(--black)" }}>
            Loved by <span className="italic">thousands</span>
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl"
        >
          {REVIEWS.map((review, index) => (
            <motion.div
              key={review.id}
              variants={itemVariants}
              animate={{ scale: index === activeIndex ? 1 : 0.96, opacity: index === activeIndex ? 1 : 0.4 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="p-[28px] md:p-[40px] flex flex-col justify-between"
              style={{ border: "0.5px solid rgba(0,0,0,0.06)", minHeight: "260px", background: "white" }}
            >
              <p className="font-display italic text-[17px] md:text-[20px] leading-[1.7] mb-6 md:mb-8" style={{ color: "var(--dark-muted)" }}>
                &quot;{review.text}&quot;
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-[40px] h-[40px] rounded-full bg-black text-white flex items-center justify-center font-display text-[16px]">
                  {review.initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium" style={{ color: "var(--black)" }}>{review.name}</span>
                  <span className="text-[12px]" style={{ color: "var(--muted)" }}>{review.subtitle}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex items-center gap-3 mt-12">
          {REVIEWS.map((_, index) => (
            <button key={index} onClick={() => setActiveIndex(index)} className="relative py-2 px-1">
              <div className="h-[2px] transition-all duration-500" style={{ width: index === activeIndex ? "24px" : "12px", background: index === activeIndex ? "var(--gold)" : "rgba(0,0,0,0.1)" }} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}