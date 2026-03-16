"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Clock, AlertTriangle, Loader2, CalendarDays } from "lucide-react";
import MatchDetailModal from "./MatchDetailModal";

// Types
export interface Match {
    id: string;
    time: string;
    league: string;
    homeTeam: string;
    awayTeam: string;
    homeScore?: number;
    awayScore?: number;
    status: "not_started" | "live" | "finished";
    winChanceHome: number;
    winChanceDraw: number;
    winChanceAway: number;
    topPick: {
        title: string;
        percentage: number;
        odd: string;
    };
    rawOdds?: {
        ms1: string;
        msx: string;
        ms2: string;
    };
}

// Mock Data
export const mockMatches: Match[] = [
    {
        id: "m1",
        time: "20:00",
        league: "Türkiye Süper Lig",
        homeTeam: "Galatasaray",
        awayTeam: "Beşiktaş",
        status: "not_started",
        winChanceHome: 55,
        winChanceDraw: 25,
        winChanceAway: 20,
        topPick: { title: "MS 1", percentage: 55, odd: "1.90" }
    },
    {
        id: "m2",
        time: "22:00",
        league: "İngiltere Premier Lig",
        homeTeam: "Manchester City",
        awayTeam: "Arsenal",
        status: "not_started",
        winChanceHome: 45,
        winChanceDraw: 30,
        winChanceAway: 25,
        topPick: { title: "2.5 Üst", percentage: 68, odd: "1.65" }
    },
    {
        id: "m3",
        time: "21:45",
        league: "İtalya Serie A",
        homeTeam: "Inter",
        awayTeam: "Juventus",
        status: "not_started",
        winChanceHome: 50,
        winChanceDraw: 35,
        winChanceAway: 15,
        topPick: { title: "KG Var", percentage: 62, odd: "1.80" }
    },
    {
        id: "m4",
        time: "17:00",
        league: "Almanya Bundesliga",
        homeTeam: "B. Dortmund",
        awayTeam: "B. Leverkusen",
        status: "not_started",
        winChanceHome: 40,
        winChanceDraw: 20,
        winChanceAway: 40,
        topPick: { title: "2.5 Üst", percentage: 80, odd: "1.45" }
    },
    {
        id: "m5",
        time: "22:00",
        league: "İspanya La Liga",
        homeTeam: "Real Madrid",
        awayTeam: "Barcelona",
        status: "not_started",
        winChanceHome: 48,
        winChanceDraw: 24,
        winChanceAway: 28,
        topPick: { title: "MS 1", percentage: 48, odd: "2.10" }
    }
];

