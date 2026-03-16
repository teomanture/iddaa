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

    let bugunCount = 0;
    let yarinCount = 0;
    let digerCount = 0;

    for (let i = 0; i < teamElements.length; i += 2) {
        let parent = $(teamElements[i]).parent().parent().parent();
        const pt = parent.text();

        if (pt.includes('Bugün')) bugunCount++;
        else if (pt.includes('Yarın')) yarinCount++;
        else digerCount++;
    }

    console.log("Bugün Maçları:", bugunCount);
    console.log("Yarın Maçları:", yarinCount);
    console.log("Diğer Maçlar:", digerCount);

    // Ayrıca Bugün'leri basalım
    console.log("--- BAZI BUGÜN MAÇLARI ---");
    let c = 0;
    for (let i = 0; i < teamElements.length; i += 2) {
        let parent = $(teamElements[i]).parent().parent().parent();
        const pt = parent.text();
        if (pt.includes('Bugün') && c < 10) {
            console.log($(teamElements[i]).text());
            c++;
        }
    }
}

scrape();
