import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Grow Youth Check-in", description: "Check-in ibadah Grow Youth" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b0f17" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-dvh antialiased">
        <main className="mx-auto w-full max-w-md px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
