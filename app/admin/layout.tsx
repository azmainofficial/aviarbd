"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/admin/products",
    label: "Products",
    exact: true,
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M20 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1z" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    href: "/admin/products/new",
    label: "Add Product",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
      </svg>
    ),
  },
  {
    href: "/admin/customers",
    label: "Customers",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/admin/abandoned",
    label: "Abandoned",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        <line x1="17" y1="10" x2="17" y2="14" /><line x1="17" y1="16" x2="17" y2="16.5" />
      </svg>
    ),
  },
  {
    href: "/admin/chat",
    label: "Live Chat",
    icon: (
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

const SIDEBAR_W = 240;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isDesktop;
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const isActive = (item: { href: string; exact?: boolean }) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div
      style={{
        width: SIDEBAR_W,
        background: "#0a0a0a",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Brand */}
      <div style={{ padding: "28px 24px", borderBottom: "0.5px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "22px", letterSpacing: "0.15em", color: "#fafaf8" }}>AVIAR</div>
          <div style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a96e", marginTop: "3px" }}>Admin Panel</div>
        </Link>
        {onClose && (
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "18px", padding: "4px" }}>✕</button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "20px 0" }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "11px 24px",
                fontSize: "13px",
                letterSpacing: "0.05em",
                textDecoration: "none",
                color: active ? "#c9a96e" : "rgba(255,255,255,0.5)",
                background: active ? "rgba(255,255,255,0.04)" : "transparent",
                borderLeft: active ? "2px solid #c9a96e" : "2px solid transparent",
                transition: "all 0.2s",
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}

        <div style={{ margin: "16px 24px", borderTop: "0.5px solid rgba(255,255,255,0.08)" }} />

        <Link
          href="/"
          target="_blank"
          style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: "11px 24px", fontSize: "13px", letterSpacing: "0.05em",
            textDecoration: "none", color: "rgba(255,255,255,0.4)",
            borderLeft: "2px solid transparent",
          }}
        >
          <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          View Store
        </Link>
      </nav>

      {/* User + Logout */}
      <div style={{ padding: "20px 24px", borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#c9a96e", fontSize: "12px", fontWeight: 600 }}>A</span>
          </div>
          <div>
            <div style={{ color: "#fafaf8", fontSize: "12px" }}>Admin</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>AVIAR Store</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: "100%", background: "none", border: "0.5px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.35)", padding: "10px", fontSize: "11px",
            letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();
  const MOBILE_ITEMS = NAV_ITEMS.filter((n) => n.href !== "/admin/products/new");

  return (
    <div
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#0a0a0a",
        borderTop: "0.5px solid rgba(255,255,255,0.1)",
        zIndex: 50,
        display: "flex",
      }}
    >
      {MOBILE_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              padding: "10px 4px",
              color: active ? "#c9a96e" : "rgba(255,255,255,0.35)",
              textDecoration: "none",
              fontSize: "9px", letterSpacing: "0.06em", textTransform: "uppercase",
              gap: "4px",
              transition: "color 0.2s",
            }}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDesktop = useIsDesktop();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer when navigating
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  if (pathname === "/admin/login") return <div data-admin="true" style={{ minHeight: "100vh" }}>{children}</div>;

  return (
    <div data-admin="true" style={{ minHeight: "100vh", background: "#f4f4f2", display: "flex" }}>

      {/* Desktop fixed sidebar */}
      {isDesktop && (
        <div style={{ width: SIDEBAR_W, flexShrink: 0, position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 40 }}>
          <Sidebar />
        </div>
      )}

      {/* Mobile drawer overlay */}
      {!isDesktop && drawerOpen && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 45 }}
          />
          <div style={{ position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 50 }}>
            <Sidebar onClose={() => setDrawerOpen(false)} />
          </div>
        </>
      )}

      {/* Main content */}
      <main
        style={{
          flex: 1,
          marginLeft: isDesktop ? SIDEBAR_W : 0,
          paddingBottom: isDesktop ? 0 : 72,
          minWidth: 0,
        }}
      >
        {/* Mobile top bar */}
        {!isDesktop && (
          <div style={{
            position: "sticky", top: 0, zIndex: 30,
            background: "#0a0a0a",
            padding: "0 16px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "0.5px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "20px", letterSpacing: "0.15em", color: "#fafaf8" }}>AVIAR</div>
            <button
              onClick={() => setDrawerOpen(true)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: "8px" }}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {children}
      </main>

      {/* Mobile bottom nav */}
      {!isDesktop && <MobileBottomNav />}
    </div>
  );
}
