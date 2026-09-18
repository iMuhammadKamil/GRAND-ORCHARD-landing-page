import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const SITE_URL = "https://grandorchard.example.com"; // replace with official domain when available

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Grand Orchard | DHA Phase I Islamabad",
  description:
    "Grand Orchard by Premier Choice International — a commercial & residential development at DHA Orchard, DHA Phase I, Islamabad. 1,000,000 sq.ft project area, 4 commercial floors, 4 basement parking floors + G + 18 structure, with the announced Hilton Garden Inn at Tower A. Explore official amenities and listed rates.",
  keywords: [
    "Grand Orchard",
    "DHA Orchard",
    "DHA Phase I Islamabad",
    "Premier Choice International",
    "commercial and residential Islamabad",
    "Orchard Boulevard",
  ],
  openGraph: {
    title: "Grand Orchard | A Premium Address for Modern Vertical Living",
    description:
      "Commercial & Residential · DHA Orchard, DHA Phase I, Islamabad. 1,000,000 sq.ft development by Premier Choice International.",
    url: SITE_URL,
    siteName: "Grand Orchard",
    type: "website",
    locale: "en_PK",
    images: [
      {
        url: "/images/hero-elevation.png",
        width: 1440,
        height: 720,
        alt: "Grand Orchard elevation — terraced residential and commercial architecture at DHA Phase I, Islamabad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grand Orchard | DHA Phase I Islamabad",
    description:
      "Commercial & Residential · DHA Orchard, DHA Phase I, Islamabad. Official project overview, amenities and listed rates.",
    images: ["/images/hero-elevation.png"],
  },
  icons: {
    icon: "/icon.svg",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#16130f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${cormorant.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
