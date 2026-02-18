import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Middleware runs server-side in Docker container, so it can use BACKEND_URL directly
// This avoids going through nginx and Next.js API routes
const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";

async function fetchUser(req: NextRequest) {
  try {
    const res = await fetch(`${backendUrl}/api/account`, {
      headers: { cookie: req.headers.get("cookie") || "" },
      cache: "no-store",
    });
    if (res.status === 401) return null;
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!["/login", "/dashboard", "/onboarding", "/pos"].some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const user = await fetchUser(req);

  // /login redirects if authenticated
  if (pathname.startsWith("/login")) {
    if (user) {
      return NextResponse.redirect(
        new URL(user.needsOnboarding ? "/onboarding" : "/dashboard", req.url),
      );
    }
    return NextResponse.next();
  }

  // Protected routes: /dashboard, /onboarding, /pos
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if ((pathname.startsWith("/dashboard") || pathname.startsWith("/pos")) && user.needsOnboarding) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  if (pathname.startsWith("/onboarding") && user.needsOnboarding === false) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/onboarding/:path*", "/pos/:path*"],
};
