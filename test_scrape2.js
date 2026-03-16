const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('test.html', 'utf-8');
const $ = cheerio.load(html);

const teams = $('.i_tn__gfavJ');
console.log('Total team names:', teams.length);

// Gidelim ilk takim adinin oldugu elementin tum .o_oddm__lGnDb oranlarini listeleyelim.
const firstTeam = teams.eq(0);
if (firstTeam.length) {
    // let's go up to a common row container. It's usually a flex row.
    let parent = firstTeam.parent();
    for (let i = 0; i < 5; i++) {
        if (parent.find('.o_oddm__lGnDb').length > 0) {
            console.log('Found common container at level up:', i + 1);
            break;
        }
        parent = parent.parent();
    }

    const oddBlocks = parent.find('.o_oddm__lGnDb');
    console.log('This match container has odds blocks:', oddBlocks.length);
    oddBlocks.each((i, el) => {
        console.log(`Block ${i}:`, $(el).text().trim());
    });
}
