const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('iddaa_dump.html', 'utf8');
const $ = cheerio.load(html);

const odds = [];
$('.o_oddm__lGnDb').each((i, el) => {
    odds.push($(el).text().trim());
});
console.log('Found o_oddm__lGnDb items:', odds.slice(0, 10));

const teams = [];
$('.i_tn__gfavJ').each((i, el) => {
    teams.push($(el).text().trim());
});
console.log('Found team Names:', teams.slice(0, 10));
