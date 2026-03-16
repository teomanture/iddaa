const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('test.html', 'utf-8');
const $ = cheerio.load(html);

const teams = $('.i_tn__gfavJ');
console.log('Total team names:', teams.length);

const matchedResult = [];

teams.each((idx, el) => {
    if (idx % 2 === 0) {
        const homeTeam = $(el).text().trim();
        const awayTeam = $(teams[idx + 1]).text().trim();

        // Find parent container
        let parent = $(el).parent();
        for (let j = 0; j < 4; j++) {
            if (parent.find('.o_oddm__lGnDb').length > 0) break;
            parent = parent.parent();
        }

        // Let's search for reasonable time-looking strings in the parent text
        const pt = parent.text();
        const timeMatch = pt.match(/([0-2][0-9]:[0-5][0-9])/);
        const time = timeMatch ? timeMatch[1] : "Bilinmiyor";

        // Veya ID, class vs. gibi seyleri parent icinde arayabiliriz

        matchedResult.push({ homeTeam, awayTeam, time });
    }
});

console.log(matchedResult.slice(0, 5));
