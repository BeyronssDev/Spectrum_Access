import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Accessibilitat sensorial",
  description: "Plataforma oberta d'accessibilitat sensorial per a persones autistes."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ca">
      <body>{children}</body>
    </html>
  );
}
