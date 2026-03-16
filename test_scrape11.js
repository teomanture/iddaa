const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrape() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.iddaa.com/program/futbol', { waitUntil: 'networkidle2' });

    // Scroll more aggressively
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            let scrolls = 0;
            const timer = setInterval(() => {
                window.scrollBy(0, 1000);
                totalHeight += 1000;
                scrolls++;
                if (scrolls >= 80) {
                    clearInterval(timer);
                    resolve();
                }
            }, 300);
        });
    });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    // iddaa.com often uses specific row classes. Let's find all rows that look like a match row
    // In screenshot, rows have team names, odds, time, etc.
    // Let's look for elements that contain "Bugün" and see their siblings/children

    console.log("Bugün kelimesi geçen element sayısı:", $("*:contains('Bugün')").length);

    // Let's try to find all match rows by searching for time pattern ([0-2][0-9]:[0-5][0-9]) 
    // and see which ones are today.

    const matches = [];
    $('*').each((i, el) => {
        const text = $(el).text();
        if (text.includes("Bugün") && /\d{2}:\d{2}/.test(text)) {
            // This might be a match row or a container
            // Let's try to find team names inside
            // Team names usually are in elements with specific classes but let's try a generic approach
            const timeMatch = text.match(/([0-2][0-9]:[0-5][0-9])/);
            if (timeMatch) {
                // If it has short text, it might be the row
                if (text.length < 200) {
                    matches.push({
                        text: text.trim(),
                        time: timeMatch[1]
                    });
                }
            }
        }
    });

    console.log("Bulunan potansiyel 'Bugün' maç satırı sayısı:", matches.length);
    if (matches.length > 0) {
        console.log("Örnek satırlar:", matches.slice(0, 10));
    }
}

scrape();
