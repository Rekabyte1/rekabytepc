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
  // metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://rekabytepc.vercel.app"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full bg-neutral-950">
      <body className="min-h-screen bg-neutral-950 text-white antialiased overflow-x-hidden">
        <CartProvider>
          <Header />

          {/* Marca para que los fixes móviles del CSS se apliquen dentro de main */}
          <main data-mobile-fix="1" className="min-h-[60vh]">
            {children}
          </main>

          <Footer />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
