import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { hasClerkRuntimeConfiguration } from "@/lib/auth/clerk";

export const publicRoutePatterns = [
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/invite(.*)",
  "/prototype(.*)",
  "/api/auth(.*)",
  "/api/webhooks(.*)",
  "/api/cron(.*)",
];

export const isPublicRoute = createRouteMatcher(publicRoutePatterns);

const clerkConfigured = hasClerkRuntimeConfiguration();

const configuredMiddleware = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

function unconfiguredAuthMiddleware(request: NextRequest) {
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication configuration error", {
    status: 503,
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
}

export default clerkConfigured ? configuredMiddleware : unconfiguredAuthMiddleware;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
