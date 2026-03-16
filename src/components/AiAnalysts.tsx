"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Sparkles, AlertCircle } from "lucide-react";
import type { Match } from "./MatchList";

interface AiAnalystsProps {
    match: Match;
}

const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

export default function AiAnalysts({ match }: AiAnalystsProps) {
    const { homeTeam: matchHome, awayTeam: matchAway, winChanceHome, winChanceAway, winChanceDraw } = match;
    const hash = getHash(matchHome + matchAway);

    const xgHome = (1.2 + (hash % 15) / 10).toFixed(1);
    const xgAway = (0.8 + (hash % 10) / 10).toFixed(1);
    const cardProb = 30 + (hash % 25);

    // Determine Match Type Strategy
    let matchType = "balanced";
    if (winChanceHome > 55) matchType = "home_heavy";
    else if (winChanceAway > 55) matchType = "away_heavy";
    else if (winChanceHome > winChanceAway && winChanceHome - winChanceAway > 10) matchType = "home_slight";
    else if (winChanceAway > winChanceHome && winChanceAway - winChanceHome > 10) matchType = "away_slight";

    // Dynamic Analyst 1 (Data Driven)
    let an1p1 = "";
    let an1p2 = "";
    let focus1 = "";

    if (matchType === "home_heavy") {
        an1p1 = `İstatistiksel modellerimiz ${matchHome} takımının bu maçta mutlak favori olduğunu gösteriyor. İç sahada maç başına ${xgHome} xG (beklenen gol) ortalamaları var.`;
        an1p2 = `${matchAway} savunmasının bu ofansif güce direnecek kapasitesi verilerde görünmüyor. Ev sahibi maça hızlı başlayıp fişi erken çekecektir.`;
        focus1 = `İlk Yarı Ev Sahibi 0.5 Üst (İhtimal: %${Math.min(95, winChanceHome + 10)})`;
    } else if (matchType === "away_heavy") {
        an1p1 = `Oyun gücü analizi ${matchAway} ekibinin kağıt üzerinde çok daha ağır bastığını kanıtlıyor. Deplasman olmalarına rağmen pozisyon üretimleri (${xgAway} xG) çok yüksek.`;
        an1p2 = `${matchHome} takımının kendi evinde oynamak dışında istatistiksel bir avantajı belirmiyor. Topa sahip olma oranında büyük fark bekliyoruz.`;
        focus1 = `Maç Sonucu 2 (İhtimal: %${winChanceAway})`;
    } else if (matchType === "home_slight") {
        an1p1 = `${matchHome} taraftar avantajıyla bir adım önde görünse de, veriler bize kopuk bir maç vadetmiyor. İki takımın orta saha dirençleri birbirine yakın.`;
        an1p2 = `${matchAway} kontra ataklarda etkili olabilir ancak ev sahibinin son haftalardaki pas organizasyonları skoru belirleyecek ana etken olacak.`;
        focus1 = `Maç Sonucu 1 veya Karşılıklı Gol Var`;
    } else if (matchType === "away_slight") {
        an1p1 = `${matchAway} takımının kadro kalitesi ibreyi hafifçe onlara döndürüyor ancak deplasman faktörü işlerini zorlaştıracak.`;
        an1p2 = `Isı haritalarına göre maçın büyük bölümü orta alanda kilitlenebilir. Skoru bireysel yetenekler veya duran toplar belirleyecektir.`;
        focus1 = `Maç Sonucu X2 Çifte Şans & 1.5 Üst`;
    } else {
        an1p1 = `Algoritmamız bu karşılaşmada tam bir denge tespit etti. Her iki takımın da galibiyet yüzdeleri birbirine çok yakın (Ev: %${winChanceHome}, Dep: %${winChanceAway}).`;
        an1p2 = `Karşılıklı form durumları ve xG üretimleri örtüşüyor. Taktiksel bir satranç maçı izleme olasılığımız yüksek, pozisyon kısırlığı yaşanabilir.`;
        focus1 = `İlk Yarı Maç Sonucu X (İhtimal: %${Math.min(95, winChanceDraw + 15)})`;
    }

    // Dynamic Analyst 2 (Surprise/Value Driven)
    let an2p1 = "";
    let an2p2 = "";
    let focus2 = "";

    if (matchType === "home_heavy") {
        an2p1 = `Herkes ${matchHome} takımının kolay bir galibiyet alacağını bekliyor ve oranlar dip yapmış durumda. Burada doğrudan taraf bahsi oynamakta hiçbir değer (value) görmüyorum.`;
        an2p2 = `${matchAway} kapanan bir savunma kurgusuyla çıkarsa maç kilitlenebilir. Psikolojik olarak favorinin stres yapacağı dakikaları beklemek daha mantıklı.`;
        focus2 = `İlk Yarı 1.5 Gol Altı (Değerli Oran)`;
    } else if (matchType === "away_heavy") {
        an2p1 = `Deplasman ekibi ${matchAway} bariz favori gösterilse de, ev sahibi ${matchHome} takımının seyircisi önündeki reaksiyon ihtimalini atlamamalıyız.`;
        an2p2 = `Hakem istatistiklerine göre maçta gerginlik yaşanma olasılığı %${cardProb}. Sürpriz arayanlar için ev sahibinin direneceği senaryolar tatminkar.`;
        focus2 = `Ev Sahibi Kaybetmez (1X Çifte Şans) & KG Var`;
    } else if (matchType === "home_slight" || matchType === "away_slight") {
        an2p1 = `Oran dağılımı tuzaklarla dolu. Hafif favori gösterilen takıma güvenmek yerine maçın gidişatına göre canlı bahis almak daha mantıklı.`;
        an2p2 = `İki takım da birbirini yenmek için risk alacaktır. Özellikle ikinci yarıda taktiksel disiplinden koptuklarında gollü bir düello izleyebiliriz.`;
        focus2 = `İkinci Yarı Toplam Gol > İlk Yarı Toplam Gol`;
    } else {
        an2p1 = `İki denk takımın mücadelesinde beraberlik ihtimali her zaman en değerli orandır. Özellikle ilk yarıda iki tarafın da birbirini tartmasını bekliyorum.`;
        an2p2 = `Golü yiyen takımın mecburen açılacağı düşünülürse, karşılıklı gol var ve sonrasında kırmızı kart çıkma gibi aksiyonlu senaryolara yön girmekte fayda var.`;
        focus2 = `Karşılıklı Gol Var ve Beraberlik`;
    }

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-6 font-outfit flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-500" />
                Yapay Zeka Analist Yorumları
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Analyst 1: Analitik Zeka */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel rounded-2xl p-6 border border-brand-500/30 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-bl-[100px] -z-10 group-hover:bg-brand-500/20 transition-colors"></div>

                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                            <BrainCircuit className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white font-outfit">Analitik Zeka</h4>
                            <p className="text-xs text-brand-400">İstatistik ve Veri Bilimi Uzmanı</p>
                        </div>
                    </div>

                    <div className="text-sm text-gray-300 leading-relaxed space-y-3">
                        <p>{an1p1}</p>
                        <p>{an1p2}</p>
                        <div className="pt-3 border-t border-white/10 mt-4">
                            <span className="text-xs text-brand-300 font-semibold uppercase tracking-wider">ODAK NOKTASI:</span>
                            <p className="font-medium text-white mt-1">{focus1}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Analyst 2: Sürpriz Avcısı */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-panel rounded-2xl p-6 border border-purple-500/30 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-[100px] -z-10 group-hover:bg-purple-500/20 transition-colors"></div>

                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                            <AlertCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white font-outfit">Sürpriz Avcısı</h4>
                            <p className="text-xs text-purple-400">Trend Analizi ve Psikoloji Uzmanı</p>
                        </div>
                    </div>

                    <div className="text-sm text-gray-300 leading-relaxed space-y-3">
                        <p>{an2p1}</p>
                        <p>{an2p2}</p>
                        <div className="pt-3 border-t border-white/10 mt-4">
                            <span className="text-xs text-purple-300 font-semibold uppercase tracking-wider">ALTERNATİF SENARYO:</span>
                            <p className="font-medium text-white mt-1">{focus2}</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
