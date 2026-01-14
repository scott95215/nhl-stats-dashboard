import { useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Navigation from './components/Navigation';
import OilersFocusPage from './pages/OilersFocusPage';
import LeagueStatsPage from './pages/LeagueStatsPage';
import { clearCache } from './api/nhlApi';
import './App.css';

function App() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    clearCache();
    // Trigger a page reload to refresh all data
    window.location.reload();
  }, []);

  return (
    <div className="app">
      <Header onRefresh={handleRefresh} isRefreshing={isRefreshing} />
      <Navigation />

      <main className="dashboard">
        <Routes>
          <Route path="/" element={<OilersFocusPage />} />
          <Route path="/league" element={<LeagueStatsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
