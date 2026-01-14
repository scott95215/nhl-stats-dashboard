import { useState, useMemo, useCallback } from 'react';
import { Flame, Filter, X } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import PlayerModal from './PlayerModal';
import { getPositionLabel } from '../utils/formatters';
import './TopPlayers.css';

export default function TopPlayers({ players, allTeams, loading, error, onRetry, numGames, onNumGamesChange }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [filters, setFilters] = useState({
    position: 'all',
    team: 'all',
    division: 'all',
    conference: 'all',
  });

  // Get unique filter options from teams data
  const filterOptions = useMemo(() => {
    if (!allTeams) return { teams: [], divisions: [], conferences: [] };

    return {
      teams: [...new Set(allTeams.map(t => t.id))].sort(),
      divisions: [...new Set(allTeams.map(t => t.divisionName).filter(Boolean))].sort(),
      conferences: [...new Set(allTeams.map(t => t.conferenceName).filter(Boolean))].sort(),
    };
  }, [allTeams]);

  // Get team info for filtering by division/conference
  const getTeamInfo = useCallback((teamAbbrev) => {
    return allTeams?.find(t => t.id === teamAbbrev);
  }, [allTeams]);

  // Filter players based on all active filters
  const filteredPlayers = useMemo(() => {
    if (!players) return [];

    return players.filter(player => {
      // Position filter
      if (filters.position !== 'all') {
        // Map position filter to actual position codes
        const positionMap = {
          F: ['C', 'L', 'R', 'LW', 'RW'],
          C: ['C'],
          LW: ['L', 'LW'],
          RW: ['R', 'RW'],
          D: ['D'],
        };
        const validPositions = positionMap[filters.position] || [filters.position];
        if (!validPositions.includes(player.position)) return false;
      }

      // Team filter
      if (filters.team !== 'all' && player.teamAbbrev !== filters.team) {
        return false;
      }

      // Division/Conference filters (need team data)
      const teamInfo = getTeamInfo(player.teamAbbrev);
      if (filters.division !== 'all' && teamInfo?.divisionName !== filters.division) {
        return false;
      }
      if (filters.conference !== 'all' && teamInfo?.conferenceName !== filters.conference) {
        return false;
      }

      return true;
    });
  }, [players, filters, getTeamInfo]);

  const hasActiveFilters = Object.values(filters).some(v => v !== 'all');

  const resetFilters = () => {
    setFilters({ position: 'all', team: 'all', division: 'all', conference: 'all' });
  };

  const handlePlayerClick = (player) => {
    setSelectedPlayerId(player.id);
  };

  const handleCloseModal = () => {
    setSelectedPlayerId(null);
  };

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
    <>
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

        <div className="players-filters">
          <Filter size={14} />

          <select
            value={filters.position}
            onChange={(e) => setFilters(f => ({ ...f, position: e.target.value }))}
          >
            <option value="all">All Positions</option>
            <option value="F">Forwards</option>
            <option value="C">Center</option>
            <option value="LW">Left Wing</option>
            <option value="RW">Right Wing</option>
            <option value="D">Defense</option>
          </select>

          <select
            value={filters.team}
            onChange={(e) => setFilters(f => ({ ...f, team: e.target.value }))}
          >
            <option value="all">All Teams</option>
            {filterOptions.teams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>

          <select
            value={filters.division}
            onChange={(e) => setFilters(f => ({ ...f, division: e.target.value }))}
          >
            <option value="all">All Divisions</option>
            {filterOptions.divisions.map(div => (
              <option key={div} value={div}>{div}</option>
            ))}
          </select>

          <select
            value={filters.conference}
            onChange={(e) => setFilters(f => ({ ...f, conference: e.target.value }))}
          >
            <option value="all">All Conferences</option>
            {filterOptions.conferences.map(conf => (
              <option key={conf} value={conf}>{conf}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button className="reset-filters" onClick={resetFilters}>
              <X size={12} /> Reset
            </button>
          )}
        </div>

        <div className="players-list scrollable">
          {filteredPlayers.map((player, index) => (
            <div
              key={player.id}
              className="player-row clickable"
              onClick={() => handlePlayerClick(player)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handlePlayerClick(player)}
            >
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
          {filteredPlayers.length === 0 && (
            <p className="no-data">
              {hasActiveFilters ? 'No players match the selected filters' : 'No player data available'}
            </p>
          )}
        </div>
      </div>

      {selectedPlayerId && (
        <PlayerModal
          playerId={selectedPlayerId}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
