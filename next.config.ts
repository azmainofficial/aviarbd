import type { NextConfig } from "next";

const LARAVEL = process.env.LARAVEL_API_URL || "http://localhost:8000";

// Set NEXT_STATIC_EXPORT=true when building for cPanel (static HTML export).
// Leave unset in dev so rewrites and middleware work normally.
const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export", trailingSlash: true } : {}),
  images: {
    unoptimized: true,
  },
  // Proxy /laravel-api/* → Laravel in dev mode (bypasses browser service workers)
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
      ];
    },
  } : {}),
};

export default nextConfig;
