import { useState, useEffect } from 'react';
import FilmCard from '../components/FilmCard';
import { fetchMatches, fetchCinemas } from '../lib/api';
import { RefreshCw, Film, MapPin } from 'lucide-react';
import CinemasMap from '../components/CinemasMap';

export default function Dashboard() {
  const [matches, setMatches] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("films"); // "films" or "cinemas"

  const loadData = async () => {
    const username = localStorage.getItem('letterboxd_username');
    if (!username) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [matchesData, cinemasData] = await Promise.all([
        fetchMatches(username),
        fetchCinemas()
      ]);
      setMatches(matchesData);
      setCinemas(cinemasData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute the inverted "Cinémas" view
  const cinemasView = {};
  if (viewMode === "cinemas") {
    // Initialize grouped structure mapping each cinema by its name
    cinemas.forEach(c => {
      cinemasView[c.name] = { ...c, matchedFilms: {} };
    });
    
    // Populate matchedFilms under the respective cinema
    matches.forEach(film => {
      film.shows.forEach(show => {
        if (cinemasView[show.cinema_name]) {
          if (!cinemasView[show.cinema_name].matchedFilms[film.tmdb_id]) {
            cinemasView[show.cinema_name].matchedFilms[film.tmdb_id] = { ...film, shows: [] };
          }
          // The showtimes listed under a FilmCard in this view will reflect only the séances for this particular cinema
          cinemasView[show.cinema_name].matchedFilms[film.tmdb_id].shows.push(show);
        }
      });
    });
  }

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          À l'affiche <span className="badge badge-match" style={{position:'static', marginLeft:'10px'}}>{matches.length}</span>
        </h1>
        
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'films' ? 'active' : ''}`}
            onClick={() => setViewMode('films')}
          >
            <Film size={16} /> Films
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'cinemas' ? 'active' : ''}`}
            onClick={() => setViewMode('cinemas')}
          >
            <MapPin size={16} /> Cinémas
          </button>
        </div>
      </div>
      
      {viewMode === "films" ? (
        matches.length === 0 ? (
          <div className="empty-state">
            <p className="mb-2">Aucun film de ta watchlist n'est au cinéma cette semaine 😢</p>
            <button className="btn" onClick={loadData} style={{ margin: '0 auto' }}>
              <RefreshCw size={18} /> Rafraîchir
            </button>
          </div>
        ) : (
          <div className="grid-list">
            {matches.map(film => (
              <FilmCard key={film.tmdb_id} film={film} isMatch={true} />
            ))}
          </div>
        )
      ) : (
        <div className="cinemas-view">
          <CinemasMap cinemasData={cinemasView} />
          {cinemas.map(cinema => {
            const cinemaData = cinemasView[cinema.name];
            // Render nothing here if cinemaData is mysteriously absent, but it shouldn't be
            if (!cinemaData) return null;

            const matchedFilms = Object.values(cinemaData.matchedFilms);
            
            // Trie les séances pour chaque film
            matchedFilms.forEach(film => {
              film.shows.sort((a, b) => {
                const timeA = `${a.date} ${a.time}`;
                const timeB = `${b.date} ${b.time}`;
                return timeA.localeCompare(timeB);
              });
            });

            // Trie les films par ordre chronologique de leur première séance
            matchedFilms.sort((a, b) => {
              const earliestA = a.shows.length > 0 ? `${a.shows[0].date} ${a.shows[0].time}` : "9999-99-99 99:99";
              const earliestB = b.shows.length > 0 ? `${b.shows[0].date} ${b.shows[0].time}` : "9999-99-99 99:99";
              return earliestA.localeCompare(earliestB);
            });
            
            return (
              <div key={cinema.allocine_id} id={`cinema-${cinema.allocine_id}`} className="cinema-section">
                <div className="cinema-header">
                  <div className="cinema-name">{cinema.name}</div>
                  <div className="cinema-address">{cinema.address}</div>
                </div>
                {matchedFilms.length > 0 ? (
                  <div className="cinema-films-grid grid-list" style={{ marginTop: '1rem' }}>
                    {matchedFilms.map(film => (
                      <FilmCard key={film.tmdb_id} film={film} isMatch={true} />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: '1.5rem 1rem', fontSize: '0.9rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    Aucun film de la watchlist ne passe dans ce cinéma.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
