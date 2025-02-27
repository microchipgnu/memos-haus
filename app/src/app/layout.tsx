import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "memos",
  description: "your digital brain",
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
      >
        {children}
        <a href="https://aim.tools" target="_blank" rel="noopener noreferrer" className="fixed bottom-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-full text-sm">
            Powered by <span className="font-bold">AIM</span>
        </a>
      </body>
    </html>
  );
}
