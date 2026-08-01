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
  title: "Nexa Agents - The Autonomous Agent Protocol",
  description:
    "Deploy, discover, and invest in autonomous AI agents on Solana. The platform for onchain intelligence.",
  icons: {
    icon: "/images/nexa/nexa-logo.png",
    apple: "/images/nexa/nexa-logo.png",
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
