import type { Metadata } from "next";
import type { Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spectrum Access",
  description: "Spectrum Access: plataforma oberta per a persones autistes.",
  icons: {
    icon: [{ url: "/brand/accessibilitat-logo.svg", type: "image/svg+xml" }]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ca">
      <body>{children}</body>
    </html>
  );
}
