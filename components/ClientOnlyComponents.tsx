"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Load immediately — lightweight and needed for UX
const BackToTop = dynamic(() => import("@/components/BackToTop"), { ssr: false });

// Defer heavy components — load after page has painted
const ExitPopup = dynamic(() => import("@/components/ExitPopup"), { ssr: false });
const LiveChat = dynamic(() => import("@/components/LiveChat"), { ssr: false });

export default function ClientOnlyComponents() {
  // Only mount heavy widgets after 3 seconds — page loads fast first
  const [deferred, setDeferred] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDeferred(true), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <BackToTop />
      {deferred && (
        <>
          <ExitPopup />
          <LiveChat />
        </>
      )}
    </>
  );
}
