// app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import type { AdminLoginBody } from "@/lib/types";
import { generateAdminToken } from "@/lib/adminAuth";

// In-memory rate limiter (per-process; resets on cold start)
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

function getClientIp(headersList: Awaited<ReturnType<typeof headers>>): string {
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || record.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (record.count >= MAX_ATTEMPTS) return true;
  record.count++;
  return false;
}

function clearAttempts(ip: string) {
  attempts.delete(ip);
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const headersList = await headers();
    const ip = getClientIp(headersList);

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { message: "Too many login attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    const { email, password } = (await request.json()) as AdminLoginBody;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email.trim().toLowerCase() !== adminEmail?.toLowerCase() || password !== adminPassword) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Successful login — clear rate limit for this IP
    clearAttempts(ip);

    const token = await generateAdminToken();
    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 8, // 8 hours (reduced from 24)
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
