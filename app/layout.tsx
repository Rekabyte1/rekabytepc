// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import Providers from "./providers";
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
  title: "RekaByte",
  description: "PCs armados",
  metadataBase: new URL("https://www.rekabyte.cl"),
  alternates: {
    canonical: "https://www.rekabyte.cl",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full bg-neutral-950">
      <body className="min-h-screen bg-neutral-950 text-white antialiased overflow-x-hidden">
        <Providers>
          <Header />

          <main data-mobile-fix="1" className="min-h-[60vh]">
            {children}
          </main>

          <Footer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
