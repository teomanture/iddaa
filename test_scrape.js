const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('test.html', 'utf-8');
const $ = cheerio.load(html);

const matches = $('.s_mc__IigE5');
console.log('Total matches container:', matches.length);

matches.slice(0, 5).each((i, el) => {
    const homeTeam = $(el).find('.i_tn__gfavJ').eq(0).text().trim();
    const awayTeam = $(el).find('.i_tn__gfavJ').eq(1).text().trim();

    // find all odd values
    const odds = $(el).find('.o_oddm__lGnDb').map((_, e) => $(e).text().trim()).get();

    console.log(`\nMatch ${i + 1}: ${homeTeam} vs ${awayTeam}`);
    console.log('Oranlar dizisi:', odds);
});
