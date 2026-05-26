import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StockTicker } from "@/components/StockTicker";
import { BackgroundLayer } from "@/components/BackgroundLayer";
import { AutoRefresh } from "@/components/AutoRefresh";
import { getStocks } from "@/lib/stocks";

// Removed BurnInGuard import, kept ScreenWipe
import { ScreenWipe } from "@/components/ScreenWipe";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daylight Dashboard",
  description: "Family Dashboard",
};

export const revalidate = 300;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const stocks = await getStocks();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-white`}
        style={{ backgroundColor: '#0B1121', minHeight: '100vh' }}
      >
        <AutoRefresh />
        <BackgroundLayer />
        
        {/* The ScreenWipe sits here so it can overlay EVERYTHING (z-index 9999) */}
        <ScreenWipe />

        <div className="relative z-10">
          {/* Removed BurnInGuard wrapper. Content is now static. */}
          {children}
        </div>

        <StockTicker items={stocks} />
      </body>
    </html>
  );
}