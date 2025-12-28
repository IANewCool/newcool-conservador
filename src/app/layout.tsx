import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Conservador Bienes Raices Chile | NewCooltura Informada",
  description: "Calculadora de aranceles, buscador de conservadores de bienes raices y guia de tramites en Chile",
  keywords: ["conservador bienes raices", "aranceles CBR", "inscripcion propiedad", "certificado dominio"],
  openGraph: {
    title: "Conservador Bienes Raices - NewCooltura Informada",
    description: "Aranceles y tramites en conservadores",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
