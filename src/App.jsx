import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Target, BarChart3, RefreshCw } from 'lucide-react';
import OilersFocusPage from './pages/OilersFocusPage';
import LeagueStatsPage from './pages/LeagueStatsPage';
import { clearCache } from './api/nhlApi';
import './App.css';

function Navigation() {
  const location = useLocation();

  const handleRefresh = () => {
    clearCache();
    window.location.reload();
  };

  return (
    <header className="app-header">
      <div className="app-header-content">
        <div className="app-branding">
          <div className="app-logo">
            <div className="logo-icon">EDM</div>
          </div>
          <div className="app-title">
            <h1>Oilers Momentum Tracker</h1>
            <p>Edmonton Oilers Analytics & League Stats</p>
          </div>
        </div>

        <nav className="app-nav">
          <Link
            to="/"
            className={`nav-tab ${location.pathname === '/' ? 'active' : ''}`}
          >
            <Target size={20} />
            <span>Oilers Focus</span>
          </Link>
          <Link
            to="/league"
            className={`nav-tab ${location.pathname === '/league' ? 'active' : ''}`}
          >
            <BarChart3 size={20} />
            <span>League Stats</span>
          </Link>
        </nav>

        <button onClick={handleRefresh} className="refresh-button" title="Refresh data">
          <RefreshCw size={20} />
        </button>
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navigation />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<OilersFocusPage />} />
            <Route path="/league" element={<LeagueStatsPage />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <p>
            Data provided by the NHL API. All times shown in Edmonton (MST/MDT).
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
