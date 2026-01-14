import { useEffect, useState } from 'react';
import WeeklySchedule from '../components/WeeklySchedule';
import DynamicGameCenter from '../components/DynamicGameCenter';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getOilersWeeklySchedule, getOilersCurrentGame, getTeamMomentumScore } from '../api/nhlApi';
import './OilersFocusPage.css';

export default function OilersFocusPage() {
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [oilersMomentum, setOilersMomentum] = useState(0);
  const [opponentMomentum, setOpponentMomentum] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOilersData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch schedule and current game in parallel
      const [schedule, game] = await Promise.all([
        getOilersWeeklySchedule(),
        getOilersCurrentGame()
      ]);

      setWeeklySchedule(schedule);
      setCurrentGame(game);

      // Calculate momentum scores for Oilers and opponent
      if (game) {
        const opponent = game.homeTeam?.abbrev === 'EDM' ? game.awayTeam?.abbrev : game.homeTeam?.abbrev;
        const [oilersScore, oppScore] = await Promise.all([
          getTeamMomentumScore('EDM', 10),
          getTeamMomentumScore(opponent, 10)
        ]);

        setOilersMomentum(oilersScore);
        setOpponentMomentum(oppScore);
      }
    } catch (err) {
      console.error('Error loading Oilers data:', err);
      setError('Failed to load Oilers data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOilersData();

    // Refresh every 60 seconds for live game updates
    const interval = setInterval(loadOilersData, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading && !currentGame && weeklySchedule.length === 0) {
    return (
      <div className="oilers-focus-page">
        <LoadingSpinner message="Loading Oilers information..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="oilers-focus-page">
        <ErrorMessage message={error} onRetry={loadOilersData} />
      </div>
    );
  }

  return (
    <div className="oilers-focus-page">
      <div className="page-header">
        <h1>Oilers Command Center</h1>
        <p>Your hub for Edmonton Oilers game information and momentum tracking</p>
      </div>

      <WeeklySchedule games={weeklySchedule} loading={loading} />

      <DynamicGameCenter
        game={currentGame}
        oilersMomentum={oilersMomentum}
        opponentMomentum={opponentMomentum}
        loading={loading}
      />
    </div>
  );
}
