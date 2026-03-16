import { Trophy } from "lucide-react";
import DailyCoupons from "@/components/DailyCoupons";
import MatchList from "@/components/MatchList";

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="py-12 md:py-20 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-sm mb-6 border border-accent/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          Yapay Zeka Destekli Tahminler Aktif
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white font-outfit leading-tight mb-6">
          Kazanma İhtimalinizi <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-accent">Yapay Zeka</span> İle Artırın
        </h1>
        <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
          00:00 - 23:59 arası günlük bültendeki tüm maçları, takımların form durumlarını, sakatlıkları ve 10 farklı bahis seçeneğini detaylıca analiz ediyoruz.
        </p>
      </section>

      {/* Daily Coupons Sections */}
      <section id="coupons" className="mb-20 scroll-mt-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white font-outfit flex items-center gap-3">
            <Trophy className="text-brand-500 w-6 h-6" />
            Günün Kuponları
          </h2>
        </div>
        <DailyCoupons />
      </section>

      {/* Match List Section */}
      <section id="matches" className="scroll-mt-24">
        {/* We can use this as both matches and analysis for now as they are together */}
        <div id="analysis" className="scroll-mt-24">
          <MatchList />
        </div>
      </section>

    </div>
  );
}
