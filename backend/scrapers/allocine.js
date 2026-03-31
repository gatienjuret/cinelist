const db = require('../db');

// Cinémas Art & Essai parisiens suivis par CinéList
const CINEMAS = [
  { id: 'C1559', name: 'La Cinémathèque française', address: '51, rue de Bercy 75012 Paris', lat: 48.8384, lng: 2.3820 },
  { id: 'C0073', name: 'Le Champo - Espace Jacques Tati', address: '51, rue des Écoles 75005 Paris', lat: 48.8499, lng: 2.3431 },
  { id: 'C0020', name: 'La Filmothèque du Quartier Latin', address: '9, rue Champollion 75005 Paris', lat: 48.8491, lng: 2.3423 },
  { id: 'C0074', name: 'Reflet Médicis', address: '3, rue Champollion 75005 Paris', lat: 48.8488, lng: 2.3427 },
  { id: 'C0072', name: 'Le Grand Action', address: '5, rue des Écoles 75005 Paris', lat: 48.8489, lng: 2.3508 },
  { id: 'C0015', name: 'Christine Cinéma Club', address: '4, rue Christine 75006 Paris', lat: 48.8546, lng: 2.3394 },
  { id: 'C0071', name: 'Écoles Cinéma Club', address: '23, rue des Écoles 75005 Paris', lat: 48.8493, lng: 2.3473 }
];

/**
 * Insère les cinémas dans la base de données s'ils n'existent pas déjà.
 */
function initializeCinemas() {
  const insert = db.prepare(`INSERT OR IGNORE INTO cinemas (allocine_id, name, address, lat, lng) VALUES (?, ?, ?, ?, ?)`);
  for (const c of CINEMAS) {
    insert.run(c.id, c.name, c.address, c.lat, c.lng);
  }
}

/**
 * Récupère les séances d'un cinéma pour un jour donné via l'API interne d'AlloCiné.
 * @param {string} cinemaId - ID AlloCiné du cinéma (ex: "C0073")
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @returns {Array} Liste de séances { film_title, date, time, version }
 */
async function fetchShowtimesFromAPI(cinemaId, dateStr) {
  const url = `https://www.allocine.fr/_/showtimes/theater-${cinemaId}/d-${dateStr}/`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filters: [] })
    });

    if (!response.ok) {
      console.error(`[allocine] Erreur ${response.status} pour ${cinemaId}`);
      return [];
    }

    const data = await response.json();
    if (data.error || !data.results) return [];

    const results = [];
    for (const item of data.results) {
      const title = item.movie?.title;
      if (!title) continue;

      if (item.showtimes) {
        for (const [key, shows] of Object.entries(item.showtimes)) {
          if (Array.isArray(shows)) {
            shows.forEach(show => {
              if (show.startsAt) {
                // startsAt format: "2026-04-02T14:15:00" or similar
                const timeWithTZ = show.startsAt.split('T')[1];
                if (timeWithTZ) {
                  const timeStr = timeWithTZ.substring(0, 5); // "14:15"
                  let version = 'VO';
                  if (key.includes('dubbed') || show.diffusionVersion === 'FRENCH') {
                    version = 'VF';
                  }

                  results.push({ film_title: title, date: dateStr, time: timeStr, version });
                }
              }
            });
          }
        }
      }
    }

    // Remove exact duplicates just in case
    const uniqueResults = [];
    const seen = new Set();
    for (const r of results) {
      const id = `${r.film_title}-${r.date}-${r.time}-${r.version}`;
      if (!seen.has(id)) {
        seen.add(id);
        uniqueResults.push(r);
      }
    }

    return uniqueResults;
  } catch (error) {
    console.error(`[allocine] Erreur scraping API ${cinemaId} jour ${dateStr}:`, error.message);
    return [];
  }
}

/**
 * Scrape les séances de tous les cinémas pour aujourd'hui et demain.
 * Nettoie la base avant de la remplir.
 */
async function scrapeAllCinemas() {
  console.log('[allocine] Démarrage du scraping (7 jours)...');
  
  db.prepare('DELETE FROM matches').run();
  db.prepare('DELETE FROM showtimes').run();
  db.prepare('DELETE FROM cinemas').run();
  initializeCinemas();

  const insert = db.prepare(`
    INSERT OR IGNORE INTO showtimes (cinema_id, film_title, date, time, version)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const cinema of CINEMAS) {
    console.log(`[allocine] ${cinema.name}`);
    
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const d = new Date();
      d.setDate(d.getDate() + dayIndex);
      const dateStr = d.toISOString().split('T')[0];

      const shows = await fetchShowtimesFromAPI(cinema.id, dateStr);
      console.log(`  → ${dateStr}: ${shows.length} séances`);

      for (const s of shows) {
        try { insert.run(cinema.id, s.film_title, s.date, s.time, s.version); } catch(e) {}
      }
    }

    // Pause entre les cinémas pour éviter le rate-limiting Cloudflare
    await new Promise(r => setTimeout(r, 4000));
  }

  console.log('[allocine] Scraping terminé.');
}

module.exports = { scrapeAllCinemas, CINEMAS };
