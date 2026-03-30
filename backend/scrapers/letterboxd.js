const cheerio = require('cheerio');
const db = require('../db');
const tmdb = require('./tmdb');

async function scrapeWatchlist(username) {
  let page = 1;
  let hasMore = true;
  let filmsProcessed = 0;

  while (hasMore) {
    console.log(`Scraping Letterboxd watchlist for ${username} - Page ${page}`);
    try {
      const url = `https://letterboxd.com/${username}/watchlist/page/${page}/`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
      });
      if (!res.ok) {
        if (res.status === 404) {
          hasMore = false;
          break;
        }
        throw new Error(`Failed to fetch page ${page}: ${res.statusText}`);
      }
      
      const html = await res.text();
      const $ = cheerio.load(html);
      const posters = $('.react-component[data-component-class="LazyPoster"]');
      
      if (posters.length === 0) {
        hasMore = false;
        break;
      }
      
      for (let i = 0; i < posters.length; i++) {
        const el = posters[i];
        const slug = $(el).attr('data-item-slug');
        let title = $(el).find('img').attr('alt');
        
        if (!slug || !title) continue;

        const row = db.prepare('SELECT tmdb_id FROM watchlist_films WHERE letterboxd_slug = ?').get(slug);
        if (!row) {
          await new Promise(r => setTimeout(r, 200)); 
          const tmdbMovie = await tmdb.searchMovie(title);
          
          if (tmdbMovie) {
            const tmdbDetails = await tmdb.getMovieDetails(tmdbMovie.id);
            if (tmdbDetails) {
              try {
                db.prepare(`
                  INSERT OR IGNORE INTO watchlist_films 
                  (tmdb_id, title, poster_url, synopsis, genres, letterboxd_slug) 
                  VALUES (?, ?, ?, ?, ?, ?)
                `).run(
                  tmdbDetails.id, 
                  tmdbDetails.title, 
                  tmdbDetails.poster_path, 
                  tmdbDetails.overview, 
                  JSON.stringify(tmdbDetails.genres.map(g => g.name)), 
                  slug
                );
                
                db.prepare(`INSERT OR IGNORE INTO user_watchlists (username, tmdb_id) VALUES (?, ?)`).run(username, tmdbDetails.id);
                filmsProcessed++;
              } catch(e) {
                console.error("DB Insert Error", e);
              }
            }
          }
        } else {
          // If already in db, just map to user
          db.prepare(`INSERT OR IGNORE INTO user_watchlists (username, tmdb_id) VALUES (?, ?)`).run(username, row.tmdb_id);
        }
      }
      page++;
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error("Letterboxd scrape error:", err);
      hasMore = false;
    }
  }
  return { success: true, filmsProcessed };
}

module.exports = { scrapeWatchlist };
