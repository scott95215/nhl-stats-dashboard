import { useState, useCallback } from 'react';
import Header from './components/Header';
import Search from './components/Search';
import TopPlayers from './components/TopPlayers';
import TopTeams from './components/TopTeams';
import { useTopPlayers, useTopTeams } from './hooks/useNhlData';
import { clearCache } from './api/nhlApi';
import './App.css';

function App() {
  const [numGames, setNumGames] = useState(10);

  const {
    data: players,
    loading: playersLoading,
    error: playersError,
    refetch: refetchPlayers,
  } = useTopPlayers(numGames);

  const {
    data: teams,
    loading: teamsLoading,
    error: teamsError,
    refetch: refetchTeams,
  } = useTopTeams(32, numGames);

  const handleRefresh = useCallback(() => {
    clearCache();
    refetchPlayers();
    refetchTeams();
  }, [refetchPlayers, refetchTeams]);

  const handleNumGamesChange = useCallback((value) => {
    setNumGames(value);
  }, []);

  const isRefreshing = playersLoading || teamsLoading;

  return (
    <div className="app">
      <Header onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      <main className="dashboard">
        <div className="dashboard-header">
          <Search />
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-section players-section">
            <TopPlayers
              players={players}
              loading={playersLoading}
              error={playersError}
              onRetry={refetchPlayers}
              numGames={numGames}
              onNumGamesChange={handleNumGamesChange}
            />
          </section>

          <section className="dashboard-section teams-section">
            <TopTeams
              teams={teams}
              loading={teamsLoading}
              error={teamsError}
              onRetry={refetchTeams}
              numGames={numGames}
              onNumGamesChange={handleNumGamesChange}
            />
          </section>
        </div>

        <footer className="dashboard-footer">
          <p>
            Data provided by the NHL API. Hotness calculated from last {numGames} games.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
