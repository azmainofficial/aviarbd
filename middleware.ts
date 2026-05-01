import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdminCookie } from "@/lib/adminAuth";

const ADMIN_PUBLIC_PATHS = ["/admin/login"];
const ADMIN_API_PUBLIC = ["/api/admin/login", "/api/admin/logout"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin") && !ADMIN_PUBLIC_PATHS.includes(pathname);
  const isAdminApi = pathname.startsWith("/api/admin") && !ADMIN_API_PUBLIC.includes(pathname);

  if (isAdminPage || isAdminApi) {
    const session = request.cookies.get("admin_session")?.value;
    const valid = session ? await verifyAdminCookie(session) : false;

    if (!valid) {
      if (isAdminApi) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
