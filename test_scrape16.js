const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrape() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.iddaa.com/program/futbol', { waitUntil: 'networkidle2' });

    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let scrolls = 0;
            const timer = setInterval(() => {
                window.scrollBy(0, 800);
                scrolls++;
                if (scrolls >= 10) {
                    clearInterval(timer);
                    resolve();
                }
            }, 300);
        });
    });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    // Let's inspect a few rows more closely
    const teamElements = $('.i_tn__gfavJ');

    for (let i = 0; i < Math.min(6, teamElements.length); i += 2) {
        const home = $(teamElements[i]).text().trim();
        const away = $(teamElements[i + 1]).text().trim();

        console.log(`--- Maç: ${home} - ${away} ---`);

        // Find all odds-like elements near this team
        let parent = $(teamElements[i]).parent();
        for (let j = 0; j < 8; j++) {
            const odds = parent.find('.o_oddm__lGnDb');
            if (odds.length > 0) {
                console.log(`Bulunan Oran Elementi Sayısı (Derinlik ${j}):`, odds.length);
                odds.each((idx, el) => {
                    console.log(`  [${idx}] ${$(el).text().trim()}`);
                });
                break;
            }
            parent = parent.parent();
        }
    }
}

scrape();
