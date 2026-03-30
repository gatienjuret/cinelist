const cheerio = require('cheerio');
const db = require('../db');

// Cinémas Art & Essai parisiens suivis par CinéList
const CINEMAS = [
  { id: 'C1559', name: 'La Cinémathèque française', address: '51, rue de Bercy 75012 Paris' },
  { id: 'C0073', name: 'Le Champo - Espace Jacques Tati', address: '51, rue des Écoles 75005 Paris' },
  { id: 'C0020', name: 'La Filmothèque du Quartier Latin', address: '9, rue Champollion 75005 Paris' },
  { id: 'C0074', name: 'Reflet Médicis', address: '3, rue Champollion 75005 Paris' },
  { id: 'C0072', name: 'Le Grand Action', address: '5, rue des Écoles 75005 Paris' },
  { id: 'C0015', name: 'Christine Cinéma Club', address: '4, rue Christine 75006 Paris' },
  { id: 'C0071', name: 'Écoles Cinéma Club', address: '23, rue des Écoles 75005 Paris' }
];

/**
 * Insère les cinémas dans la base de données s'ils n'existent pas déjà.
 */
function initializeCinemas() {
  const insert = db.prepare(`INSERT OR IGNORE INTO cinemas (allocine_id, name, address) VALUES (?, ?, ?)`);
  for (const c of CINEMAS) {
    insert.run(c.id, c.name, c.address);
  }
}

/**
 * Récupère les séances d'un cinéma pour un jour donné via la page HTML d'AlloCiné.
 * @param {string} cinemaId - ID AlloCiné du cinéma (ex: "C0073")
 * @param {number} dayIndex - 0 = aujourd'hui, 1 = demain
 * @param {string} dateStr - Date au format YYYY-MM-DD
 * @returns {Array} Liste de séances { film_title, date, time, version }
 */
async function fetchShowtimesFromHTML(cinemaId, dayIndex, dateStr) {
  const url = `https://www.allocine.fr/seance/salle_gen_csalle=${cinemaId}.html`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    if (!response.ok) {
      console.error(`[allocine] Erreur ${response.status} pour ${cinemaId}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // La page AlloCiné contient un bloc .showtimes-list-holder par jour
    const dayContainer = $('.showtimes-list-holder').eq(dayIndex);
    if (dayContainer.length === 0) return [];

    const results = [];

    dayContainer.find('.movie-card-theater').each((_, el) => {
      const title = $(el).find('.meta-title-link').text().trim();
      if (!title) return;

      const timesText = $(el).find('.showtimes-anchor, .showtimes-list-item').text();
      const timeMatches = timesText.match(/\d{2}:\d{2}/g);
      if (!timeMatches) return;

      let version = 'VO';
      if ($(el).text().includes('En VF')) version = 'VF';

      [...new Set(timeMatches)].forEach(time => {
        results.push({ film_title: title, date: dateStr, time, version });
      });
    });

    return results;
  } catch (error) {
    console.error(`[allocine] Erreur scraping ${cinemaId} jour ${dayIndex}:`, error.message);
    return [];
  }
}

/**
 * Scrape les séances de tous les cinémas pour aujourd'hui et demain.
 * Nettoie la base avant de la remplir.
 */
async function scrapeAllCinemas() {
  console.log('[allocine] Démarrage du scraping (2 jours)...');
  
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
    
    for (let dayIndex = 0; dayIndex < 2; dayIndex++) {
      const d = new Date();
      d.setDate(d.getDate() + dayIndex);
      const dateStr = d.toISOString().split('T')[0];

      const shows = await fetchShowtimesFromHTML(cinema.id, dayIndex, dateStr);
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
