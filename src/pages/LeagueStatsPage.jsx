import { useState } from 'react';
import TopPlayers from '../components/TopPlayers';
import HotGoalies from '../components/HotGoalies';
import TopTeams from '../components/TopTeams';
import TeamHeatMap from '../components/TeamHeatMap';
import Search from '../components/Search';
import Methodology from '../components/Methodology';
import { useTopPlayers, useTopGoalies, useTopTeams, useStandings } from '../hooks/useNhlData';
import './LeagueStatsPage.css';

export default function LeagueStatsPage() {
  const [playerNumGames, setPlayerNumGames] = useState(10);
  const [goalieNumGames, setGoalieNumGames] = useState(10);
  const [teamNumGames, setTeamNumGames] = useState(10);

  const { data: players, loading: playersLoading, error: playersError, refetch: retryPlayers } = useTopPlayers(playerNumGames);
  const { data: goalies, loading: goaliesLoading, error: goaliesError, refetch: retryGoalies } = useTopGoalies(goalieNumGames);
  const { data: teams, loading: teamsLoading, error: teamsError, refetch: retryTeams } = useTopTeams(32, teamNumGames);
  const { data: allTeams } = useStandings();

  return (
    <div className="league-stats-page">
      <div className="page-header">
        <h1>League Momentum Rankings</h1>
        <p>Track player, goalie, and team momentum across the NHL</p>
      </div>

      <div className="search-section">
        <Search />
      </div>

      <div className="stats-grid">
        <div className="players-section">
          <TopPlayers
            players={players}
            allTeams={allTeams}
            loading={playersLoading}
            error={playersError}
            onRetry={retryPlayers}
            numGames={playerNumGames}
            onNumGamesChange={setPlayerNumGames}
          />
        </div>

        <div className="goalies-section">
          <HotGoalies
            goalies={goalies}
            allTeams={allTeams}
            loading={goaliesLoading}
            error={goaliesError}
            onRetry={retryGoalies}
            numGames={goalieNumGames}
            onNumGamesChange={setGoalieNumGames}
          />
        </div>

        <div className="teams-section">
          <TopTeams
            teams={teams}
            loading={teamsLoading}
            error={teamsError}
            onRetry={retryTeams}
            numGames={teamNumGames}
            onNumGamesChange={setTeamNumGames}
          />
        </div>

        <div className="heatmap-section">
          <TeamHeatMap teams={teams} loading={teamsLoading} numGames={teamNumGames} />
        </div>
      </div>

      <Methodology />
    </div>
  );
}
