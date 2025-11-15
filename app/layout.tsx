// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Mi Tienda",
  description: "PCs armados",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="bg-neutral-950">
      <body className="bg-neutral-950 text-white">
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
