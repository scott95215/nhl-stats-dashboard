import { useState, useMemo } from 'react';
import { Flame, Filter } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import TeamModal from './TeamModal';
import { formatGoalDiff, formatRecord } from '../utils/formatters';
import './TopTeams.css';

export default function TopTeams({ teams, loading, error, onRetry, numGames, onNumGamesChange }) {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [conferenceFilter, setConferenceFilter] = useState('all');
  const [divisionFilter, setDivisionFilter] = useState('all');

  // Get unique conferences and divisions for filter options
  const { conferences, divisions } = useMemo(() => {
    if (!teams) return { conferences: [], divisions: [] };

    const confs = [...new Set(teams.map(t => t.conferenceName).filter(Boolean))];
    const divs = [...new Set(teams.map(t => t.divisionName).filter(Boolean))];

    return { conferences: confs.sort(), divisions: divs.sort() };
  }, [teams]);

  // Filter teams based on selected filters
  const filteredTeams = useMemo(() => {
    if (!teams) return [];

    return teams.filter(team => {
      if (conferenceFilter !== 'all' && team.conferenceName !== conferenceFilter) return false;
      if (divisionFilter !== 'all' && team.divisionName !== divisionFilter) return false;
      return true;
    });
  }, [teams, conferenceFilter, divisionFilter]);

  const handleTeamClick = (team) => {
    setSelectedTeam(team);
  };

  const handleCloseModal = () => {
    setSelectedTeam(null);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <Flame size={20} />
          <h2>Hottest Teams</h2>
        </div>
        <LoadingSpinner message="Calculating team hotness..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <Flame size={20} />
          <h2>Hottest Teams</h2>
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
          <h2>Hottest Teams</h2>
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

        <div className="teams-filters">
          <Filter size={16} />
          <select value={conferenceFilter} onChange={(e) => {
            setConferenceFilter(e.target.value);
            if (e.target.value !== 'all') setDivisionFilter('all');
          }}>
            <option value="all">All Conferences</option>
            {conferences.map(conf => (
              <option key={conf} value={conf}>{conf}</option>
            ))}
          </select>
          <select value={divisionFilter} onChange={(e) => setDivisionFilter(e.target.value)}>
            <option value="all">All Divisions</option>
            {divisions.map(div => (
              <option key={div} value={div}>{div}</option>
            ))}
          </select>
        </div>

        <div className="teams-table-container">
          <table className="teams-table">
            <thead>
              <tr>
                <th className="rank-col">#</th>
                <th className="team-col">Team</th>
                <th>Record</th>
                <th>L{numGames}</th>
                <th>GD</th>
                <th className="hotness-col">Hot</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((team, index) => (
                <tr
                  key={team.id}
                  className="team-row"
                  onClick={() => handleTeamClick(team)}
                >
                  <td className="rank-col">
                    {index + 1}
                    {index < 3 && <Flame size={10} className={`flame flame-${index + 1}`} />}
                  </td>
                  <td className="team-col">
                    <div className="team-info">
                      {team.logo && (
                        <img src={team.logo} alt={team.name} className="team-logo" />
                      )}
                      <div className="team-names">
                        <span className="team-name">{team.commonName || team.name}</span>
                        <span className="team-abbrev">{team.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>{formatRecord(team.wins, team.losses, team.otLosses)}</td>
                  <td className="recent-record">
                    <span className={team.recentWinPct >= 0.5 ? 'positive' : 'negative'}>
                      {team.recentRecord}
                    </span>
                  </td>
                  <td className={team.recentGoalDiff >= 0 ? 'positive' : 'negative'}>
                    {formatGoalDiff(team.recentGoalDiff)}
                  </td>
                  <td className="hotness-col">
                    <div className="hotness-bar">
                      <div
                        className="hotness-fill"
                        style={{ width: `${Math.min(team.hotnessScore * 100, 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTeams.length === 0 && (
            <p className="no-data">No teams match the selected filters</p>
          )}
        </div>
        <p className="table-hint">Click a team to view detailed stats and trends</p>
      </div>

      {selectedTeam && (
        <TeamModal team={selectedTeam} onClose={handleCloseModal} />
      )}
    </>
  );
}
