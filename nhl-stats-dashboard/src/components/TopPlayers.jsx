import { Flame } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { getPositionLabel } from '../utils/formatters';
import './TopPlayers.css';

export default function TopPlayers({ players, loading, error, onRetry, numGames, onNumGamesChange }) {
  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <Flame size={20} />
          <h2>Hottest Players</h2>
        </div>
        <LoadingSpinner message="Calculating player hotness..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <Flame size={20} />
          <h2>Hottest Players</h2>
        </div>
        <ErrorMessage message={error} onRetry={onRetry} />
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <Flame size={20} />
        <h2>Hottest Players</h2>
        <div className="period-selector">
          <span>Last</span>
          <select value={numGames} onChange={(e) => onNumGamesChange(Number(e.target.value))}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
          <span>games</span>
        </div>
      </div>
      <div className="players-list">
        {players?.map((player, index) => (
          <div key={player.id} className="player-row">
            <span className="player-rank">
              {index + 1}
              {index < 3 && <Flame size={12} className={`flame flame-${index + 1}`} />}
            </span>
            <div className="player-avatar">
              {player.headshot ? (
                <img src={player.headshot} alt={player.name} />
              ) : (
                <div className="avatar-placeholder">{player.name?.charAt(0)}</div>
              )}
            </div>
            <div className="player-info">
              <span className="player-name">{player.name}</span>
              <span className="player-meta">
                {player.teamAbbrev} • {getPositionLabel(player.position)}
              </span>
            </div>
            <div className="player-stats">
              <div className="stat-group recent-stats">
                <span className="stat-group-label">Last {numGames}</span>
                <div className="stat-row">
                  <div className="stat">
                    <span className="stat-value">{player.recentStats?.goals || 0}</span>
                    <span className="stat-label">G</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{player.recentStats?.assists || 0}</span>
                    <span className="stat-label">A</span>
                  </div>
                  <div className="stat stat-primary">
                    <span className="stat-value">{player.recentStats?.points || 0}</span>
                    <span className="stat-label">PTS</span>
                  </div>
                </div>
              </div>
              <div className="stat-group ppg-stat">
                <span className="ppg-value">{player.recentPointsPerGame?.toFixed(2) || '0.00'}</span>
                <span className="ppg-label">PPG</span>
              </div>
            </div>
          </div>
        ))}
        {(!players || players.length === 0) && (
          <p className="no-data">No player data available</p>
        )}
      </div>
    </div>
  );
}
