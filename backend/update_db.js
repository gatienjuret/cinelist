const db = require('./db.js');
const tmdb = require('./scrapers/tmdb.js');

async function update() {
  try { db.exec('ALTER TABLE watchlist_films ADD COLUMN runtime INTEGER;'); } catch(e){}
  try { db.exec('ALTER TABLE watchlist_films ADD COLUMN release_date TEXT;'); } catch(e){}
  
  const films = db.prepare('SELECT tmdb_id FROM watchlist_films WHERE runtime IS NULL OR release_date IS NULL').all();
  const updateStmt = db.prepare('UPDATE watchlist_films SET runtime = ?, release_date = ? WHERE tmdb_id = ?');
  
  for (const f of films) {
    const details = await tmdb.getMovieDetails(f.tmdb_id);
    if(details) {
      updateStmt.run(details.runtime || 0, details.release_date || null, f.tmdb_id);
      console.log('Updated', f.tmdb_id);
    }
    await new Promise(r => setTimeout(r, 200));
  }
  console.log('Update finished.');
}
update();
