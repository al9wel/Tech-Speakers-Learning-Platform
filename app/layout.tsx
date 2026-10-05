import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { NavigationProgressBar } from "@/components/NavigationProgressBar";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "مِداد | المنصة التعليمية اليمنية",
  description: "منصة تعليمية يمنية شاملة للطلاب والمعلمين والمستشارين والمشرفين",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="min-h-screen bg-cream text-ink-900 font-sans antialiased flex flex-col selection:bg-gold/30 selection:text-ink-900">
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        <Navbar />
        <div className="flex-1">{children}</div>
        <Toaster />
      </body>
    </html>
  );
}
