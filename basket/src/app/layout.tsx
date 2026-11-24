import type { Metadata, Viewport } from "next";
import { EVENT_TITLE } from "@/config";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: EVENT_TITLE,
  description: "Rekap dan pendaftaran peserta basket",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b0f17" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
