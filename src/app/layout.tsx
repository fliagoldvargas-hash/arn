import type { Metadata } from "next";
import { Lora, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Any Pair - Pair Anything on Solana",
  description:
    "Launch Solana memecoins on Pump.fun, then pair them with crypto, tokenized stocks, commodities, indexes, and more.",
  icons: {
    icon: "/images/vanta/vanta-logo.png",
    apple: "/images/vanta/vanta-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} ${spaceGrotesk.variable} ${lora.variable}`}>
        {children}
      </body>
    </html>
  );
}
