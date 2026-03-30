import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function Settings() {
  const [username, setUsername] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('letterboxd_username');
    if (stored) setUsername(stored);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('letterboxd_username', username);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="page-title">Paramètres</h1>
      
      <form onSubmit={handleSave} style={{ backgroundColor: 'var(--surface-color)', padding: '1.5rem', borderRadius: 'var(--radius)' }}>
        <div className="input-group">
          <label className="input-label" htmlFor="username">Username Letterboxd</label>
          <input 
            type="text" 
            id="username" 
            className="input-field" 
            placeholder="Ex: gatienjrt" 
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        
        <button type="submit" className="btn" style={{ width: '100%' }}>
          <Save size={18} /> {saved ? 'Sauvegardé !' : 'Enregistrer'}
        </button>
      </form>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Cinémas suivis</h3>
        <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.2rem' }}>
          <li>La Cinémathèque française</li>
          <li>Le Champo - Espace Jacques Tati</li>
          <li>La Filmothèque du Quartier Latin</li>
          <li>Reflet Médicis</li>
          <li>Le Grand Action</li>
          <li>Christine Cinéma Club</li>
          <li>Écoles Cinéma Club</li>
        </ul>
      </div>
    </div>
  );
}
