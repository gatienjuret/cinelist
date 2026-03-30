import { Link } from 'react-router-dom';

export default function FilmCard({ film, isMatch }) {
  const posterUrl = film.poster_url 
    ? `https://image.tmdb.org/t/p/w500${film.poster_url}` 
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  return (
    <Link to={`/film/${film.tmdb_id}`} state={{ film }} className="film-card">
      <div className="film-poster-wrapper">
        <img src={posterUrl} alt={film.title} className="film-poster" loading="lazy" />
        {isMatch && <span className="badge badge-match">Au cinéma !</span>}
      </div>
      <div className="film-card-content">
        <h3 className="film-title">{film.title}</h3>
        {film.shows && (
          <div className="film-meta">
            <span className="badge-cinema">{film.shows.length} séance(s)</span>
          </div>
        )}
      </div>
    </Link>
  );
}
