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
      await syncWatchlist(username);
      alert("Sync démarrée ! Les nouveaux matchs apparaîtront bientôt.");
    } catch (err) {
      alert("Erreur de synchronisation");
    } finally {
      setTimeout(() => {
        setSyncing(false);
        loadFilms();
      }, 2000);
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
        <div className="empty-state">Ta watchlist est vide. Fais une synchronisation !</div>
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
