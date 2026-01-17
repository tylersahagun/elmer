import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { AuroraBackground } from "@/components/aurora";
import "./globals.css";

// Chillax Semibold - Display/Heading font
const chillax = localFont({
  src: "../../public/fonts/Chillax-Semibold.woff2",
  variable: "--font-chillax",
  display: "swap",
  weight: "600",
});

// Synonym Regular - Body font
const synonym = localFont({
  src: "../../public/fonts/Synonym-Regular.woff2",
  variable: "--font-synonym",
  display: "swap",
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PM Orchestrator",
  description: "AI-powered product management workflow orchestration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${chillax.variable} ${synonym.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <AuroraBackground className="fixed inset-0 -z-10" />
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
