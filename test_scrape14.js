const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrape() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set a very realistic user agent to avoid any possible anti-bot issues that might hide content
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    console.log("Navigating to iddaa.com...");
    await page.goto('https://www.iddaa.com/program/futbol', { waitUntil: 'networkidle0', timeout: 60000 });

    // Wait for the main container that lists all matches to appear
    // Screenshot shows league headers and match boxes.
    // Let's scroll slowly and wait after each scroll to ensure background JS loads the matches.

    console.log("Starting slow scroll and data probe...");

    for (let i = 0; i < 20; i++) {
        await page.evaluate(() => window.scrollBy(0, 1500));
        await new Promise(r => setTimeout(r, 1000)); // Wait 1 second for content to pop in

        const count = await page.evaluate(() => document.querySelectorAll('.i_tn__gfavJ').length);
        console.log(`Scroll ${i + 1}: Found ${count} team elements`);
    }

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);
    const teamElements = $('.i_tn__gfavJ');

    console.log("Final Total Team Elements:", teamElements.length);

    const sampleTeams = [];
    teamElements.each((i, el) => {
        if (i < 50) sampleTeams.push($(el).text().trim());
    });
    console.log("Sample Teams (first 50):", sampleTeams);
}

scrape();
