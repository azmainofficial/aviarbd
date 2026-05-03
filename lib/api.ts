/**
 * Centralized fetch helper for all Laravel API calls.
 *
 * In the browser:  routes through /backend/* (Next.js server-side proxy)
 *                  → bypasses browser service workers completely
 * On the server:   calls Laravel directly (no proxy hop needed)
 */

const LARAVEL_API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/$/, "");

function isServer() {
  return typeof window === "undefined";
}

/**
 * Build the fetch URL:
 * - Server-side: direct Laravel URL
 * - Browser:     /backend/... (same-origin, SW-safe)
 */
export function apiUrl(path: string): string {
  const clean = path.replace(/^\//, "");
  if (isServer()) {
    return `${LARAVEL_API}/${clean}`;
  }
  // Route through proxy so no browser SW can intercept
  return `/backend/${clean}`;
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

/** Alias kept for backward-compat with components that import fetchAPI */
export const fetchAPI = apiFetch;
