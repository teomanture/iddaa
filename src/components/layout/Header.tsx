"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, CalendarDays, Award, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: "Günün Maçları", href: "#matches", icon: CalendarDays },
        { name: "Yapay Zeka Analizi", href: "#analysis", icon: TrendingUp },
        { name: "Günün Kuponları", href: "#coupons", icon: Award },
    ];

    return (
        <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all duration-300">
                        <TrendingUp className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 font-outfit tracking-wide">
                        Maç Kâhini
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${isActive
                                    ? "text-accent"
                                    : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Action Button */}
                <div className="hidden md:flex items-center gap-4">
                    <button className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all border border-white/10 hover:border-white/20">
                        Giriş Yap
                    </button>
                    <button className="px-5 py-2 rounded-full bg-gradient-to-r from-brand-600 to-accent hover:from-brand-500 hover:to-accent-hover text-white text-sm font-medium shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
                        Premium Üye Ol
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-gray-300 hover:text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-white/10 bg-surface-darker/95 backdrop-blur-xl"
                    >
                        <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                const Icon = link.icon;

                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive
                                            ? "bg-brand-500/10 text-brand-400"
                                            : "text-gray-300 hover:bg-white/5"
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{link.name}</span>
                                    </Link>
                                );
                            })}

                            <div className="h-px bg-white/10 my-2"></div>

                            <button className="w-full p-3 rounded-xl bg-white/5 text-white font-medium text-center">
                                Giriş Yap
                            </button>
                            <button className="w-full p-3 rounded-xl bg-gradient-to-r from-brand-600 to-accent text-white font-medium text-center">
                                Premium Üye Ol
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
