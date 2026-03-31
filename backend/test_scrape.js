const db = require('./db');
const { scrapeAllCinemas } = require('./scrapers/allocine');

(async () => {
    try {
        await scrapeAllCinemas();
        const showtimes = db.prepare('SELECT date, count(*) as count FROM showtimes GROUP BY date').all();
        console.log("Showtimes grouped by date:", showtimes);
    } catch (e) {
        console.error(e);
    }
})();
