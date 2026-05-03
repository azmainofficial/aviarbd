// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { type ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import CartSidebarWrapper from "@/components/CartSidebarWrapper";
import AnnouncementBar from "@/components/AnnouncementBar";
import ClientOnlyComponents from "@/components/ClientOnlyComponents";
import { SwKiller } from "@/components/SwKiller";
import "./globals.css";

export const metadata: Metadata = {
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
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SwKiller />
        <ClientOnlyComponents />
        <AnnouncementBar />
        <CartProvider>
          <WishlistProvider>
            {children}
            <CartSidebarWrapper />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
