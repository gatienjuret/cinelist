import { useState, useEffect } from 'react';
import FilmCard from '../components/FilmCard';
import { fetchMatches } from '../lib/api';
import { RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMatches = async () => {
    const username = localStorage.getItem('letterboxd_username');
    if (!username) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchMatches(username);
      setMatches(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  if (loading) return (
    <div>
      <h1 className="page-title">À l'affiche</h1>
      <div className="grid-list">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton skeleton-poster" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text-short" />
          </div>
        ))}
      </div>
    </div>
  );
  if (error) return <div className="page-container empty-state text-secondary">{error}</div>;

  return (
    <div>
      <h1 className="page-title">À l'affiche <span className="badge badge-match" style={{position:'static', marginLeft:'10px'}}>{matches.length}</span></h1>
      
      {matches.length === 0 ? (
        <div className="empty-state">
          <p className="mb-2">Aucun film de ta watchlist n'est au cinéma cette semaine 😢</p>
          <button className="btn" onClick={loadMatches} style={{ margin: '0 auto' }}>
            <RefreshCw size={18} /> Rafraîchir
          </button>
        </div>
      ) : (
        <div className="grid-list">
          {matches.map(film => (
            <FilmCard key={film.tmdb_id} film={film} isMatch={true} />
          ))}
        </div>
      )}
    </div>
  );
}
