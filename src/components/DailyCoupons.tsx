"use client";

import { useEffect, useState } from "react";
import {
    Shield,
    Zap,
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Loader2,
    Info
} from "lucide-react";
import { motion } from "framer-motion";
import type { Match } from "./MatchList";

interface Coupon {
    id: string;
    type: string;
    title: string;
    description: string;
    icon: any;
    colorClass: string;
    borderColorClass: string;
    shadowClass: string;
    totalOdds: string;
    winChance: string;
    matches: {
        home: string;
        away: string;
        pick: string;
        odd: string;
    }[];
}

const generateCoupons = (matches: Match[]): Coupon[] => {
    const validMatches = matches.filter(m => {
        const o = parseFloat(m.topPick.odd);
        return !isNaN(o) && o > 1.0;
    });
    const sorted = [...validMatches].sort((a, b) => parseFloat(a.topPick.odd) - parseFloat(b.topPick.odd));

    const tierSize = Math.max(9, Math.floor(sorted.length / 3));

    // We try to take enough matches from each tier if possible
    const safePool = sorted.slice(0, tierSize);
    const profitPool = sorted.slice(tierSize, tierSize * 2).length >= 9 ? sorted.slice(tierSize, tierSize * 2) : sorted;
    const surprisePool = sorted.slice(tierSize * 2).length >= 9 ? sorted.slice(tierSize * 2) : sorted;

    const shuffle = (array: any[]) => {
        let currentIndex = array.length;
        while (currentIndex != 0) {
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    };

    const createBatch = (pool: Match[], type: string, titlePrefix: string, desc: string, icon: any, colorClass: string, borderClass: string, shadowClass: string, winChanceArr: string[], minOdds: number, maxOdds: number) => {
        const batch: Coupon[] = [];

        // Function to find 2 or 3 matches that satisfy the total odds bounds
        const findMatchesWithinBounds = (matchesPool: Match[], minO: number, maxO: number): any => {
            let attempts = 0;
            const maxAttempts = 2000;

            while (attempts < maxAttempts) {
                const shuffled = shuffle([...matchesPool]);
                
                // For "solid" category, try 2 matches if targets are low, otherwise try 3
                const matchCount = (type === "solid" && attempts > 500) ? 2 : 3;
                const selected = shuffled.slice(0, matchCount);
                if (selected.length < 2) return null;

                const mapped = selected.map(m => {
                    let pick = m.topPick.title;
                    let oddNum = parseFloat(m.topPick.odd);

                    if (type === "surprise") {
                        const obs = [
                            { t: "MS 1", o: parseFloat(m.rawOdds?.ms1 || "3.0") },
                            { t: "MS X", o: parseFloat(m.rawOdds?.msx || "3.0") },
                            { t: "MS 2", o: parseFloat(m.rawOdds?.ms2 || "3.0") }
                        ].sort((a, b) => b.o - a.o);
                        pick = obs[0].t;
                        oddNum = obs[0].o;
                    }

                    return {
                        home: m.homeTeam,
                        away: m.awayTeam,
                        pick: pick,
                        odd: oddNum
                    };
                });

                const totalOddNum = mapped.reduce((acc, m) => acc * m.odd, 1);

                if (totalOddNum >= minO && totalOddNum <= maxO) {
                    return { mapped, total: totalOddNum };
                }
                attempts++;
            }
            return null;
        }

        for (let i = 0; i < 3; i++) {
            let result = findMatchesWithinBounds(pool, minOdds, maxOdds);

            // Fallback to broader pool if the restricted tier pool cannot form a combination
            if (!result) {
                result = findMatchesWithinBounds(validMatches, minOdds, maxOdds);
            }

            // Absolute fallback if everything fails (extreme cases)
            if (!result) {
                const bestEffort = shuffle([...validMatches]).slice(0, 2);
                result = {
                    mapped: bestEffort.map(m => ({
                        home: m.homeTeam, away: m.awayTeam, pick: m.topPick.title, odd: parseFloat(m.topPick.odd)
                    })),
                    total: bestEffort.reduce((acc, m) => acc * parseFloat(m.topPick.odd), 1)
                }
            }

            batch.push({
                id: `${type}-${i + 1}`,
                type: type,
                title: `${titlePrefix} ${i + 1}`,
                description: desc,
                icon,
                colorClass,
                borderColorClass: borderClass,
                shadowClass,
                totalOdds: result.total.toFixed(2),
                winChance: winChanceArr[i % winChanceArr.length],
                matches: result.mapped.map((m: any) => ({ ...m, odd: m.odd.toFixed(2) }))
            });
        }
        return batch;
    };

    // Limits configured as requested
    const safeCoupons = createBatch(safePool, "solid", "Sağlam Kupon", "Düşük risk, yüksek ihtimal.", Shield, "text-accent", "border-t-accent", "shadow-[0_4px_20px_rgba(16,185,129,0.15)]", ["%85", "%82", "%88"], 1.80, 3.00);

    const profitCoupons = createBatch(profitPool, "profitable", "Kazançlı Kupon", "Dengeli risk ve tatmin edici oran.", Zap, "text-brand-500", "border-t-brand-500", "shadow-[0_4px_20px_rgba(6,182,212,0.15)]", ["%65", "%60", "%68"], 3.01, 6.00);

    const surpCoupons = createBatch(surprisePool, "surprise", "Sürpriz Kupon", "Yüksek kazanç hedefleyen cesur tercihler.", AlertCircle, "text-purple-500", "border-t-purple-500", "shadow-[0_4px_20px_rgba(168,85,247,0.15)]", ["%25", "%30", "%20"], 6.01, 500.00);

    // Filter out potential duplicates or nulls if any, and ensure we have coupons to show
    const all = [...safeCoupons, ...profitCoupons, ...surpCoupons];
    return all;
};

export default function DailyCoupons() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("solid");

    useEffect(() => {
        const fetchMatchesAndGenerateCoupons = async () => {
            try {
                const res = await fetch('/api/matches');
                const data = await res.json();
                if (data.success && data.matches && data.matches.length >= 3) {
                    setCoupons(generateCoupons(data.matches));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMatchesAndGenerateCoupons();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 bg-white/5 rounded-2xl glass-panel">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin mr-3" />
                <span className="text-gray-400">Yapay Zeka Kuponları Oluşturuluyor...</span>
            </div>
        );
    }

    if (coupons.length === 0) {
        return null;
    }

    const tabs = [
        { id: "solid", label: "Sağlam Kuponlar", icon: Shield, color: "text-accent", border: "border-accent", bg: "bg-accent/10" },
        { id: "profitable", label: "Kazançlı Kuponlar", icon: Zap, color: "text-brand-500", border: "border-brand-500", bg: "bg-brand-500/10" },
        { id: "surprise", label: "Sürpriz Kuponlar", icon: AlertCircle, color: "text-purple-500", border: "border-purple-500", bg: "bg-purple-500/10" },
    ];

    const activeCoupons = coupons.filter(c => c.type === activeTab);

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex flex-wrap gap-3 mb-8 border-b border-white/5 pb-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-outfit font-bold border-b-2 ${isActive
                                ? `${tab.bg} ${tab.color} ${tab.border} shadow-[0_4px_20px_rgba(0,0,0,0.2)]`
                                : `bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-white`
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "" : "opacity-70"}`} />
                            {tab.label}
                            {isActive && <span className="ml-2 px-2 py-0.5 rounded-full bg-white/10 text-xs">3</span>}
                        </button>
                    );
                })}
            </div>

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activeCoupons.map((coupon, index) => {
                    const Icon = coupon.icon;
                    return (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            key={coupon.id}
                            className={`glass-panel rounded-2xl p-6 border-t-4 ${coupon.borderColorClass} ${coupon.shadowClass} relative overflow-hidden group hover:bg-surface-dark transition-all duration-300`}
                        >
                            {/* Ambient Background Glow for cards */}
                            <div className={`absolute -right-20 -top-20 w-40 h-40 rounded-full blur-[80px] bg-white opacity-5 transition-opacity group-hover:opacity-10 pointer-events-none`}></div>

                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2 font-outfit">
                                    <Icon className={`w-5 h-5 ${coupon.colorClass}`} /> {coupon.title}
                                </h3>
                                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded border border-white/5 text-xs text-white">
                                    <CheckCircle2 className={`w-3 h-3 ${coupon.colorClass}`} />
                                    {coupon.winChance}
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm mb-6">{coupon.description}</p>

                            <div className="space-y-3 mb-6 relative z-10">
                                {coupon.matches.map((match, i) => (
                                    <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col gap-2 group/match hover:bg-white/10 transition-colors">
                                        <div className="flex justify-between items-center text-sm font-medium text-gray-200">
                                            <span className="truncate pr-2">{match.home}</span>
                                            <span className="text-gray-500 text-xs">vs</span>
                                            <span className="truncate pl-2 text-right">{match.away}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-white/5 pt-2 mt-1">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded bg-white/5 ${coupon.colorClass}`}>{match.pick}</span>
                                            <span className="text-white font-bold">{match.odd}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/10 relative z-10">
                                <div className="flex flex-col">
                                    <span className="text-gray-400 text-xs uppercase tracking-wider mb-1">Toplam Oran</span>
                                    <span className={`text-2xl font-bold font-outfit ${coupon.colorClass}`}>{coupon.totalOdds}</span>
                                </div>
                                <button className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white transition-transform group-hover:translate-x-1`}>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            {/* Alttaki Bilgilendirme Notu */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12 flex items-center justify-center p-6 glass-panel rounded-2xl border border-white/5 text-gray-400 text-sm gap-3 max-w-3xl mx-auto shadow-xl"
            >
                <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center flex-shrink-0 border border-brand-500/20">
                    <Info className="w-5 h-5 text-brand-400" />
                </div>
                <p className="leading-relaxed">
                    <span className="text-brand-400 font-semibold">Bilgilendirme:</span> Bu sayfadaki tüm bahis oranları <span className="text-white">iddaa.com</span> resmi web sitesinden anlık olarak alınmaktadır. Oranlar, tercih ettiğiniz diğer bahis platformlarında veya bayilerde farklılıklar gösterebilir.
                </p>
            </motion.div>
        </div>
    );
}
