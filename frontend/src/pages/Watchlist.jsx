import { useState, useEffect } from 'react';
import FilmCard from '../components/FilmCard';
import { fetchWatchlist, syncWatchlist } from '../lib/api';
import { RefreshCw } from 'lucide-react';

export default function Watchlist() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadFilms = async () => {
    const username = localStorage.getItem('letterboxd_username');
    if (!username) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchWatchlist(username);
      setFilms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilms();
  }, []);

  const handleSync = async () => {
    const username = localStorage.getItem('letterboxd_username');
    if (!username) {
      alert("Mets d'abord ton username Letterboxd dans les paramètres !");
      return;
    }
    setSyncing(true);
    try {
      const res = await syncWatchlist(username);
      if (res.success) {
        await loadFilms();
        // Optionnel: dire combien de films ont été trouvés si c'est la première fois
      }
    } catch (err) {
      alert("Erreur de synchronisation. Vérifie ton pseudonyme Letterboxd.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Ma Watchlist</h1>
        <button className="btn" onClick={handleSync} disabled={syncing} style={{ padding: '8px 12px', fontSize: '0.9rem' }}>
          <RefreshCw size={16} /> Sync
        </button>
      </div>
      
      {loading ? (
        <div className="grid-list">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton skeleton-poster" />
              <div className="skeleton skeleton-text" />
              <div className="skeleton skeleton-text-short" />
            </div>
          ))}
        </div>
      ) : films.length === 0 ? (
        <div className="empty-state">
          Ta watchlist est vide ici. <br/>
          <small style={{ color: '#888', marginTop: '10px', display: 'block' }}>
            Assure-toi que ton compte Letterboxd <b>{localStorage.getItem('letterboxd_username')}</b> a bien des films dans sa section "Watchlist" publique.
          </small>
        </div>
      ) : (
        <div className="grid-list">
          {films.map(film => (
            <FilmCard key={film.tmdb_id} film={film} />
          ))}
        </div>
      )}
    </div>
  );
}
