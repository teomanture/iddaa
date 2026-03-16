import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    let browser;
    try {
        // İstanbul saatine göre güncel tarihi DD.MM.YYYY formatında alıyoruz
        const dateParam = new Date().toLocaleDateString('tr-TR', {
            timeZone: 'Europe/Istanbul',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const url = `https://www.iddaa.com/program/futbol?date=${dateParam}`;

        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

        // Şimdiki tarih (Gün Ay) formatında alıyoruz (Örn: 16 Mart)
        const currentDateStr = new Date().toLocaleDateString('tr-TR', {
            timeZone: 'Europe/Istanbul',
            day: 'numeric',
            month: 'long'
        });

        const fullDateDisplay = new Date().toLocaleDateString('tr-TR', {
            timeZone: 'Europe/Istanbul',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // Kademeli Kazıma (Incremental Scrape) Mantığı
        // Sayfa aşağı kaydıkça DOM'dan silinen maçları bir koleksiyonda topluyoruz
        const matches = await page.evaluate(async (currentDate) => {
            const allCollected = new Map();
            const scrolls = 60; // Increase to ensure we get everything
            const distance = 800;

            for (let i = 0; i < scrolls; i++) {
                const teamElements = document.querySelectorAll('.i_tn__gfavJ');

                for (let j = 0; j < teamElements.length; j += 2) {
                    const homeEl = teamElements[j] as HTMLElement;
                    const awayEl = teamElements[j + 1] as HTMLElement;

                    if (homeEl && awayEl) {
                        const home = homeEl.innerText.trim();
                        const away = awayEl.innerText.trim();
                        const matchKey = `${home}-${away}`;

                        if (!allCollected.has(matchKey)) {
                            // Find parent row to get odds and time
                            let pt = "";
                            let foundContext = false;

                            // Go up to find "Bugün" or specific date string
                            let contextParent: HTMLElement | null = homeEl;
                            for (let k = 0; k < 12; k++) {
                                if (contextParent) {
                                    const text = contextParent.innerText || "";
                                    // Sadece "Bugün" veya o günün tarihini içerenleri kabul et (Yarın vb. sızmasın)
                                    if (text.includes("Bugün") || text.includes(currentDate)) {
                                        foundContext = true;
                                        pt = text;
                                        break;
                                    }
                                    contextParent = contextParent.parentElement;
                                }
                            }

                            if (foundContext) {
                                // Find odds - The FIRST box contains MS1, MSX, MS2
                                let oddsParent: HTMLElement | null = homeEl;
                                let oddsTexts: string[] = [];
                                for (let k = 0; k < 8; k++) {
                                    if (oddsParent) {
                                        const mainOddBox = oddsParent.querySelector('.o_oddm__lGnDb');
                                        if (mainOddBox) {
                                            // Extract all child elements that contain numeric values (usually <li>)
                                            const childOdds = mainOddBox.querySelectorAll('li, span');
                                            childOdds.forEach(c => {
                                                const t = (c as HTMLElement).innerText.trim();
                                                // Only add if it's a valid odd (no colons, is a number)
                                                if (t && !t.includes(':') && !isNaN(parseFloat(t.replace(',', '.')))) {
                                                    oddsTexts.push(t);
                                                }
                                            });
                                            if (oddsTexts.length >= 2) break;
                                        }
                                        oddsParent = oddsParent.parentElement;
                                    }
                                }

                                const timeMatch = pt.match(/([0-2][0-9]:[0-5][0-9])/);
                                const matchTime = timeMatch ? timeMatch[1] : "Bilinmiyor";

                                allCollected.set(matchKey, {
                                    home,
                                    away,
                                    time: matchTime,
                                    odds: oddsTexts.slice(0, 3) // Take strictly first 3 for MS
                                });
                            }
                        }
                    }
                }
                window.scrollBy(0, distance);
                await new Promise(r => setTimeout(r, 400));
            }
            return Array.from(allCollected.values());
        }, currentDateStr);

        await browser.close();

        // Process collected matches
        const resultMatches = matches.map((m: any, idx: number) => {
            // Veri temizleme: Eğer bir kutuda birden fazla oran varsa (alt alta), sadece ilkini al
            const cleanOdd = (val: string) => {
                if (!val) return "---";
                // Satır sonları veya boşluklara göre böl ve ilk sayısal değeri al
                const parts = val.split(/[\s\n]+/).filter(p => !isNaN(parseFloat(p.replace(',', '.'))));
                return parts[0] || val.trim();
            };

            const parsedOdds = {
                ms1: cleanOdd(m.odds[0]),
                msx: cleanOdd(m.odds[1]),
                ms2: cleanOdd(m.odds[2])
            };

            const pms1 = parseFloat(parsedOdds.ms1.replace(',', '.')) || 1.90;
            const pmsx = parseFloat(parsedOdds.msx.replace(',', '.')) || 3.20;
            const pms2 = parseFloat(parsedOdds.ms2.replace(',', '.')) || 2.80;

            const prob1 = (1 / pms1) * 100;
            const probX = (1 / pmsx) * 100;
            const prob2 = (1 / pms2) * 100;
            const totalProb = prob1 + probX + prob2;

            const winChanceHome = Math.round((prob1 / totalProb) * 100);
            const winChanceDraw = Math.round((probX / totalProb) * 100);
            const winChanceAway = Math.round((prob2 / totalProb) * 100);

            let topTitle = "MS 1", topOdd = parsedOdds.ms1, topPercentage = winChanceHome;
            if (winChanceAway > winChanceHome && winChanceAway > winChanceDraw) {
                topTitle = "MS 2"; topOdd = parsedOdds.ms2; topPercentage = winChanceAway;
            } else if (winChanceDraw > winChanceHome && winChanceDraw > winChanceAway) {
                topTitle = "MS X"; topOdd = parsedOdds.msx; topPercentage = winChanceDraw;
            }

            return {
                id: `match-${idx}`,
                time: m.time,
                league: "İddaa Futbol Bülteni",
                homeTeam: m.home,
                awayTeam: m.away,
                status: "not_started",
                winChanceHome, winChanceDraw, winChanceAway,
                topPick: { title: topTitle, percentage: topPercentage, odd: topOdd },
                rawOdds: parsedOdds
            };
        });

        // Filter by time (İstanbul)
        const currentTime = new Date().toLocaleTimeString('tr-TR', {
            timeZone: 'Europe/Istanbul',
            hour: '2-digit',
            minute: '2-digit'
        });

        const filteredMatches = resultMatches.filter((match: any) => {
            if (match.time === "Bilinmiyor") return true;
            return match.time >= currentTime;
        });

        return NextResponse.json({
            success: true,
            matchCount: filteredMatches.length,
            matches: filteredMatches
        });

    } catch (error: any) {
        if (browser) await browser.close();
        console.error("Scrape Error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
