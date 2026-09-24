import { Suspense } from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "DigitalMart — Premium Digital Products",
  description:
    "Buy premium digital products instantly. Fund your wallet and check out in seconds.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans">
        <Providers>
          <Suspense
            fallback={<div className="h-16 border-b border-slate-200/70 bg-white" />}
          >
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}