// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "admin_token";

function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return !!token && !!process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN;
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const { pathname, searchParams } = req.nextUrl;

  // 0) Forzar dominio público: cualquier *.vercel.app -> www.rekabyte.cl
  // (No borres rekabyte.vercel.app en Vercel; solo redirige.)
  if (host.includes("vercel.app")) {
    const url = req.nextUrl.clone();
    url.hostname = "www.rekabyte.cl";
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }

  // 1) Proteger API admin, EXCEPTO el login
  if (pathname.startsWith("/api/admin") && pathname !== "/api/admin/login") {
    if (!isAdmin(req)) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // 2) Rutas /admin/*
  if (pathname.startsWith("/admin")) {
    // a) Si ya está logueado y viene a /admin/login => redirigir al panel
    if (pathname === "/admin/login") {
      if (isAdmin(req)) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin/pedidos";
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }

    // b) Cualquier otra ruta /admin requiere login
    if (!isAdmin(req)) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set(
        "from",
        pathname + (searchParams.size ? `?${searchParams.toString()}` : "")
      );
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // Resto del sitio
  return NextResponse.next();
}

// IMPORTANTE:
// Como queremos redirigir vercel.app en todo el sitio, el matcher debe incluir "/:path*"
export const config = {
  matcher: ["/:path*", "/admin/:path*", "/api/admin/:path*"],
};
