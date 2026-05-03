import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const LARAVEL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api")
  .replace(/\/api\/?$/, ""); // → "http://localhost:8000"

/**
 * Generic proxy: /api/proxy/[...path] → http://localhost:8000/api/[...path]
 * Runs server-side (Node.js) — invisible to browser service workers.
 */
async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const laravelUrl = `${LARAVEL}/api/${path.join("/")}`;

  // Forward query string
  const qs = req.nextUrl.search;
  const targetUrl = `${laravelUrl}${qs}`;

  // Build headers to forward (skip host/connection)
  const forwardHeaders: HeadersInit = {};
  req.headers.forEach((value, key) => {
    if (!["host", "connection", "content-length"].includes(key.toLowerCase())) {
      forwardHeaders[key] = value;
    }
  });

  // Forward body for POST/PUT/PATCH
  const hasBody = ["POST", "PUT", "PATCH"].includes(req.method);
  const body    = hasBody ? await req.arrayBuffer() : undefined;

  try {
    const upstream = await fetch(targetUrl, {
      method:  req.method,
      headers: forwardHeaders,
      body:    hasBody ? body : undefined,
    });

    const text        = await upstream.text();
    const contentType = upstream.headers.get("content-type") || "application/json";

    return new NextResponse(text, {
      status:  upstream.status,
      headers: { "Content-Type": contentType },
    });
  } catch (err) {
    console.error("[proxy] Laravel unreachable:", targetUrl, err);
    return NextResponse.json(
      { message: "Laravel API unreachable", url: targetUrl, error: String(err) },
      { status: 502 }
    );
  }
}

export const GET    = handler;
export const POST   = handler;
export const PUT    = handler;
export const PATCH  = handler;
export const DELETE = handler;
