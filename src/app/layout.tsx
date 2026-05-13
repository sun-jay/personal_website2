import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif, Pinyon_Script } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const pinyonScript = Pinyon_Script({
  variable: "--font-pinyon-script",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "sunny-jay.com",
  description: "sunny-jay.com",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Kick off the background-video download during HTML parse, before any
            JS has run. Pairs with the hidden <video preload="auto"> on the
            homepage so the bytes are cached well before the card mounts. */}
        <link rel="preload" as="video" type="video/mp4" href="/alt.mp4" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${pinyonScript.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
