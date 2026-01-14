import { useState, useMemo, useCallback } from 'react';
import { Shield, TrendingUp, Filter, X } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import PlayerModal from './PlayerModal';
import './HotGoalies.css';

export default function HotGoalies({ goalies, allTeams, loading, error, onRetry, numGames, onNumGamesChange }) {
  const [selectedGoalieId, setSelectedGoalieId] = useState(null);
  const [filters, setFilters] = useState({
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

  // Filter goalies based on all active filters
  const filteredGoalies = useMemo(() => {
    if (!goalies) return [];

    return goalies.filter(goalie => {
      // Team filter
      if (filters.team !== 'all' && goalie.teamAbbrev !== filters.team) {
        return false;
      }

      // Division/Conference filters (need team data)
      const teamInfo = getTeamInfo(goalie.teamAbbrev);
      if (filters.division !== 'all' && teamInfo?.divisionName !== filters.division) {
        return false;
      }
      if (filters.conference !== 'all' && teamInfo?.conferenceName !== filters.conference) {
        return false;
      }

      return true;
    });
  }, [goalies, filters, getTeamInfo]);

  const hasActiveFilters = Object.values(filters).some(v => v !== 'all');

  const resetFilters = () => {
    setFilters({ team: 'all', division: 'all', conference: 'all' });
  };

  const handleGoalieClick = (goalie) => {
    setSelectedGoalieId(goalie.id);
  };

  const handleCloseModal = () => {
    setSelectedGoalieId(null);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <Shield size={20} />
          <h2>High Momentum Goalies</h2>
        </div>
        <LoadingSpinner message="Calculating goalie momentum..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <Shield size={20} />
          <h2>High Momentum Goalies</h2>
        </div>
        <ErrorMessage message={error} onRetry={onRetry} />
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <Shield size={20} />
          <h2>High Momentum Goalies</h2>
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

        <div className="goalies-filters">
          <Filter size={14} />

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

        <div className="goalies-list">
          {filteredGoalies.map((goalie, index) => (
            <div
              key={goalie.id}
              className="goalie-row"
              onClick={() => handleGoalieClick(goalie)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleGoalieClick(goalie)}
            >
              <span className="goalie-rank">
                {index + 1}
                {index < 3 && <TrendingUp size={12} className={`trending trending-${index + 1}`} />}
              </span>

              <div className="goalie-avatar">
                {goalie.headshot ? (
                  <img src={goalie.headshot} alt={goalie.name} />
                ) : (
                  <div className="avatar-placeholder">{goalie.name?.charAt(0)}</div>
                )}
              </div>

              <div className="goalie-info">
                <span className="goalie-name">{goalie.name}</span>
                <span className="goalie-meta">{goalie.teamAbbrev}</span>
              </div>

              <div className="goalie-stats">
                <div className="stat">
                  <span className="stat-value">{(goalie.recentStats?.savePct * 100)?.toFixed(1) || '0.0'}%</span>
                  <span className="stat-label">SV%</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{goalie.recentStats?.gaa?.toFixed(2) || '0.00'}</span>
                  <span className="stat-label">GAA</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{goalie.recentStats?.wins || 0}-{goalie.recentStats?.losses || 0}</span>
                  <span className="stat-label">W-L</span>
                </div>
                <div className="momentum-badge">
                  <span>{(goalie.momentumScore * 100).toFixed(0)}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredGoalies.length === 0 && (
            <p className="no-data">
              {hasActiveFilters ? 'No goalies match the selected filters' : 'No goalie data available'}
            </p>
          )}
        </div>
      </div>

      {selectedGoalieId && (
        <PlayerModal
          playerId={selectedGoalieId}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
