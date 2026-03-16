"use client";

import { motion } from "framer-motion";
import { TrendingUp, CheckCircle2, Award, Users } from "lucide-react";

export default function SuccessStats() {
    const stats = [
        {
            label: "Dünkü Başarı Oranı",
            value: "%84",
            sub: "9/11 Kupon Kazandı",
            icon: TrendingUp,
            color: "text-accent",
            bg: "bg-accent/10"
        },
        {
            label: "Haftalık Kazanç",
            value: "24.5 Oran",
            sub: "Toplam Tahmin",
            icon: Award,
            color: "text-brand-500",
            bg: "bg-brand-500/10"
        },
        {
            label: "Aktif Kullanıcı",
            value: "1,240+",
            sub: "Bugün Analiz Alan",
            icon: Users,
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={index}
                        className="glass-panel rounded-2xl p-6 border border-white/5 relative overflow-hidden group hover:bg-white/5 transition-colors"
                    >
                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${stat.bg} blur-2xl opacity-50 group-hover:opacity-70 transition-opacity`}></div>
                        
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-lg`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className={`text-2xl font-bold font-outfit ${stat.color}`}>{stat.value}</h3>
                                    <span className="text-[10px] text-gray-500 font-bold">{stat.sub}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
