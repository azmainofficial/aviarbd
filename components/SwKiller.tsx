"use client";
import { useEffect } from "react";

/**
 * Silently unregisters all Service Workers on mount.
 * The original Next.js/MongoDB project registered a mock SW that intercepts
 * every fetch call (including cross-origin to localhost:8000) and returns
 * {code:200, message:"Mock local response", data:[]}
 * This component permanently removes it.
 */
export function SwKiller() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length === 0) return;
      console.info(`[SwKiller] Removing ৳{registrations.length} service worker(s)…`);
      registrations.forEach((reg) => {
        reg.unregister().then((ok) => {
          if (ok) console.info("[SwKiller] Unregistered SW at scope:", reg.scope);
        });
      });
      // Clear the SW's cache storage too
      if ("caches" in window) {
        caches.keys().then((keys) =>
          keys.forEach((k) => caches.delete(k).then(() => console.info("[SwKiller] Cleared cache:", k)))
        );
      }
    });
  }, []);

  return null;
}
