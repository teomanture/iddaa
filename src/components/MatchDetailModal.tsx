"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, UserMinus, ShieldAlert, BarChart3 } from "lucide-react";
import type { Match } from "./MatchList";
import AiAnalysts from "./AiAnalysts";

interface MatchDetailModalProps {
    match: Match;
    onClose: () => void;
}

const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

const getForm = (team: string) => {
    const hash = getHash(team);
    const outcomes = ["G", "B", "M", "G", "M"];
    const colors = { G: "bg-accent/20 text-accent", B: "bg-gray-500/20 text-gray-400", M: "bg-red-500/20 text-red-400" };
    return Array.from({ length: 5 }).map((_, i) => {
        const res = outcomes[(hash + i) % 5];
        return { res, color: colors[res as keyof typeof colors] };
    });
};

const getInjuries = (team: string) => {
    const hash = getHash(team);
    const count = (hash % 3); // 0, 1, or 2 players
    if (count === 0) return "Eksik oyuncu bulunmuyor.";

    const positions = ["Defans", "Orta Saha", "Hücum", "Rotasyon"];
    const status = ["Sakat", "Sakat", "Şüpheli", "Cezalı"];

    let text = [];
    for (let i = 0; i < count; i++) {
        text.push(`1 ${positions[(hash + i) % positions.length]} Oyuncusu (${status[(hash + i) % status.length]})`);
    }
    return text.join(", ");
};

const getH2H = (home: string, away: string) => {
    const hash = getHash(home + away);
    return Array.from({ length: 5 }).map((_, i) => {
        const hScore = Math.floor(((hash + i) % 10) / 3);
        const aScore = Math.floor(((hash + i * 2) % 10) / 3);
        return { hScore, aScore };
    });
};

const generatePredictions = (match: Match) => {
    const p1 = parseFloat(match.rawOdds?.ms1 || "1.90");
    const pX = parseFloat(match.rawOdds?.msx || "3.20");
    const p2 = parseFloat(match.rawOdds?.ms2 || "2.80");

    const over25 = Math.max(1.10, (p1 + p2) * 0.45);
    const under25 = Math.max(1.10, (p1 + p2) * 0.55);
    const kgVar = Math.max(1.10, (p1 + p2) * 0.40);
    const over15 = Math.max(1.05, over25 * 0.7);
    const htOver05 = Math.max(1.05, over25 * 0.8);

    const clampProb = (odd: number) => {
        if (isNaN(odd) || odd <= 0) return 50;
        return Math.min(95, Math.max(10, Math.round((1 / odd) * 100)));
    };

    const uniquePreds = new Map<string, any>();
    const addPred = (title: string, odd: number) => {
        if (!uniquePreds.has(title)) {
            uniquePreds.set(title, { title, prob: clampProb(odd), odd: odd.toFixed(2) });
        }
    }
    addPred(match.topPick.title, parseFloat(match.topPick.odd));
    addPred("2.5 Gol Üstü", over25);
    addPred("2.5 Gol Altı", under25);
    addPred("Karşılıklı Gol Var", kgVar);
    addPred("1.5 Gol Üstü", over15);
    addPred("İlk Yarı 0.5 Üstü", htOver05);
    addPred("Maç Sonucu 1", p1);
    addPred("Maç Sonucu 2", p2);
    addPred("Maç Sonucu X", pX);
    addPred("Toplam Korner 8.5 Üst", 1.85);

    return Array.from(uniquePreds.values()).sort((a, b) => b.prob - a.prob).slice(0, 10);
};

