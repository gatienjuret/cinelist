import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [0, 0],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function CinemasMap({ cinemasData }) {
  // Center of Paris
  const position = [48.8566, 2.3522];

  return (
    <div className="map-wrapper" style={{ height: '600px', width: '100%', marginBottom: '2rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
      <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {Object.values(cinemasData).map((cinema) => {
          if (!cinema.lat || !cinema.lng) return null;
          const matchedFilms = Object.values(cinema.matchedFilms);
          if (matchedFilms.length === 0) return null;

          return (
            <Marker key={cinema.allocine_id} position={[cinema.lat, cinema.lng]} icon={DefaultIcon}>
              <Tooltip direction="bottom" offset={[0, 10]} opacity={0.9} permanent>
                <span style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{cinema.name}</span>
              </Tooltip>
              <Popup className="custom-popup">
                <div style={{ minWidth: '150px', color: '#333' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: 'bold' }}>{cinema.name}</h4>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.85rem' }}>
                    {matchedFilms.map(film => (
                      <li key={film.tmdb_id} style={{ marginBottom: '4px' }}>
                        <strong>{film.title}</strong>
                      </li>
                    ))}
                  </ul>
                  <button
                    style={{
                      marginTop: '12px',
                      fontSize: '0.8rem',
                      padding: '6px 12px',
                      cursor: 'pointer',
                      background: '#e50914',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      width: '100%'
                    }}
                    onClick={() => {
                      const el = document.getElementById(`cinema-${cinema.allocine_id}`);
                      if (el) {
                        const y = el.getBoundingClientRect().top + window.scrollY - 80;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                      }
                    }}
                  >
                    Voir horaire(s)
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
