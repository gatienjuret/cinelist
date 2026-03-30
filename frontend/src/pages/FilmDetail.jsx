import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function FilmDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  if (!state || !state.film) return <div className="page-container empty-state">Film introuvable</div>;
  
  const { film } = state;

  const posterUrl = film.poster_url 
    ? `https://image.tmdb.org/t/p/w500${film.poster_url}` 
    : 'https://via.placeholder.com/500x750?text=No+Poster';
    
  const groupedByDate = {};
  if (film.shows) {
    film.shows.forEach(show => {
      const date = show.date;
      if (!groupedByDate[date]) {
        groupedByDate[date] = {};
      }
      if (!groupedByDate[date][show.cinema_name]) {
        groupedByDate[date][show.cinema_name] = {
          name: show.cinema_name,
          address: show.cinema_address,
          times: []
        };
      }
      groupedByDate[date][show.cinema_name].times.push(show);
    });
  }

  const sortedDates = Object.keys(groupedByDate).sort();

  const formatDate = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (dateStr === today) return "Aujourd'hui";
    if (dateStr === tomorrowStr) return "Demain";
    
    return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn mb-1" style={{ width: 'fit-content', padding: '6px 12px', zIndex: 100, position:'relative' }}>
        <ChevronLeft size={20} /> Retour
      </button>

      <div className="detail-hero" style={{ backgroundImage: `url(${posterUrl})` }}></div>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <img src={posterUrl} alt={film.title} className="detail-poster" />
        <div style={{ marginTop: '-40px', position: 'relative', zIndex: 10 }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            {film.title}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {film.genres && film.genres.map(g => (
              <span key={g} className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>{g}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-1 mb-2">
        <h3 style={{ marginBottom: '0.5rem' }}>Synopsis</h3>
        <p className="text-secondary" style={{ fontSize: '0.9rem' }}>{film.synopsis || "Aucun synopsis disponible."}</p>
      </div>

      <div className="showtimes-section">
        {sortedDates.length > 0 ? (
          sortedDates.map(date => (
            <div key={date} className="date-group">
              <h3 className="date-header">{formatDate(date)}</h3>
              {Object.values(groupedByDate[date]).map(cinema => (
                <div key={cinema.name} className="cinema-group">
                  <div className="cinema-header">
                    <div className="cinema-name">{cinema.name}</div>
                    <div className="cinema-address">{cinema.address}</div>
                  </div>
                  <div className="showtimes-grid">
                    {cinema.times.map((time, i) => (
                      <div key={i} className="showtime-badge">
                        {time.time} 
                        <span className={`version-tag version-${time.version.toLowerCase()}`}>
                          {time.version}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            Aucune séance trouvée pour ce film actuellement.
          </div>
        )}
      </div>
    </div>
  );
}
