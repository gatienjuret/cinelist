const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'cinelist.db');
const db = new Database(dbPath);

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS watchlist_films (
      tmdb_id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      poster_url TEXT,
      synopsis TEXT,
      genres JSON,
      letterboxd_slug TEXT,
      runtime INTEGER,
      release_date TEXT,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_watchlists (
      username TEXT,
      tmdb_id INTEGER,
      added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (username, tmdb_id),
      FOREIGN KEY(tmdb_id) REFERENCES watchlist_films(tmdb_id)
    );

    CREATE TABLE IF NOT EXISTS cinemas (
      allocine_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      lat REAL,
      lng REAL,
      type TEXT
    );

    CREATE TABLE IF NOT EXISTS showtimes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cinema_id TEXT,
      film_title TEXT NOT NULL,
      tmdb_id INTEGER,
      date DATE,
      time TEXT,
      version TEXT,
      scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(cinema_id, film_title, date, time, version),
      FOREIGN KEY(cinema_id) REFERENCES cinemas(allocine_id)
    );

    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tmdb_id INTEGER,
      showtime_id INTEGER,
      notified BOOLEAN DEFAULT 0,
      matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(tmdb_id) REFERENCES watchlist_films(tmdb_id),
      FOREIGN KEY(showtime_id) REFERENCES showtimes(id),
      UNIQUE(tmdb_id, showtime_id)
    );
  `);
}

initDb();

module.exports = db;
