import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Film, ListVideo, Settings as SettingsIcon } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import FilmDetail from './pages/FilmDetail';
import Watchlist from './pages/Watchlist';
import Settings from './pages/Settings';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <div className="app-title">CinéList</div>
          <div className="user-badge" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            @gatienjrt
          </div>
        </header>

        <main className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/film/:id" element={<FilmDetail />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        <nav className="bottom-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Film size={24} />
            <span>À l'affiche</span>
          </NavLink>
          <NavLink to="/watchlist" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ListVideo size={24} />
            <span>Watchlist</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <SettingsIcon size={24} />
            <span>Paramètres</span>
          </NavLink>
        </nav>
      </div>
    </Router>
  );
}

export default App;
