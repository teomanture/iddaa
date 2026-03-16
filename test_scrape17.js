const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrape() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.iddaa.com/program/futbol', { waitUntil: 'networkidle2' });

    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let scrolls = 0;
            const timer = setInterval(() => { window.scrollBy(0, 800); scrolls++; if (scrolls >= 5) { clearInterval(timer); resolve(); } }, 300);
        });
    });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);
    const teamElements = $('.i_tn__gfavJ');

    // Check first match only with deep depth
    const home = $(teamElements[0]).text().trim();
    const away = $(teamElements[1]).text().trim();
    console.log(`--- Maç Yapısı Analizi: ${home} - ${away} ---`);

    let parent = $(teamElements[0]).parent();
    for (let j = 0; j < 8; j++) {
        const oddsBox = parent.find('.o_oddm__lGnDb').first();
        if (oddsBox.length > 0) {
            console.log("Maç Sonucu Kutusu HTML:", oddsBox.html());
            // Explore children
            oddsBox.find('*').each((idx, el) => {
                const text = $(el).text().trim();
                if (text && !isNaN(parseFloat(text.replace(',', '.')))) {
                    console.log(`  Alt Element [${idx}]: "${text}"`);
                }
            });
            break;
        }
        parent = parent.parent();
    }
}

scrape();
