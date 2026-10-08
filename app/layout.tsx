import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FloatingBackground } from "./components/floating-background";
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
  title: "Prescripto | Care that feels personal",
  description: "Find trusted doctors and book thoughtful care on your terms.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <FloatingBackground />
        <div className="layout-content">{children}</div>
      </body>
    </html>
  );
}
