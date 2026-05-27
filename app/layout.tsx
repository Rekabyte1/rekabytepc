// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import Providers from "./providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "RekaByte",
  description: "Teclados magnéticos, Mouse gamer y periféricos premium en Chile",
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
      <body
        className={`${inter.variable} ${sora.variable} min-h-screen bg-neutral-950 text-white antialiased overflow-x-hidden`}
      >
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