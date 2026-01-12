import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/sign-up", "/api/auth"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If accessing public route, allow it
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  const role = token.role as string;
  const adminRoutes = ["/admin", "/superadmin"];
  const salesRoutes = ["/sales"];
  const deliveryRoutes = ["/delivery"];

  // Check if user is trying to access route outside their role
  // Owner admin can access all routes (admin, sales, delivery)
  if (adminRoutes.some(route => pathname.startsWith(route)) && role !== "owner_admin" && role !== "super_admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // Allow owner_admin to access sales routes (role switching feature)
  if (salesRoutes.some(route => pathname.startsWith(route)) && role !== "salesman" && role !== "owner_admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // Allow owner_admin to access delivery routes (role switching feature)
  if (deliveryRoutes.some(route => pathname.startsWith(route)) && role !== "delivery_boy" && role !== "owner_admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // Add headers for security
  const response = NextResponse.next();
  response.headers.set("x-user-role", role || "");
  response.headers.set("x-user-id", token.sub || "");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
  ],
};
