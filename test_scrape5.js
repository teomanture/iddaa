const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrape() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.iddaa.com/program/futbol', { waitUntil: 'networkidle2' });

    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 600;
            let scrolls = 0;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                scrolls++;
                if (totalHeight >= scrollHeight || scrolls >= 30) {
                    clearInterval(timer);
                    resolve();
                }
            }, 400);
        });
    });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);
    const teamElements = $('.i_tn__gfavJ');

    let times = [];
    for (let i = 0; i < teamElements.length; i += 2) {
        let parent = $(teamElements[i]).parent();
        for (let j = 0; j < 4; j++) {
            if (parent.find('.o_oddm__lGnDb').length > 0) break;
            parent = parent.parent();
        }
        const pt = parent.text();
        const timeMatch = pt.match(/([0-2][0-9]:[0-5][0-9])/);
        times.push(timeMatch ? timeMatch[1] : "Bilinmiyor");
    }

    console.log(times);
}

scrape();
