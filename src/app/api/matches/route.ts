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

        // Primary stable API endpoint discovered via browser research
        const apiUrl = `https://sportsbookv2.iddaa.com/sportsbook/events?st=1&type=0&version=0`;
        
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': 'https://www.iddaa.com/',
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        const data = response.data;

        if (!data || !data.isSuccess || !data.data || !data.data.events) {
            return NextResponse.json({ success: false, error: "Invalid response from sports API" }, { status: 504 });
        }

        const events = data.data.events;

        // Process matches from API response
        const resultMatches = events
            .filter((event: any) => {
                // Filter by date: Only show matches for "today" in Istanbul time
                if (!event.d) return false;
                const eventDateStr = new Date(event.d * 1000).toLocaleDateString('tr-TR', {
                    timeZone: 'Europe/Istanbul',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                return eventDateStr === dateParam;
            })
            .map((event: any, idx: number) => {
                // Market type 1 is usually Match Result (1-X-2)
                const msMarket = event.m?.find((m: any) => m.t === 1);
                
                const getOdd = (name: string) => {
                    const oddObj = msMarket?.o?.find((o: any) => o.n === name);
                    // Return dots for internal numeric stability, display can use commas if needed
                    return oddObj ? oddObj.odd.toString() : "---";
                };

                const ms1 = getOdd("1");
                const msx = getOdd("0"); // API uses "0" for draw
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

                // Time processing
                let matchTime = "---";
                if (event.d) {
                    matchTime = new Date(event.d * 1000).toLocaleTimeString('tr-TR', {
                        timeZone: 'Europe/Istanbul',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });
                }

                return {
                    id: event.i || `match-${idx}`,
                    time: matchTime,
                    league: "İddaa Futbol Bülteni",
                    homeTeam: event.hn,
                    awayTeam: event.an,
                    status: event.s === 1 ? "live" : "not_started",
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

        // Only show matches that haven't started yet or are currently live
        const filteredMatches = resultMatches.filter((match: any) => {
            if (!match.time || match.time === "---") return true;
            return match.time >= istanbulTime || match.status === "live";
        });

        return NextResponse.json({
            success: true,
            matchCount: filteredMatches.length,
            matches: filteredMatches
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=59'
            }
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
