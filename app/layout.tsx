// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Mi Tienda",
  description: "PCs armados",
  // Si quieres, luego agrega:
  // metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://rekabytepc.vercel.app"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="bg-neutral-950">
      <body className="bg-neutral-950 text-white antialiased min-h-screen">
        <CartProvider>
          <Header />
          {/* un mínimo de alto para empujar el footer hacia abajo */}
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
