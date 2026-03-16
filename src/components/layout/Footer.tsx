import Link from "next/link";
import { TrendingUp, Twitter, Instagram, Disc as Discord, Shield, FileText } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-20 border-t border-white/10 glass-panel-heavy bg-surface-darker/80 relative overflow-hidden">
            {/* Footer Ambient Light */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-brand-500/50 to-transparent"></div>

            <div className="container mx-auto px-4 py-12 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Brand Info */}
                    <div className="col-span-1 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 group mb-6">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent">
                                <TrendingUp className="text-white w-5 h-5" />
                            </div>
                            <span className="text-lg font-bold text-white font-outfit">
                                Maç Kâhini
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Yapay zeka analizleriyle günlük iddaa bültenindeki maçları yorumluyoruz. En iyi oranlar ve kazanma ihtimali yüksek kuponlar için profesyonel rehberiniz.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:-translate-y-1 transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:-translate-y-1 transition-all">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:-translate-y-1 transition-all">
                                <Discord className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-6 tracking-wider text-sm uppercase">Hızlı Linkler</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/" className="text-gray-400 hover:text-accent transition-colors text-sm flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-accent transition-colors"></span>
                                    Günün Maçları
                                </Link>
                            </li>
                            <li>
                                <Link href="/analiz" className="text-gray-400 hover:text-accent transition-colors text-sm flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-accent transition-colors"></span>
                                    Yapay Zeka Yorumları
                                </Link>
                            </li>
                            <li>
                                <Link href="/kuponlar" className="text-gray-400 hover:text-accent transition-colors text-sm flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-accent transition-colors"></span>
                                    Hazır Kuponlar
                                </Link>
                            </li>
                            <li>
                                <Link href="/istatistikler" className="text-gray-400 hover:text-accent transition-colors text-sm flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-accent transition-colors"></span>
                                    Başarı İstatistikleri
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-semibold mb-6 tracking-wider text-sm uppercase">Yasal Uyarı</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/kullanim" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Kullanım Şartları
                                </Link>
                            </li>
                            <li>
                                <Link href="/gizlilik" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Gizlilik Politikası
                                </Link>
                            </li>
                            <li className="text-xs text-gray-500 leading-relaxed mt-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                Dikkat: Maç Kâhini bir bahis oynatma platformu değildir. Sadece istatistiksel ve yapay zeka destekli maç tahminleri sunar. 18 yaşından küçüklerin bahis oynaması yasaktır.
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom */}
                <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">
                        &copy; {currentYear} Maç Kâhini. Tüm hakları saklıdır.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                        </span>
                        <span className="text-xs text-gray-400">Sistemaktif & Güncel</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
