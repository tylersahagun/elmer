import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Middleware to protect dashboard routes.
 * 
 * Public routes (no auth required):
 * - /login
 * - /signup
 * - /invite/* (accept invitations)
 * - /api/auth/* (NextAuth endpoints)
 * - / (home/landing page handles auth state itself)
 * - Static files and Next.js internals
 * 
 * Protected routes (auth required):
 * - /workspace/*
 * - /api/* (except /api/auth/*)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Public routes - no auth required
  const publicRoutes = [
    "/login",
    "/signup",
    "/invite",
    "/api/auth",
    "/api/webhooks",
    "/api/cron",
  ];

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  
  // Home page is public (it handles auth state itself)
  const isHomePage = pathname === "/";

  // If it's a public route or home page, allow access
  if (isPublicRoute || isHomePage) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  // If not authenticated and trying to access protected route
  if (!token) {
    // For API routes, return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // For page routes, redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
