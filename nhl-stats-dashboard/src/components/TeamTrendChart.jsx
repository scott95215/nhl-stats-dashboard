import { LineChart } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useTeamRecentGames } from '../hooks/useNhlData';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { formatDate } from '../utils/formatters';
import './TeamTrendChart.css';

export default function TeamTrendChart({ teamAbbrev }) {
  const { data: games, loading, error } = useTeamRecentGames(teamAbbrev, 15);

  if (!teamAbbrev) {
    return (
      <div className="card chart-card">
        <div className="card-header">
          <LineChart size={20} />
          <h2>Team Performance Trend</h2>
        </div>
        <div className="chart-placeholder">
          <p>Select a team from the standings to view their recent performance trend</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card chart-card">
        <div className="card-header">
          <LineChart size={20} />
          <h2>Team Performance Trend - {teamAbbrev}</h2>
        </div>
        <LoadingSpinner message="Loading game data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card chart-card">
        <div className="card-header">
          <LineChart size={20} />
          <h2>Team Performance Trend - {teamAbbrev}</h2>
        </div>
        <ErrorMessage message={error} />
      </div>
    );
  }

  // Calculate cumulative stats for trend visualization
  let cumulativeWins = 0;
  let cumulativeGoalDiff = 0;

  const chartData = games.map((game, index) => {
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
          <p>Goal Diff: {data.goalDiff > 0 ? '+' : ''}{data.goalDiff}</p>
          <p>Win %: {data.cumulativeWinPct}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card chart-card">
      <div className="card-header">
        <LineChart size={20} />
        <h2>Team Performance Trend - {teamAbbrev}</h2>
      </div>
      <div className="chart-stats">
        <div className="chart-stat">
          <span className="stat-label">Last {games.length} Games</span>
          <span className="stat-value">
            {games.filter(g => g.isWin).length}W - {games.filter(g => !g.isWin).length}L
          </span>
        </div>
        <div className="chart-stat">
          <span className="stat-label">Goal Differential</span>
          <span className={`stat-value ${cumulativeGoalDiff >= 0 ? 'positive' : 'negative'}`}>
            {cumulativeGoalDiff > 0 ? '+' : ''}{cumulativeGoalDiff}
          </span>
        </div>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={280}>
          <RechartsLineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="game"
              tick={{ fontSize: 12 }}
              stroke="var(--color-text-secondary)"
              label={{ value: 'Game', position: 'bottom', offset: -5, fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              stroke="var(--color-text-secondary)"
              label={{ value: 'Goals', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              stroke="var(--color-text-secondary)"
              label={{ value: 'Cumulative GD', angle: 90, position: 'insideRight', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <ReferenceLine yAxisId="right" y={0} stroke="var(--color-text-secondary)" strokeDasharray="3 3" />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="goalsFor"
              name="Goals For"
              stroke="var(--color-success)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-success)', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="goalsAgainst"
              name="Goals Against"
              stroke="var(--color-error)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-error)', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumulativeGoalDiff"
              name="Cumulative GD"
              stroke="var(--color-primary)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
