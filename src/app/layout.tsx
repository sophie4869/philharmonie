import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PaletteWrapper from "../components/PaletteWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Philharmonie de Paris Concert Tracker – Search, Calendar, Alerts",
  description: "A better way to explore concerts at the Philharmonie de Paris. Search, filter, view in calendar, export to .ics, and get notified when your favorite musicians perform.",
  openGraph: {
    title: "Philharmonie de Paris Concert Tracker",
    description: "Search, filter, and follow concerts at the Philharmonie. Calendar view, .ics export, and alerts.",
    url: "https://philharmonie.sophiebi.com",
    siteName: "Philharmonie de Paris Concert Tracker",
    images: [
      {
        url: "https://philharmonie.sophiebi.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Philharmonie de Paris Concert Tracker",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PaletteWrapper>{children}</PaletteWrapper>
      </body>
    </html>
  );
}
