import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers";
import { GridBackground } from "@/components/backgrounds";
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
  title: "elmer",
  description: "AI-powered product management workflow orchestration",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
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
        <ThemeProvider>
          <GridBackground />
          <div className="relative z-10 min-h-screen">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
