import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("hms_session_token")?.value;

  // Root redirect to dashboard or login
  if (pathname === "/") {
    if (sessionToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protect /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export default middleware;

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
};
