// // middleware.ts (Root level file)
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";

// // Protected routes with required roles
// const protectedRoutes = {
//   "/super-admin": ["super_admin"], // only super admin
//   "/owner-admin": ["super_admin", "owner_admin"],
//   "/salesman": ["super_admin", "owner_admin", "salesman"],
//   "/delivery": ["super_admin", "owner_admin", "delivery_boy"],
//   "/dashboard": ["super_admin", "owner_admin", "salesman", "delivery_boy"], // common dashboard
// };

// export async function middleware(request: NextRequest) {
//   const pathname = request.nextUrl.pathname;

//   // Get session token (JWT strategy)
//   const token = await getToken({
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET,
//   });

//   // If no token and trying to access protected route → redirect to login
//   if (!token) {
//     const loginUrl = new URL("/login", request.url);
//     loginUrl.searchParams.set("callbackUrl", pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   const userRole = token.role as string | undefined;

//   // Check if current path requires specific role
//   for (const [basePath, allowedRoles] of Object.entries(protectedRoutes)) {
//     if (pathname.startsWith(basePath)) {
//       if (!userRole || !allowedRoles.includes(userRole)) {
//         // Unauthorized — redirect to dashboard or login
//         return NextResponse.redirect(new URL("/unauthorized", request.url)); // ya /dashboard
//       }
//     }
//   }

//   // Allow access
//   return NextResponse.next();
// }

// // Matcher — apply middleware to these paths
// export const config = {
//   matcher: [
//     "/super-admin/:path*",
//     "/owner-admin/:path*",
//     "/salesman/:path*",
//     "/delivery/:path*",
//     "/dashboard/:path*",
//   ],
// };
