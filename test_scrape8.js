const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrape() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.iddaa.com/program/futbol', { waitUntil: 'networkidle2' });

    // Scroll a few times
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            let scrolls = 0;
            const timer = setInterval(() => {
                window.scrollBy(0, 600);
                totalHeight += 600;
                scrolls++;
                if (scrolls >= 15) {
                    clearInterval(timer);
                    resolve();
                }
            }, 400);
        });
    });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    // Let's print out text of elements that look like row headers
    // Usually these have classes different from match rows
    let headers = [];
    $('*').each((i, el) => {
        const text = $(el).text().trim();
        // check if text looks like a date "xx Mart"
        if (/^\d{1,2}\s+(Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)/i.test(text)) {
            headers.push(text);
        }
    });

    console.log("Found dates:", [...new Set(headers)]);

    // Let's also just dump the first 5 matches with their parent's parent text to see if a date is nearby
    const teamElements = $('.i_tn__gfavJ');
    for (let i = 0; i < Math.min(10, teamElements.length); i += 2) {
        let parent = $(teamElements[i]).parent().parent().parent();
        console.log("Match:", $(teamElements[i]).text(), "Context:", parent.text().slice(0, 100).replace(/\n/g, ' '));
    }
}

scrape();
