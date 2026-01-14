import { useState, useCallback } from 'react';
import Header from './components/Header';
import Search from './components/Search';
import TodaysGames from './components/TodaysGames';
import TopPlayers from './components/TopPlayers';
import HotGoalies from './components/HotGoalies';
import TopTeams from './components/TopTeams';
import TeamHeatMap from './components/TeamHeatMap';
import Methodology from './components/Methodology';
import {
  useTopPlayers,
  useTopTeams,
  useTopGoalies,
  useTodaysGames,
  useStandings,
} from './hooks/useNhlData';
import { clearCache } from './api/nhlApi';
import './App.css';

function App() {
  // Independent "last N games" controls for each section
  const [playerNumGames, setPlayerNumGames] = useState(10);
  const [goalieNumGames, setGoalieNumGames] = useState(10);
  const [teamNumGames, setTeamNumGames] = useState(10);

  // Data hooks
  const { data: todaysGames, loading: gamesLoading } = useTodaysGames();
  const { data: standings } = useStandings(); // For filter options

  const {
    data: players,
    loading: playersLoading,
    error: playersError,
    refetch: refetchPlayers,
  } = useTopPlayers(playerNumGames);

  const {
    data: goalies,
    loading: goaliesLoading,
    error: goaliesError,
    refetch: refetchGoalies,
  } = useTopGoalies(goalieNumGames);

  const {
    data: teams,
    loading: teamsLoading,
    error: teamsError,
    refetch: refetchTeams,
  } = useTopTeams(32, teamNumGames);

  const handleRefresh = useCallback(() => {
    clearCache();
    refetchPlayers();
    refetchGoalies();
    refetchTeams();
  }, [refetchPlayers, refetchGoalies, refetchTeams]);

  const isRefreshing = playersLoading || goaliesLoading || teamsLoading;

  return (
    <div className="app">
      <Header onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      <main className="dashboard">
        {/* Search */}
        <div className="dashboard-header">
          <Search />
        </div>

        {/* Today's Games Banner */}
        <TodaysGames
          games={todaysGames}
          loading={gamesLoading}
          teamHotness={teams}
        />

        {/* Main Grid */}
        <div className="dashboard-grid">
          {/* Hot Players */}
          <section className="dashboard-section players-section">
            <TopPlayers
              players={players}
              allTeams={standings}
              loading={playersLoading}
              error={playersError}
              onRetry={refetchPlayers}
              numGames={playerNumGames}
              onNumGamesChange={setPlayerNumGames}
            />
          </section>

          {/* Hot Goalies */}
          <section className="dashboard-section goalies-section">
            <HotGoalies
              goalies={goalies}
              allTeams={standings}
              loading={goaliesLoading}
              error={goaliesError}
              onRetry={refetchGoalies}
              numGames={goalieNumGames}
              onNumGamesChange={setGoalieNumGames}
            />
          </section>

          {/* Hot Teams */}
          <section className="dashboard-section teams-section">
            <TopTeams
              teams={teams}
              loading={teamsLoading}
              error={teamsError}
              onRetry={refetchTeams}
              numGames={teamNumGames}
              onNumGamesChange={setTeamNumGames}
            />
          </section>

          {/* Team Heat Map */}
          <section className="dashboard-section heatmap-section">
            <TeamHeatMap teams={teams} numGames={teamNumGames} />
          </section>
        </div>

        {/* Methodology Section */}
        <Methodology />

        <footer className="dashboard-footer">
          <p>
            Data provided by the NHL API. All times shown in Edmonton (MST/MDT).
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
