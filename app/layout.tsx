import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CustomCursor } from "@/components/CustomCursor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CapyBot - Your AI Therapist",
  description: "Advanced AI-powered mental wellness companion with emotion detection and personalized therapy",
  keywords: "AI therapist, mental health, emotion detection, therapy bot, wellness",
  authors: [{ name: "CapyBot Team" }],
  openGraph: {
    title: "CapyBot - Your AI Therapist",
    description: "Advanced AI-powered mental wellness companion",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
