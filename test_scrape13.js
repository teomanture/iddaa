const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrape() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.iddaa.com/program/futbol', { waitUntil: 'networkidle2' });

    // Sayfadaki tüm lig başlıklarını ve altındaki maç adetlerini anlamaya çalışalım
    // Ekran görüntüsünde "KAZAKİSTAN PREMİER LİG", "NİJERYA PROFESYONEL FUTBOL LİGİ" gibi turuncu/siyah başlıklar var.

    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let scrolls = 0;
            const timer = setInterval(() => {
                window.scrollBy(0, 800);
                scrolls++;
                if (scrolls >= 60) {
                    clearInterval(timer);
                    resolve();
                }
            }, 300);
        });
    });

    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);

    // iddaa.com'da lig başlıkları genelde "league" kelimesini içeren classlara sahip olabilir
    // Veya turuncu/siyah arka planlı divler.
    // Ekran görüntüsüne bakınca lig başlıkları satırı boydan boya kaplıyor.

    console.log("Sayfa Text Uzunluğu:", $('body').text().length);

    // Maç Sonucu 1, 0, 2 başlıklarının altındaki satır sayısını sayalım
    // Oran kutucuklarının ortak bir class'ı vardı: .o_oddm__lGnDb
    const oddCount = $('.o_oddm__lGnDb').length;
    console.log("Toplam Bulunan Oran Kutucuğu Sayısı:", oddCount);

    // Her maçta en az 3-6 oran olduğunu varsayarsak maç sayısına yaklaşabiliriz
    console.log("Tahmini Maç Sayısı (Oran/6):", Math.floor(oddCount / 6));

    // Takım isimlerinin class'ı .i_tn__gfavJ idi ama neden 4 tane geliyordu?
    // Belki de "Öne Çıkanlar" (Featured) bölümündekiler bu class'ı kullanıyor, diğerleri farklı?

    // Let's find all spans and divs that contain a hyphen "-" which usually separates teams
    let pairs = 0;
    $(':contains("-")').each((i, el) => {
        const t = $(el).text();
        if (t.length > 5 && t.length < 50 && t.split("-").length === 2) {
            // matches pattern like "Team A - Team B"
            pairs++;
        }
    });
    console.log("Potansiyel 'Takım A - Takım B' eşleşme sayısı:", pairs);

    // Lig isimlerine bakalım (Genelde BÜYÜK HARFLE yazılmış ve "LİG" içeriyor)
    const candidates = [];
    $('*').each((i, el) => {
        const t = $(el).text().trim();
        if (t.length > 5 && t.length < 60 && t === t.toUpperCase() && (t.includes("LİG") || t.includes("KUPA"))) {
            candidates.push(t);
        }
    });
    console.log("Bulunan Lig Başlığı Adayları:", [...new Set(candidates)].slice(0, 15));
}

scrape();
