import { useState, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import TeamModal from './TeamModal';
import './TeamHeatMap.css';

// Custom tooltip component - moved outside to avoid recreation during render
function CustomTooltip({ active, payload, numGames }) {
  if (active && payload && payload.length) {
    const team = payload[0].payload;
    return (
      <div className="heatmap-tooltip">
        <div className="tooltip-header">
          {team.logo && <img src={team.logo} alt={team.name} />}
          <strong>{team.name}</strong>
        </div>
        <div className="tooltip-stats">
          <span>Season: {team.wins}-{team.losses}-{team.otLosses} ({team.seasonSuccess.toFixed(1)}%)</span>
          <span>Last {numGames}: {team.recentRecord}</span>
          <span>Hotness: {team.recentHotness.toFixed(1)}%</span>
        </div>
      </div>
    );
  }
  return null;
}

// Custom shape component for team logos - moved outside
function TeamLogo({ cx, cy, payload, onTeamClick }) {
  const size = 28;

  return (
    <g
      style={{ cursor: 'pointer' }}
      onClick={() => onTeamClick(payload)}
    >
      <image
        x={cx - size / 2}
        y={cy - size / 2}
        width={size}
        height={size}
        href={payload.logo}
        clipPath="circle(50%)"
      />
    </g>
  );
}

export default function TeamHeatMap({ teams, numGames }) {
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!teams) return [];

    return teams.map(team => ({
      ...team,
      // X-axis: Season success (point percentage)
      seasonSuccess: team.gamesPlayed > 0 ? (team.points / (team.gamesPlayed * 2)) * 100 : 0,
      // Y-axis: Recent hotness (already calculated 0-1, convert to percentage)
      recentHotness: team.hotnessScore * 100,
    }));
  }, [teams]);

  // Calculate medians for quadrant lines
  const medians = useMemo(() => {
    if (!chartData.length) return { x: 50, y: 50 };

    const xValues = chartData.map(d => d.seasonSuccess).sort((a, b) => a - b);
    const yValues = chartData.map(d => d.recentHotness).sort((a, b) => a - b);

    const mid = Math.floor(chartData.length / 2);

    return {
      x: xValues[mid],
      y: yValues[mid],
    };
  }, [chartData]);

  // Domain for axes
  const xDomain = useMemo(() => {
    if (!chartData.length) return [30, 80];
    const xValues = chartData.map(d => d.seasonSuccess);
    const min = Math.floor(Math.min(...xValues) - 5);
    const max = Math.ceil(Math.max(...xValues) + 5);
    return [Math.max(min, 20), Math.min(max, 90)];
  }, [chartData]);

  const yDomain = useMemo(() => {
    if (!chartData.length) return [0, 100];
    const yValues = chartData.map(d => d.recentHotness);
    const min = Math.floor(Math.min(...yValues) - 5);
    const max = Math.ceil(Math.max(...yValues) + 5);
    return [Math.max(min, 0), Math.min(max, 100)];
  }, [chartData]);

  const handleTeamClick = (team) => {
    setSelectedTeam(team);
  };

  return (
    <>
      <div className="card team-heatmap">
        <div className="card-header">
          <TrendingUp size={20} />
          <h2>Team Performance Heat Map</h2>
        </div>

        <div className="heatmap-legend">
          <div className="legend-item">
            <span className="legend-color hot-success" />
            <span>Hot & Winning</span>
          </div>
          <div className="legend-item">
            <span className="legend-color hot-struggle" />
            <span>Hot but Losing</span>
          </div>
          <div className="legend-item">
            <span className="legend-color cold-success" />
            <span>Cold but Winning</span>
          </div>
          <div className="legend-item">
            <span className="legend-color cold-struggle" />
            <span>Cold & Losing</span>
          </div>
        </div>

        <div className="heatmap-container">
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 30, bottom: 50, left: 50 }}>
              {/* Quadrant background colors */}
              <ReferenceArea
                x1={medians.x}
                x2={xDomain[1]}
                y1={medians.y}
                y2={yDomain[1]}
                fill="rgba(34, 197, 94, 0.1)"
                fillOpacity={1}
              />
              <ReferenceArea
                x1={xDomain[0]}
                x2={medians.x}
                y1={medians.y}
                y2={yDomain[1]}
                fill="rgba(234, 179, 8, 0.1)"
                fillOpacity={1}
              />
              <ReferenceArea
                x1={medians.x}
                x2={xDomain[1]}
                y1={yDomain[0]}
                y2={medians.y}
                fill="rgba(59, 130, 246, 0.1)"
                fillOpacity={1}
              />
              <ReferenceArea
                x1={xDomain[0]}
                x2={medians.x}
                y1={yDomain[0]}
                y2={medians.y}
                fill="rgba(239, 68, 68, 0.1)"
                fillOpacity={1}
              />

              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />

              <XAxis
                type="number"
                dataKey="seasonSuccess"
                name="Season Point %"
                domain={xDomain}
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                tickLine={{ stroke: 'var(--color-border)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
                label={{
                  value: 'Season Point %',
                  position: 'bottom',
                  offset: 5,
                  style: { fontSize: 12, fill: 'var(--color-text-secondary)' }
                }}
              />
              <YAxis
                type="number"
                dataKey="recentHotness"
                name="Recent Hotness"
                domain={yDomain}
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                tickLine={{ stroke: 'var(--color-border)' }}
                axisLine={{ stroke: 'var(--color-border)' }}
                label={{
                  value: 'Recent Hotness',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  style: { fontSize: 12, fill: 'var(--color-text-secondary)', textAnchor: 'middle' }
                }}
              />

              {/* Reference lines at medians */}
              <ReferenceLine
                x={medians.x}
                stroke="var(--color-text-secondary)"
                strokeDasharray="5 5"
                strokeOpacity={0.5}
              />
              <ReferenceLine
                y={medians.y}
                stroke="var(--color-text-secondary)"
                strokeDasharray="5 5"
                strokeOpacity={0.5}
              />

              <Tooltip content={<CustomTooltip numGames={numGames} />} />

              <Scatter
                data={chartData}
                shape={(props) => <TeamLogo {...props} onTeamClick={handleTeamClick} />}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <p className="heatmap-hint">Click on a team logo to view detailed stats</p>
      </div>

      {selectedTeam && (
        <TeamModal team={selectedTeam} onClose={() => setSelectedTeam(null)} />
      )}
    </>
  );
}
