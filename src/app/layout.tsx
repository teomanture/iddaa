import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Maç Kâhini | Profesyonel Yapay Zeka İddaa Tahminleri",
  description: "Yapay zeka analizleriyle günlük sağlam, kazançlı ve sürpriz iddaa tahminleri, detaylı maç analizleri.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className={`${inter.variable} ${outfit.variable} antialiased min-h-screen flex flex-col font-sans`}>
        {/* Background Ambient Glows */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/10 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px]"></div>
        </div>

        <Header />
        <main className="flex-grow pt-8 pb-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
