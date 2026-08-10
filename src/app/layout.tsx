import type { Metadata, Viewport } from "next";
import { Geist, Fraunces } from "next/font/google";
import { PALETTE } from "@/lib/palette";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Ditirambo",
  description:
    "Reseñas y recomendaciones privadas de cine, libros, música, ópera y arte.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ditirambo",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: PALETTE.uiPrimary,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
