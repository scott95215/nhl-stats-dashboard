import { useEffect } from 'react';
import { X } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { formatDate, formatRecord, formatGoalDiff } from '../utils/formatters';
import './TeamModal.css';

export default function TeamModal({ team, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!team) return null;

  // Prepare chart data from recent games
  let cumulativeWins = 0;
  let cumulativeGoalDiff = 0;

  const chartData = (team.recentGames || []).map((game, index) => {
    if (game.isWin) cumulativeWins++;
    cumulativeGoalDiff += game.teamScore - game.oppScore;

    return {
      game: index + 1,
      date: formatDate(game.date),
      opponent: game.opponent,
      goalsFor: game.teamScore,
      goalsAgainst: game.oppScore,
      goalDiff: game.teamScore - game.oppScore,
      cumulativeWinPct: ((cumulativeWins / (index + 1)) * 100).toFixed(1),
      cumulativeGoalDiff,
      result: game.isWin ? 'W' : 'L',
      isHome: game.isHome,
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="tooltip-date">{data.date} vs {data.opponent}</p>
          <p className="tooltip-score">
            <span className={data.result === 'W' ? 'win' : 'loss'}>{data.result}</span>
            {' '}{data.goalsFor}-{data.goalsAgainst}
            {data.isHome ? ' (H)' : ' (A)'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content team-modal">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="team-modal-header">
          {team.logo && <img src={team.logo} alt={team.name} className="team-modal-logo" />}
          <div className="team-modal-title">
            <h2>{team.name}</h2>
            <p>{team.conferenceName} Conference • {team.divisionName} Division</p>
          </div>
        </div>

        <div className="team-modal-stats">
          <div className="stat-section">
            <h3>Season Record</h3>
            <div className="stats-grid-3">
              <div className="stat-box">
                <span className="stat-value">{formatRecord(team.wins, team.losses, team.otLosses)}</span>
                <span className="stat-label">Overall</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{team.points}</span>
                <span className="stat-label">Points</span>
              </div>
              <div className="stat-box">
                <span className={`stat-value ${team.goalDifferential >= 0 ? 'positive' : 'negative'}`}>
                  {formatGoalDiff(team.goalDifferential)}
                </span>
                <span className="stat-label">Goal Diff</span>
              </div>
            </div>
          </div>

          <div className="stat-section">
            <h3>Home / Away</h3>
            <div className="stats-grid-2">
              <div className="stat-box">
                <span className="stat-value">{formatRecord(team.homeWins, team.homeLosses, team.homeOtLosses)}</span>
                <span className="stat-label">Home</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{formatRecord(team.roadWins, team.roadLosses, team.roadOtLosses)}</span>
                <span className="stat-label">Away</span>
              </div>
            </div>
          </div>

          <div className="stat-section">
            <h3>Recent Form ({team.recentGames?.length || 0} Games)</h3>
            <div className="stats-grid-4">
              <div className="stat-box">
                <span className="stat-value">{team.recentRecord}</span>
                <span className="stat-label">Record</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{(team.recentWinPct * 100).toFixed(0)}%</span>
                <span className="stat-label">Win %</span>
              </div>
              <div className="stat-box">
                <span className="stat-value">{team.recentGoalsFor}</span>
                <span className="stat-label">GF</span>
              </div>
              <div className="stat-box">
                <span className={`stat-value ${team.recentGoalDiff >= 0 ? 'positive' : 'negative'}`}>
                  {formatGoalDiff(team.recentGoalDiff)}
                </span>
                <span className="stat-label">GD</span>
              </div>
            </div>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="team-modal-chart">
            <h3>Performance Trend</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="game" tick={{ fontSize: 11 }} stroke="var(--color-text-secondary)" />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="var(--color-text-secondary)" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="var(--color-text-secondary)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <ReferenceLine yAxisId="right" y={0} stroke="var(--color-text-secondary)" strokeDasharray="3 3" />
                  <Line yAxisId="left" type="monotone" dataKey="goalsFor" name="Goals For" stroke="var(--color-success)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="left" type="monotone" dataKey="goalsAgainst" name="Goals Against" stroke="var(--color-error)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="cumulativeGoalDiff" name="Cumulative GD" stroke="var(--color-primary)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="team-modal-games">
          <h3>Recent Games</h3>
          <div className="games-list">
            {team.recentGames?.slice().reverse().map((game, index) => (
              <div key={index} className={`game-row ${game.isWin ? 'win' : 'loss'}`}>
                <span className="game-result">{game.isWin ? 'W' : 'L'}</span>
                <span className="game-score">{game.teamScore}-{game.oppScore}</span>
                <span className="game-opponent">{game.isHome ? 'vs' : '@'} {game.opponent}</span>
                <span className="game-date">{formatDate(game.date)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
