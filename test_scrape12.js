const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrape() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.iddaa.com/program/futbol', { waitUntil: 'networkidle2' });

    // Scroll more
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            let scrolls = 0;
            const timer = setInterval(() => {
                window.scrollBy(0, 1000);
                totalHeight += 1000;
                scrolls++;
                if (scrolls >= 50) {
                    clearInterval(timer);
                    resolve();
                }
            }, 300);
        });
    });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    const rows = $('.m_match__vT2sM');
    console.log("Toplam Bulunan Maç Satırı (m_match__vT2sM):", rows.length);

    let count = 0;
    rows.each((i, row) => {
        const text = $(row).text();
        if (text.includes("Bugün")) {
            count++;
            if (count < 10) {
                // Try to find teams inside this row
                // Team names often are in specific spans
                const teams = $(row).find('.i_tn__gfavJ');
                const home = $(teams[0]).text().trim();
                const away = $(teams[1]).text().trim();
                console.log(`- ${home} vs ${away} (Bugün)`);
            }
        }
    });
    console.log("Bulunan 'Bugün' maç sayısı:", count);
}

scrape();
