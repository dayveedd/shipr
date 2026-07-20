import type { Metadata } from "next";
import { Urbanist, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

export const metadata: Metadata = {
  title: "ShipR — Execution Pays. Excuses Don't.",
  description:
    "AI-powered execution platform where developers commit funds, ship real code, AI evaluates proof of work, and successful builders earn rewards from the Commitment Pool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${urbanist.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-background text-text-primary antialiased min-h-screen flex flex-col selection:bg-brand-emerald/30 selection:text-brand-emerald font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
