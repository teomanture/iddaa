const fs = require('fs');
const html = fs.readFileSync('iddaa_dump.html', 'utf8');

const regex = /class="([^"]*)"/g;
let m;
const counts = {};

while ((m = regex.exec(html)) !== null) {
    const parts = m[1].split(' ');
    parts.forEach(p => {
        if (p.trim() === '') return;
        if (counts[p]) counts[p]++;
        else counts[p] = 1;
    });
}

const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50);

console.log(sorted);