export default function MatchDetailModal({ match, onClose }: MatchDetailModalProps) {
    const predictions = generatePredictions(match);

    // Close on outside click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleBackdropClick}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-surface-darker w-full max-w-4xl min-h-[60vh] max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl relative my-auto custom-scrollbar"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Modal Header / Match Info */}
                    <div className="relative p-6 md:p-10 border-b border-white/5 overflow-hidden">
                        {/* Ambient Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-[80px] -z-10"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] -z-10"></div>

                        <div className="flex flex-col items-center mb-6">
                            <span className="px-3 py-1 rounded-full bg-white/5 text-xs font-semibold text-brand-400 mb-6 border border-white/5 tracking-widest uppercase">
                                {match.league} • {match.time}
                            </span>

                            <div className="flex items-center justify-center w-full gap-4 md:gap-12">
                                <div className="flex-1 text-right">
                                    <h2 className="text-2xl md:text-4xl font-bold font-outfit text-white">{match.homeTeam}</h2>
                                    <p className="text-gray-400 text-sm mt-1">Ev Sahibi</p>
                                </div>

                                <div className="flex flex-col items-center justify-center px-4">
                                    <span className="text-gray-500 text-sm mb-1 font-medium">VS</span>
                                    <div className="w-12 h-12 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center shadow-lg">
                                        <Activity className="w-5 h-5 text-accent" />
                                    </div>
                                </div>

                                <div className="flex-1 text-left">
                                    <h2 className="text-2xl md:text-4xl font-bold font-outfit text-white">{match.awayTeam}</h2>
                                    <p className="text-gray-400 text-sm mt-1">Deplasman</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-10">
                        {/* Status & Form Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                            {/* Form Info */}
                            <div className="glass-panel p-5 rounded-2xl">
                                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-brand-500" /> Son 5 Maç Formu
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400 truncate w-1/3">{match.homeTeam}</span>
                                        <div className="flex gap-1">
                                            {getForm(match.homeTeam).map((f, i) => (
                                                <span key={i} className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${f.color}`}>{f.res}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400 truncate w-1/3">{match.awayTeam}</span>
                                        <div className="flex gap-1">
                                            {getForm(match.awayTeam).map((f, i) => (
                                                <span key={i} className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${f.color}`}>{f.res}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <h4 className="text-white font-semibold mt-6 mb-3 flex items-center gap-2 text-sm">
                                    Aralarındaki Son 5 Maç
                                </h4>
                                <div className="space-y-2">
                                    {getH2H(match.homeTeam, match.awayTeam).map((m, i) => (
                                        <div key={i} className="flex justify-between items-center text-xs text-gray-400 bg-white/5 p-2 rounded">
                                            <span className="truncate w-[40%] text-right">{match.homeTeam}</span>
                                            <span className="w-[20%] text-center font-bold text-white bg-black/20 py-1 rounded">{m.hScore} - {m.aScore}</span>
                                            <span className="truncate w-[40%] pl-2">{match.awayTeam}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Injuries */}
                            <div className="glass-panel p-5 rounded-2xl h-fit">
                                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <UserMinus className="w-4 h-4 text-red-400" /> Sakat & Cezalılar
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-2">
                                        <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="text-sm text-white block">{match.homeTeam}</span>
                                            <span className="text-xs text-gray-400">{getInjuries(match.homeTeam)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 pt-3 border-t border-white/5">
                                        <ShieldAlert className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                                        <div>
                                            <span className="text-sm text-white block">{match.awayTeam}</span>
                                            <span className="text-xs text-gray-400">{getInjuries(match.awayTeam)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top 10 Predictions */}
                        <h3 className="text-xl font-bold text-white mb-6 font-outfit">Yapay Zeka Olasılık Analizi</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                            {predictions.map((pred, idx) => {
                                // Determine color based on probability
                                let colorClass = "from-gray-600 to-gray-800 border-gray-600/30";
                                if (pred.prob >= 75) colorClass = "from-accent to-emerald-800 border-accent/40";
                                else if (pred.prob >= 60) colorClass = "from-brand-500 to-cyan-800 border-brand-500/40";
                                else if (pred.prob >= 50) colorClass = "from-yellow-500 to-orange-800 border-yellow-500/40";

                                return (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={idx}
                                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-surface-dark flex items-center justify-center font-bold text-white border border-white/10">
                                                {pred.odd}
                                            </div>
                                            <span className="text-gray-200 text-sm font-medium">{pred.title}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 rounded-full bg-surface-dark overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${colorClass}`}
                                                    style={{ width: `${pred.prob}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-white text-sm font-bold w-10 text-right">%{pred.prob}</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* AI Analysts Reviews */}
                        <AiAnalysts match={match} />
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
