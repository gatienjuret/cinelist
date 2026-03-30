const cron = require('node-cron');
const dotenv = require('dotenv');
const { scrapeWatchlist } = require('./scrapers/letterboxd');
const { scrapeAllCinemas } = require('./scrapers/allocine');
const { runMatcher } = require('./matcher');
const db = require('./db');
dotenv.config();

const username = process.env.LETTERBOXD_USERNAME;

cron.schedule('0 6 * * *', async () => {
  console.log('Running scheduled sync at 6:00 AM');
  try {
    if (username) {
      await scrapeWatchlist(username);
    }
    
    db.prepare('DELETE FROM showtimes').run();
    db.prepare('DELETE FROM matches').run(); 
    
    await scrapeAllCinemas();
    runMatcher();
  } catch (err) {
    console.error('Scheduled sync failed:', err);
  }
});

console.log('Cron scheduler initialized');
