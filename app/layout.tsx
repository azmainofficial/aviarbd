// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { type ReactNode } from "react";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import CartSidebarWrapper from "@/components/CartSidebarWrapper";
import AnnouncementBar from "@/components/AnnouncementBar";
import ClientOnlyComponents from "@/components/ClientOnlyComponents";
import { SwKiller } from "@/components/SwKiller";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

// next/font handles: self-hosting, font-display:swap, preloading, and zero render-blocking
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "AVIAR — Premium Collection",
  description: "Luxury clothing and lifestyle brand",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>
        <SwKiller />
        <ClientOnlyComponents />
        <AnnouncementBar />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <SmoothScroll>
                {children}
                <CartSidebarWrapper />
              </SmoothScroll>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
