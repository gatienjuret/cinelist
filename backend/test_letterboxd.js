const { scrapeWatchlist } = require('./scrapers/letterboxd');
console.log("Testing Letterboxd scraper for 'karsten'...");
scrapeWatchlist('karsten').then(console.log).catch(console.error);
