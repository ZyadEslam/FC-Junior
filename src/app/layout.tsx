import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Giglet — Real skills. Real work. Family-funded.",
    template: "%s · Giglet",
  },
  description:
    "Giglet turns your child's screen time into skill time: curated coding missions, a parent-approved portfolio, and earnings funded by the family circle — never strangers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
