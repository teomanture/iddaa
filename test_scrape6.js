const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrape() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.iddaa.com/program/futbol', { waitUntil: 'networkidle2' });

    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            let scrolls = 0;
            const timer = setInterval(() => {
                window.scrollBy(0, 600);
                totalHeight += 600;
                scrolls++;
                if (scrolls >= 30) {
                    clearInterval(timer);
                    resolve();
                }
            }, 400);
        });
    });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    // Let's find all divs that might be headers by looking at classes that are not match rows
    // Often date headers have specific text like specific days.
    const allTexts = $('body').text();
    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    for (let day of days) {
        console.log(`${day} count:`, (allTexts.match(new RegExp(day, 'g')) || []).length);
    }
}

scrape();
