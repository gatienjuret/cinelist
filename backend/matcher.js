const db = require('./db');
const Fuse = require('fuse.js');

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/\(.*\)/g, "")         // Supprime les (ressortie), (version restaurée), etc.
    .replace(/[^a-z0-9 ]/g, " ")    // Remplace les caractères spéciaux par des espaces
    .replace(/\s+/g, " ")           // Supprime les espaces doubles
    .trim();
}

function runMatcher() {
  console.log("Running Matcher...");
  
  const watchlist = db.prepare('SELECT tmdb_id, title FROM watchlist_films').all();
  const showtimes = db.prepare('SELECT id, film_title FROM showtimes').all();
  
  if (watchlist.length === 0 || showtimes.length === 0) return;

  const normalizedWatchlist = watchlist.map(w => ({
    ...w,
    normalized: normalizeTitle(w.title)
  }));

  const fuse = new Fuse(normalizedWatchlist, {
    keys: ['normalized'],
    threshold: 0.2
  });

  const insertMatch = db.prepare(`
    INSERT OR IGNORE INTO matches (tmdb_id, showtime_id) 
    VALUES (?, ?)
  `);

  let matchesCount = 0;

  for (const show of showtimes) {
    const showTitleNorm = normalizeTitle(show.film_title);
    const results = fuse.search(showTitleNorm);
    
    if (results.length > 0) {
      const bestMatch = results[0].item;
      // Found a match
      try {
        const info = insertMatch.run(bestMatch.tmdb_id, show.id);
        if (info.changes > 0) matchesCount++;
      } catch(e) { }
    }
  }

  console.log(`Matcher finished. Inserted ${matchesCount} new matches.`);
}

module.exports = { runMatcher };
