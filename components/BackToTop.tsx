"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isProductPage = pathname?.startsWith("/product/");
  const baseBottom = isProductPage ? 110 : 24; // Align with chat widget base
  const bottomPosition = baseBottom + 56 + 16; // Chat base + Chat Height + Gap

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="group"
          style={{
            position: "fixed",
            bottom: `${bottomPosition}px`,
            right: "24px",
            zIndex: 300,
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "#c9a96e",
            color: "#0a0a0a",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 32px rgba(201, 169, 110, 0.3)",
            overflow: "hidden",
            outline: "none",
          }}
        >
          {/* Hover Fill Effect */}
          <div 
            className="absolute inset-0 bg-[#0a0a0a] rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 ease-out origin-center"
            style={{ zIndex: 0 }}
          />
          
          {/* Arrow */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full w-full group-hover:text-[#c9a96e] transition-colors duration-300">
             <svg 
               width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
               className="group-hover:-translate-y-1 transition-transform duration-300 ease-out"
             >
              <path d="M12 19V5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
