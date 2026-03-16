import { NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        // İstanbul saatine göre güncel tarihi DD.MM.YYYY formatında alıyoruz
        const dateParam = new Date().toLocaleDateString('tr-TR', {
            timeZone: 'Europe/Istanbul',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        // Direct mobile betting API is more reliable and Vercel compatible
        const apiUrl = `https://sportsbook.iddaa.com/sportsbook/v2/program/detailed?sports=1&date=${dateParam}`;
        
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
                'Referer': 'https://www.iddaa.com/',
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        const data = response.data;

        if (!data || !data.events) {
            return NextResponse.json({ success: false, error: "No data received from API" }, { status: 504 });
        }

        // Process matches from API response
        const resultMatches = data.events.map((event: any, idx: number) => {
            // Find MS1, MSX, MS2 odds in the markets
            const msMarket = event.markets?.find((m: any) => m.mname === "Maç Sonucu" || m.mno === "1");
            
            const getOdd = (mname: string) => {
                const oddObj = msMarket?.odds?.find((o: any) => o.oname === mname);
                return oddObj ? oddObj.ovalue : "---";
            };

            const ms1 = getOdd("1");
            const msx = getOdd("X");
            const ms2 = getOdd("2");

            const pms1 = parseFloat(ms1.replace(',', '.')) || 1.90;
            const pmsx = parseFloat(msx.replace(',', '.')) || 3.20;
            const pms2 = parseFloat(ms2.replace(',', '.')) || 2.80;

            const prob1 = (1 / pms1) * 100;
            const probX = (1 / pmsx) * 100;
            const prob2 = (1 / pms2) * 100;
            const totalProb = prob1 + probX + prob2;

            const winChanceHome = Math.round((prob1 / totalProb) * 100);
            const winChanceDraw = Math.round((probX / totalProb) * 100);
            const winChanceAway = Math.round((prob2 / totalProb) * 100);

            let topTitle = "MS 1", topOdd = ms1, topPercentage = winChanceHome;
            if (winChanceAway > winChanceHome && winChanceAway > winChanceDraw) {
                topTitle = "MS 2"; topOdd = ms2; topPercentage = winChanceAway;
            } else if (winChanceDraw > winChanceHome && winChanceDraw > winChanceAway) {
                topTitle = "MS X"; topOdd = msx; topPercentage = winChanceDraw;
            }

            return {
                id: event.eid || `match-${idx}`,
                time: event.etime || "---",
                league: event.mname || "İddaa Futbol Bülteni",
                homeTeam: event.htname,
                awayTeam: event.atname,
                status: event.estatus === "PENDING" ? "not_started" : "live",
                winChanceHome, winChanceDraw, winChanceAway,
                topPick: { title: topTitle, percentage: topPercentage, odd: topOdd },
                rawOdds: { ms1, msx, ms2 }
            };
        });

        // Filter by time (current hour/minute in Istanbul)
        const istanbulTime = new Date().toLocaleTimeString('tr-TR', {
            timeZone: 'Europe/Istanbul',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        const filteredMatches = resultMatches.filter((match: any) => {
            if (!match.time || match.time === "---") return true;
            return match.time >= istanbulTime;
        });

        return NextResponse.json({
            success: true,
            matchCount: filteredMatches.length,
            matches: filteredMatches
        });

    } catch (error: any) {
        console.error("API Error:", error.message);
        return NextResponse.json({ 
            success: false, 
            error: error.message,
            tip: "Production environments like Vercel don't support Puppeteer without dedicated config. Switched to direct API."
        }, { status: 500 });
    }
}
