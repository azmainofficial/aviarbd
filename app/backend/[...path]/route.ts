import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const LARAVEL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api")
  .replace(/\/api\/?$/, ""); // → "http://localhost:8000"

/**
 * Generic proxy: /backend/[...path] → http://localhost:8000/api/[...path]
 *
 * Deliberately NOT under /api/* so the old mock service worker
 * (which intercepts all /api/ requests) cannot touch it.
 * Runs server-side in Node.js — completely invisible to the browser.
 */
async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const qs        = req.nextUrl.search;
  const targetUrl = `${LARAVEL}/api/${path.join("/")}${qs}`;

  const forwardHeaders: HeadersInit = {};
  req.headers.forEach((value, key) => {
    if (!["host", "connection", "content-length"].includes(key.toLowerCase())) {
      forwardHeaders[key] = value;
    }
  });

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
    console.error("[backend-proxy] Laravel unreachable:", targetUrl, err);
    return NextResponse.json(
      { message: "Laravel API unreachable", error: String(err) },
      { status: 502 }
    );
  }
}

export const GET    = handler;
export const POST   = handler;
export const PUT    = handler;
export const PATCH  = handler;
export const DELETE = handler;
