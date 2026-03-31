const fs = require('fs');

const theaterCode = 'C0073';
const dStr = '2026-04-02';
const url = `https://www.allocine.fr/_/showtimes/theater-${theaterCode}/d-${dStr}/`;

(async () => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filters: [] })
        });
        const data = await response.json();
        fs.writeFileSync('api_dump.json', JSON.stringify(data, null, 2));
        console.log("Dumped to api_dump.json");
    } catch (e) {
        console.error("Error:", e);
    }
})();
