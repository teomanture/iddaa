const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrape() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.iddaa.com/program/futbol', { waitUntil: 'networkidle2' });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    // Bütün text'leri dump yapıp içinden tarih gibi olanları bulalım.
    // Örneğin "18 Mart Çarşamba" 
    const matches = $('body').text().match(/\d{1,2}\s+(Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)\s+(Pazartesi|Salı|Çarşamba|Perşembe|Cuma|Cumartesi|Pazar)/g);

    console.log("Bulunan tarihler:", [...new Set(matches)]);
}

scrape();
