import type { NextConfig } from "next";

const LARAVEL = (process.env.NEXT_PUBLIC_API_URL || process.env.LARAVEL_API_URL || "https://aviarbd.com/api").replace(/\/api$/, "");


const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true" || process.env.NEXT_PUBLIC_IS_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export", trailingSlash: true } : {}),

  // Enable image optimization
  images: {
    unoptimized: isStaticExport,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Allow any HTTP/HTTPS host for maximum flexibility in dev/prod
      { protocol: "http", hostname: "**", pathname: "/**" },
      { protocol: "https", hostname: "**", pathname: "/**" },
      // Explicit patterns for localhost just in case
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/**" },
    ],
  },

  // Compress HTTP responses
  compress: true,

  // Proxy /api/* and /laravel-api/* → Laravel backend in dev
  ...(!isStaticExport ? {
    async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination: `${LARAVEL}/api/:path*`,
        },
        {
          source: "/laravel-api/:path*",
          destination: `${LARAVEL}/api/:path*`,
        },
        {
          source: "/uploads/:path*",
          destination: `${LARAVEL}/uploads/:path*`,
        },
        {
          source: "/images/:path*",
          destination: `${LARAVEL}/images/:path*`,
        },
      ];
    },
  } : {}),
};

export default nextConfig;
