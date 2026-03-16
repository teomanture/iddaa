const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrape() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    console.log("Navigating to iddaa.com...");
    await page.goto('https://www.iddaa.com/program/futbol', { waitUntil: 'networkidle0', timeout: 60000 });

    console.log("Starting Incremental Scrape...");

    const allMatches = new Set();

    for (let i = 0; i < 40; i++) {
        // Collect current visible matches
        const matchesOnScreen = await page.evaluate(() => {
            const teamEls = document.querySelectorAll('.i_tn__gfavJ');
            const data = [];
            for (let j = 0; j < teamEls.length; j += 2) {
                if (teamEls[j] && teamEls[j + 1]) {
                    const home = teamEls[j].innerText.trim();
                    const away = teamEls[j + 1].innerText.trim();

                    // Try to find context (like "Bugün" or "16 Mart")
                    let parent = teamEls[j].parentElement;
                    let context = "";
                    for (let k = 0; k < 10; k++) {
                        if (parent) {
                            if (parent.innerText.includes("Bugün") || parent.innerText.includes("16 Mart")) {
                                context = "TODAY";
                                break;
                            }
                            parent = parent.parentElement;
                        }
                    }
                    data.push({ names: `${home}-${away}`, context });
                }
            }
            return data;
        });

        matchesOnScreen.forEach(m => {
            if (m.context === "TODAY") {
                allMatches.add(m.names);
            }
        });

        console.log(`Scroll ${i + 1}: Total unique Today matches collected so far: ${allMatches.size}`);

        await page.evaluate(() => window.scrollBy(0, 800));
        await new Promise(r => setTimeout(r, 400));
    }

    await browser.close();

    console.log("--- FINAL COLLECTION ---");
    console.log("Total unique matches:", allMatches.size);
    console.log("Sample matches:", Array.from(allMatches).slice(0, 30));
}

scrape();
