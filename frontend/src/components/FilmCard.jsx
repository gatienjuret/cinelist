import { Link } from 'react-router-dom';

export default function FilmCard({ film, isMatch }) {
  const posterUrl = film.poster_url 
    ? `https://image.tmdb.org/t/p/w500${film.poster_url}` 
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  const formatRuntime = (minutes) => {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const formatYear = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.substring(0, 4);
  };

  return (
    <Link to={`/film/${film.tmdb_id}`} state={{ film }} className="film-card">
      <div className="film-poster-wrapper">
        <img src={posterUrl} alt={film.title} className="film-poster" loading="lazy" />
        {isMatch && <span className="badge badge-match">Au cinéma !</span>}
      </div>
      <div className="film-card-content">
        <h3 className="film-title" style={{ marginBottom: '4px' }}>{film.title}</h3>
        <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '8px' }}>
          {formatYear(film.release_date)} {film.runtime ? `• ${formatRuntime(film.runtime)}` : ''}
        </div>
        {film.shows && (
          <div className="film-meta">
            <span className="badge-cinema">{film.shows.length} séance(s)</span>
          </div>
        )}
      </div>
    </Link>
  );
}
