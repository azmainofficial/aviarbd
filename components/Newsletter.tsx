// components/Newsletter.tsx
"use client";

import { useState, type SyntheticEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Newsletter() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <section className="relative bg-[#fafaf8] px-6 py-[100px] md:py-[180px] w-full flex justify-center overflow-hidden border-t border-black/[0.03]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center w-full"
        style={{ maxWidth: "800px" }}
      >
        <motion.span
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          whileInView={{ opacity: 1, letterSpacing: "0.4em" }}
          transition={{ duration: 1.5 }}
          className="text-gold text-[10px] uppercase font-medium mb-12 block tracking-[0.4em]"
        >
          STAY IN THE KNOW
        </motion.span>

        <h2 className="font-display font-light text-[clamp(44px,7.5vw,90px)] text-black leading-[1] mb-12 tracking-tight">
          Join our <span className="italic font-normal">Inner Circle</span>
        </h2>

        <p className="text-[14px] md:text-[17px] text-black/60 mb-20 max-w-[480px] leading-relaxed mx-auto font-light">
          Unlock early access to archival releases, private previews, and exclusive invitations to our seasonal events.
        </p>

        <div className="w-full flex flex-col" style={{ maxWidth: "560px" }}>
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[16px] text-black font-medium tracking-[0.05em] py-10"
              >
                Welcome. Your invitation is being prepared.
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative flex items-center justify-between w-full gap-4 group border-b border-black/[0.1] pb-5 transition-colors duration-700 focus-within:border-gold"
              >
                <input
                  type="email"
                  required
                  placeholder="Your Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ minWidth: 0 }}
                  className="flex-1 bg-transparent py-2 text-[15px] text-black placeholder:text-black/30 focus:outline-none rounded-none border-none outline-none"
                />

                <button
                  type="submit"
                  className="bg-transparent text-black py-2 text-[11px] md:text-[12px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-medium transition-all duration-300 hover:text-gold flex items-center gap-2 group/btn border-none outline-none flex-shrink-0"
                >
                  <span className="relative">
                    Subscribe
                    <span className="absolute bottom-[-4px] left-0 w-0 h-[1px] bg-gold transition-all duration-500 group-hover/btn:w-full" />
                  </span>
                  <motion.span
                    className="flex items-center"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  >
                    <svg width="24" height="8" viewBox="0 0 24 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.3536 4.35355C23.5488 4.15829 23.5488 3.84171 23.3536 3.64645L20.1716 0.464466C19.9763 0.269204 19.6597 0.269204 19.4645 0.464466C19.2692 0.659728 19.2692 0.976311 19.4645 1.17157L22.2929 4L19.4645 6.82843C13.2692 7.02369 13.2692 7.34027 13.4645 7.53553C13.6597 7.7308 13.9763 7.7308 14.1716 7.53553L23.3536 4.35355ZM0 4.5H23V3.5H0V4.5Z" fill="currentColor" />
                    </svg>
                  </motion.span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 text-[9px] text-black/40 tracking-[0.3em] uppercase w-full text-center"
          >
            Membership is subject to editorial approval
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
