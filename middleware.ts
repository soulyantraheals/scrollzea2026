import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";
  const isSetupRoute = pathname === "/api/setup";

  // Pass through API routes and setup
  if (isSetupRoute || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Simple cookie check — NextAuth v5 JWT session cookie
  const sessionToken = req.cookies.get("authjs.session-token")?.value;

  // Redirect unauthenticated users to login
  if (isAdminRoute && !isAdminLogin && !sessionToken) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Redirect already logged-in users away from login page
  if (isAdminLogin && sessionToken) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/setup"],
};

export const config = {
  matcher: ["/admin/:path*", "/api/setup"],
};
