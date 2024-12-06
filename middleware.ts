import { NextResponse, NextRequest } from "next/server";
import { decodeToken } from "./middleware/authentication";

interface AuthenticatedRequest extends NextRequest {
  user?: any;
}
export const config = {
  matcher: [
    "/", // Include the root path
    "/admin/:path*", // Matches all routes under `/admin/`
    "/store/:path*", // Matches all routes under `/store/`
  ],
};

export function middleware(request: AuthenticatedRequest) {
  const token = request.cookies.get("access-token")?.value;

  // Use absolute URLs for redirects
  const origin = request.nextUrl.origin;

  if (token) {
    const user = decodeToken(token);
    if (request.nextUrl.pathname === "/") {
      if (user.role === "admin") {
        return NextResponse.redirect(new URL("/admin", origin));
      } else {
        return NextResponse.redirect(new URL("/store", origin));
      }
    }

     // Redirect based on user role if accessing restricted paths
     if (user.role === "owner" && request.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/store", origin));
    }

    if (user.role === "admin" && request.nextUrl.pathname.startsWith("/store")) {
      return NextResponse.redirect(new URL("/admin", origin));
    }
  }

  if (!token && request.nextUrl.pathname !== "/") {
    // Redirect unauthenticated users to `/`
    return NextResponse.redirect(new URL("/", origin));
  }

  return NextResponse.next();
}