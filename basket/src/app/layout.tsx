import type { Metadata, Viewport } from "next";
import { EVENT_TITLE } from "@/config";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: EVENT_TITLE,
  description: "Basket Registration: lihat siapa yang sudah daftar dan daftar sekarang.",
  openGraph: {
    title: EVENT_TITLE,
    description: "Basket Registration: lihat siapa yang sudah daftar dan daftar sekarang.",
    images: [{ url: "/bg/1.jpg", width: 640, height: 520 }],
    locale: "id_ID",
    type: "website",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b0f17" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
