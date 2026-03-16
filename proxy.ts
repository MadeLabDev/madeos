import { auth } from "@/lib/auth";
import { findProtection } from "@/lib/config/route-protection";

/**
 * Check if user has permission for a module and action
 */
function hasPermission(
  userPermissions: Record<string, string[]> | undefined,
  module: string,
  action: string
): boolean {
  if (!userPermissions) return false;

  const modulePermissions = userPermissions[module];
  if (!modulePermissions) return false;

  return modulePermissions.includes(action);
}

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  "/auth/signin",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/activate",
];

const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

/**
 * Main auth middleware with permission checking
 */
export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const { pathname } = req.nextUrl;

  // ====================
  // STEP 1: Authentication Check
  // ====================

  // If not authenticated and trying to access protected route
  if (!isAuthenticated && !isPublicRoute(pathname)) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(signInUrl);
  }

  // If authenticated and trying to access auth pages
  if (isAuthenticated && isPublicRoute(pathname)) {
    return Response.redirect(new URL("/dashboard", req.url));
  }

  // Redirect root to course for authenticated users
  if (isAuthenticated && pathname === "/") {
    return Response.redirect(new URL("/dashboard", req.url));
  }

  // Redirect /dashboard to /course for authenticated users
  // if (isAuthenticated && pathname === "/dashboard") {
  //   return Response.redirect(new URL("/course/print-hustlers-2025", req.url));
  // }

  // ====================
  // STEP 2: Permission Check (only for authenticated users)
  // ====================
  if (!isAuthenticated) {
    return;
  }

  // Skip permission check for dashboard and unprotected routes
  if (pathname === "/dashboard" || !findProtection(pathname)) {
    return;
  }

  // Find the protection config for this route
  const protection = findProtection(pathname);
  if (!protection) {
    return; // Route not protected, allow access
  }

  // Get user permissions from session
  const userPermissions = req.auth?.user?.permissions as Record<string, string[]> | undefined;

  // Check if user has required permission
  const hasAccess = hasPermission(userPermissions, protection.module, protection.action);

  if (!hasAccess) {
    // Redirect to access denied page with info
    const accessDeniedUrl = new URL("/access-denied", req.url);
    accessDeniedUrl.searchParams.set("pathname", pathname);
    accessDeniedUrl.searchParams.set("module", protection.module);
    accessDeniedUrl.searchParams.set("action", protection.action);
    return Response.redirect(accessDeniedUrl);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
