const cheerio = require('cheerio');
const fs = require('fs');

(async () => {
    try {
        const response = await fetch('https://www.allocine.fr/seance/salle_gen_csalle=C0073.html', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
        });
        const html = await response.text();
        fs.writeFileSync('allocine_dump.html', html);
        console.log("Dumped to allocine_dump.html");
    } catch (e) {
        console.error(e);
    }
})();
