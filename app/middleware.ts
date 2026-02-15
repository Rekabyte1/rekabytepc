// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;

      // Deja pasar el login del admin
      if (pathname.startsWith("/admin/login")) return true;

      // Protege todo /admin
      if (pathname.startsWith("/admin")) {
        // Si no hay token => no autorizado
        if (!token) return false;

        // (Opcional) si quieres solo admins:
        // return (token as any).role === "ADMIN";

        return true; // cualquier usuario logueado
      }

      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*"],
};
