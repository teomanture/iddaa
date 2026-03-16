const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('test.html', 'utf-8');
const $ = cheerio.load(html);

const teams = $('.i_tn__gfavJ');
const matchedResult = [];

teams.each((idx, el) => {
    if (idx % 2 === 0) {
        const homeTeam = $(el).text().trim();
        const awayTeam = $(teams[idx + 1]).text().trim();

        let parent = $(el).parent();
        for (let j = 0; j < 4; j++) {
            if (parent.find('.o_oddm__lGnDb').length > 0) break;
            parent = parent.parent();
        }

        const rawOddText = parent.find('.o_oddm__lGnDb').eq(0).text().trim();
        matchedResult.push({ homeTeam, awayTeam, rawOddText });
    }
});

console.log(matchedResult.slice(0, 3));
