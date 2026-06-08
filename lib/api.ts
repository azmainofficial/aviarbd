/**
 * Centralized fetch helper for all Laravel API calls.
 *
 * In the browser:  routes through /backend/* (Next.js server-side proxy)
 *                  → bypasses browser service workers completely
 * On the server:   calls Laravel directly (no proxy hop needed)
 */

const DEFAULT_API = "https://aviarbd.com/api";
const LARAVEL_API = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API).replace(/\/$/, "");


function isServer() {
  return typeof window === "undefined";
}

/**
 * Resolve any media URL (image, video, etc.)
 * If the URL is relative, or points to localhost in a production environment,
 * it redirects it to the correct production backend domain.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";

  const isDev = LARAVEL_API.includes("localhost") || LARAVEL_API.includes("127.0.0.1");
  const baseUrl = LARAVEL_API.replace(/\/api$/, "");

  // 1. Handle absolute URLs from the database (e.g., http://localhost:8000/uploads/...)
  if (url.startsWith("http")) {
    // In DEV: Strip localhost/127.0.0.1 prefix to use Next.js /public folder
    if (isDev && (url.includes("localhost:") || url.includes("127.0.0.1:"))) {
      return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):[0-9]+/, "");
    }
    // In PROD: Swap localhost/127.0.0.1 with the real production domain
    if (!isDev && (url.includes("localhost:") || url.includes("127.0.0.1:"))) {
      return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1):[0-9]+/, baseUrl);
    }
    return url;
  }

  // 2. Handle relative paths (e.g., "/uploads/..." or "uploads/...")
  // In DEV: Keep relative so Next.js serves from its own /public folder
  if (isDev) {
    return url.startsWith("/") ? url : `/${url}`;
  }

  // In PROD: Prepend the production base URL
  return url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
}

/**
 * Build the fetch URL:
 * - Server-side: direct Laravel URL
 * - Browser:     /backend/... (same-origin, SW-safe)
 */
export function apiUrl(path: string): string {
  const clean = path.replace(/^\//, "");

  // If we have an absolute URL for the API, use it (especially for static exports)
  if (process.env.NEXT_PUBLIC_IS_STATIC_EXPORT === "true" || !isServer()) {
    if (LARAVEL_API.startsWith("http")) {
      return `${LARAVEL_API}/${clean}`;
    }
  }

  if (isServer()) {
    return `${LARAVEL_API}/${clean}`;
  }

  // Fallback to proxy route for standard Next.js deployments
  return `/laravel-api/${clean}`;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(apiUrl(path), options);
}

export async function apiJson<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await apiFetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error((err as { message?: string }).message || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const fetchAPI = apiFetch;
