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
                if (scrolls >= 60) {
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

    console.log("Toplam Takım Elementi:", teamElements.length);

    const results = [];
    for (let i = 0; i < teamElements.length; i += 2) {
        const home = $(teamElements[i]).text().trim();
        const away = $(teamElements[i + 1]).text().trim();

        let parent = $(teamElements[i]).parent();
        let pt = "";
        let foundBugun = false;

        // Let's go up much further to see where "Bugün" might be hidden
        let current = $(teamElements[i]);
        let depthText = "";
        for (let j = 0; j < 15; j++) {
            current = current.parent();
            if (current.text().includes("Bugün")) {
                foundBugun = true;
                break;
            }
        }

        results.push({
            match: `${home} - ${away}`,
            foundBugun
        });
    }

    const bugunMatches = results.filter(r => r.foundBugun);
    console.log("Bugün Etiketli Maç Sayısı:", bugunMatches.length);
    console.log("İlk 20 Bugün Maçı:", bugunMatches.slice(0, 20).map(m => m.match));
}

scrape();
