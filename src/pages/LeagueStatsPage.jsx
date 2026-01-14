import { useState } from 'react';
import Search from '../components/Search';
import TodaysGames from '../components/TodaysGames';
import TopPlayers from '../components/TopPlayers';
import HotGoalies from '../components/HotGoalies';
import TopTeams from '../components/TopTeams';
import TeamHeatMap from '../components/TeamHeatMap';
import Methodology from '../components/Methodology';
import {
  useTopPlayers,
  useTopTeams,
  useTopGoalies,
  useTodaysGames,
  useStandings,
} from '../hooks/useNhlData';
import './LeagueStatsPage.css';

export default function LeagueStatsPage() {
  // Independent "last N games" controls for each section
  const [playerNumGames, setPlayerNumGames] = useState(10);
  const [goalieNumGames, setGoalieNumGames] = useState(10);
  const [teamNumGames, setTeamNumGames] = useState(10);

  // Data hooks
  const { data: todaysGames, loading: gamesLoading } = useTodaysGames();
  const { data: standings } = useStandings();

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

  return (
    <div className="league-stats-page">
      {/* Search */}
      <div className="page-header">
        <Search />
      </div>

      {/* Today's Games Banner */}
      <TodaysGames
        games={todaysGames}
        loading={gamesLoading}
        teamMomentum={teams}
      />


      {/* Main Grid */}
      <div className="stats-grid">
        {/* High Momentum Players */}
        <section className="stats-section players-section">
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

        {/* High Momentum Goalies */}
        <section className="stats-section goalies-section">
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

        {/* High Momentum Teams */}
        <section className="stats-section teams-section">
          <TopTeams
            teams={teams}
            loading={teamsLoading}
            error={teamsError}
            onRetry={refetchTeams}
            numGames={teamNumGames}
            onNumGamesChange={setTeamNumGames}
          />
        </section>

        {/* Team Momentum Heat Map */}
        <section className="stats-section heatmap-section">
          <TeamHeatMap teams={teams} numGames={teamNumGames} />
        </section>
      </div>

      {/* Methodology Section */}
      <Methodology />

      <footer className="page-footer">
        <p>
          Data provided by the NHL API. All times shown in Edmonton (MST/MDT).
        </p>
      </footer>
    </div>
  );
}