export default function MatchList() {
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await fetch('/api/matches');
                const data = await res.json();
                if (data.success && data.matches) {
                    setMatches(data.matches);
                } else {
                    setError("Maçlar yüklenemedi. Lütfen daha sonra tekrar deneyin.");
                }
            } catch (err) {
                setError("Bağlantı hatası oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    const getPercentageColor = (percentage: number) => {
        if (percentage >= 70) return "text-accent";
        if (percentage >= 50) return "text-brand-500";
        return "text-yellow-500";
    };

    if (loading) {
        return (
            <div className="glass-panel rounded-2xl p-12 flex flex-col items-center justify-center border border-white/10 shadow-2xl min-h-[400px]">
                <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
                <p className="text-gray-400 font-medium animate-pulse">iddaa.com'dan güncel bülten çekiliyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-panel rounded-2xl p-12 flex flex-col items-center justify-center border border-red-500/20 shadow-2xl min-h-[400px]">
                <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
                <p className="text-gray-300 font-medium">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors">
                    Tekrar Dene
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <h2 className="text-2xl font-bold text-white font-outfit flex items-center gap-3">
                    <CalendarDays className="text-brand-500 w-6 h-6" />
                    Günün Maçları
                </h2>
                {matches.length > 0 && (
                    <div className="text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-full glass-panel border border-white/5 font-medium">
                        Toplam <span className="text-brand-400 mx-1">{matches.length}</span> Maç Bulundu
                    </div>
                )}
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="grid grid-cols-12 gap-4 p-4 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-white/5 bg-white/5 hidden md:grid">
                    <div className="col-span-1">Saat</div>
                    <div className="col-span-3">Lig / Karşılaşma</div>
                    <div className="col-span-4 text-center">Yapay Zeka Taraf İhtimali</div>
                    <div className="col-span-4 text-center">Oranlar & Tahmin</div>
                </div>

                <div className="divide-y divide-white/5">
                    {matches.map((match, index) => (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={match.id}
                            onClick={() => setSelectedMatch(match)}
                            className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-5 items-center hover:bg-white/5 cursor-pointer transition-colors group relative overflow-hidden"
                        >
                            {/* Desktop Hover Indicator */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            {/* Time & Mobile Header */}
                            <div className="col-span-1 flex md:block items-center justify-between md:justify-start mb-2 md:mb-0">
                                <div className="flex items-center gap-2 text-gray-300 font-medium font-outfit">
                                    <Clock className="w-4 h-4 text-gray-500 md:hidden" />
                                    {match.time}
                                </div>
                                {/* Mobile top pick (hidden on larger screens, shown in its column) */}
                                <div className="md:hidden flex items-center gap-1 text-xs">
                                    <TrendingUp className="w-3 h-3 text-brand-500" />
                                    <span className={`${getPercentageColor(match.topPick.percentage)} font-bold`}>%{match.topPick.percentage}</span>
                                </div>
                            </div>

                            {/* League & Teams */}
                            <div className="col-span-3">
                                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
                                    {match.league}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="font-semibold text-white whitespace-nowrap">{match.homeTeam}</div>
                                    <div className="text-xs text-gray-500 px-1 bg-white/5 rounded">VS</div>
                                    <div className="font-semibold text-white whitespace-nowrap">{match.awayTeam}</div>
                                </div>
                            </div>

                            {/* AI Probability Bar (Desktop) */}
                            <div className="col-span-4 mt-3 md:mt-0">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-400">1 <span className="text-white font-medium ml-1">%{match.winChanceHome}</span></span>
                                    <span className="text-gray-400">X <span className="text-white font-medium ml-1">%{match.winChanceDraw}</span></span>
                                    <span className="text-gray-400">2 <span className="text-white font-medium ml-1">%{match.winChanceAway}</span></span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex">
                                    <div className="h-full bg-accent" style={{ width: `${match.winChanceHome}%` }}></div>
                                    <div className="h-full bg-gray-500" style={{ width: `${match.winChanceDraw}%` }}></div>
                                    <div className="h-full bg-brand-500" style={{ width: `${match.winChanceAway}%` }}></div>
                                </div>
                            </div>

                            {/* Top Pick & Labeled Odds (Desktop/Tablet) */}
                            <div className="col-span-4 flex flex-col items-center justify-center mt-3 md:mt-0 gap-2">
                                <div className="flex items-center gap-1.5 w-full justify-center">
                                    {/* MS 1 Box */}
                                    <div className={`flex flex-col items-center flex-1 max-w-[60px] rounded-lg border p-1 transition-all ${match.topPick.title === "MS 1" ? 'bg-green-500/20 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-white/5 border-white/10'}`}>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">1</span>
                                        <span className={`text-sm font-bold ${match.topPick.title === "MS 1" ? 'text-green-400' : 'text-white'}`}>{match.rawOdds?.ms1 || match.topPick.odd}</span>
                                    </div>

                                    {/* MS X Box */}
                                    <div className={`flex flex-col items-center flex-1 max-w-[60px] rounded-lg border p-1 transition-all ${match.topPick.title === "MS X" ? 'bg-green-500/20 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-white/5 border-white/10'}`}>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">X</span>
                                        <span className={`text-sm font-bold ${match.topPick.title === "MS X" ? 'text-green-400' : 'text-white'}`}>{match.rawOdds?.msx || "---"}</span>
                                    </div>

                                    {/* MS 2 Box */}
                                    <div className={`flex flex-col items-center flex-1 max-w-[60px] rounded-lg border p-1 transition-all ${match.topPick.title === "MS 2" ? 'bg-green-500/20 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'bg-white/5 border-white/10'}`}>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">2</span>
                                        <span className={`text-sm font-bold ${match.topPick.title === "MS 2" ? 'text-green-400' : 'text-white'}`}>{match.rawOdds?.ms2 || "---"}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-brand-500/10 ${getPercentageColor(match.topPick.percentage)}`}>
                                        {match.topPick.title} - %{match.topPick.percentage} Başarı
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="mt-4 flex items-center justify-center p-4 bg-brand-500/10 rounded-xl border border-brand-500/20 text-brand-300 text-sm gap-2">
                <AlertTriangle className="w-4 h-4" />
                <p>Tüm tahminler yapay zeka analizlerine dayanmaktadır, kesinlik içermez.</p>
            </div>

            {selectedMatch && (
                <MatchDetailModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
            )}
        </>
    );
}
