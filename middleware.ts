import { NextRequest, NextResponse } from "next/server";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

/**
 * Middleware global para proteger rutas de admin.
 * - Si no hay cookie admin_session válida => redirige a /admin/login
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Solo nos interesan rutas /admin y /api/admin
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  if (!isAdminRoute && !isAdminApiRoute) {
    return NextResponse.next();
  }

  // Permitimos el login y logout sin cookie
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/api/admin/login") ||
    pathname.startsWith("/api/admin/logout")
  ) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get("admin_session")?.value;

  if (cookie && ADMIN_TOKEN && cookie === ADMIN_TOKEN) {
    // Cookie válida => pasa
    return NextResponse.next();
  }

  // Sin cookie o inválida => redirigimos a login
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("from", pathname); // para volver después de loguearse
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
