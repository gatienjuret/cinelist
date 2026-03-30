const dotenv = require('dotenv');
dotenv.config();

const TMDB_TOKEN = process.env.TMDB_TOKEN;
const HEADERS = {
  Authorization: `Bearer ${TMDB_TOKEN}`,
  'Content-Type': 'application/json'
};

async function searchMovie(title) {
  try {
    const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&language=fr-FR`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error("TMDB Search Error");
    const data = await res.json();
    return data.results && data.results.length > 0 ? data.results[0] : null;
  } catch (err) {
    console.error("Error searching TMDB:", err);
    return null;
  }
}

async function getMovieDetails(tmdbId) {
  try {
    const url = `https://api.themoviedb.org/3/movie/${tmdbId}?language=fr-FR`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error("TMDB Details Error");
    return await res.json();
  } catch(err) {
    console.error("Error getting TMDB Details:", err);
    return null;
  }
}

module.exports = { searchMovie, getMovieDetails };
