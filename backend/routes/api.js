const express = require('express');
const router = express.Router();
const db = require('../db');
const { scrapeWatchlist } = require('../scrapers/letterboxd');
const { scrapeAllCinemas } = require('../scrapers/allocine');
const { runMatcher } = require('../matcher');

router.get('/matches', (req, res) => {
  const { username } = req.query;
  if (!username) return res.json([]);

  const matches = db.prepare(`
    SELECT m.id, w.tmdb_id, w.title, w.poster_url, w.synopsis, w.genres,
           s.film_title as show_title, s.date, s.time, s.version,
           c.name as cinema_name, c.address as cinema_address
    FROM matches m
    JOIN watchlist_films w ON m.tmdb_id = w.tmdb_id
    JOIN user_watchlists uw ON w.tmdb_id = uw.tmdb_id
    JOIN showtimes s ON m.showtime_id = s.id
    JOIN cinemas c ON s.cinema_id = c.allocine_id
    WHERE uw.username = ?
    ORDER BY s.date ASC, s.time ASC
  `).all(username);
  
  const grouped = {};
  matches.forEach(m => {
    if (!grouped[m.tmdb_id]) {
      grouped[m.tmdb_id] = {
        tmdb_id: m.tmdb_id,
        title: m.title,
        poster_url: m.poster_url,
        synopsis: m.synopsis,
        genres: JSON.parse(m.genres),
        shows: []
      };
    }
    grouped[m.tmdb_id].shows.push({
      date: m.date,
      time: m.time,
      version: m.version,
      cinema_name: m.cinema_name,
      cinema_address: m.cinema_address
    });
  });
  
  res.json(Object.values(grouped));
});

router.get('/watchlist', (req, res) => {
  const { username } = req.query;
  if (!username) return res.json([]);

  const films = db.prepare(`
    SELECT w.* FROM watchlist_films w
    JOIN user_watchlists uw ON w.tmdb_id = uw.tmdb_id
    WHERE uw.username = ?
    ORDER BY uw.added_at DESC
  `).all(username);

  // On récupère tous les matchs (séances) pour cet utilisateur
  const matches = db.prepare(`
    SELECT m.tmdb_id, s.date, s.time, s.version, c.name as cinema_name, c.address as cinema_address
    FROM matches m
    JOIN user_watchlists uw ON m.tmdb_id = uw.tmdb_id
    JOIN showtimes s ON m.showtime_id = s.id
    JOIN cinemas c ON s.cinema_id = c.allocine_id
    WHERE uw.username = ?
    ORDER BY s.date ASC, s.time ASC
  `).all(username);

  // On groupe les séances par tmdb_id
  const showsByFilm = {};
  matches.forEach(m => {
    if (!showsByFilm[m.tmdb_id]) showsByFilm[m.tmdb_id] = [];
    showsByFilm[m.tmdb_id].push({
      date: m.date,
      time: m.time,
      version: m.version,
      cinema_name: m.cinema_name,
      cinema_address: m.cinema_address
    });
  });

  res.json(films.map(f => ({
    ...f,
    genres: JSON.parse(f.genres),
    shows: showsByFilm[f.tmdb_id] || [] // On attache les séances au film (ou tableau vide)
  })));
});

router.get('/cinemas', (req, res) => {
  const cinemas = db.prepare('SELECT * FROM cinemas').all();
  res.json(cinemas);
});

router.post('/sync', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username missing" });
  
  res.json({ message: "Sync started. This might take a while.", success: true });
  
  try {
    const wRes = await scrapeWatchlist(username);
    console.log("Watchlist scraped:", wRes);
    await scrapeAllCinemas();
    runMatcher();
  } catch (err) {
    console.error("Sync error:", err);
  }
});

module.exports = router;
