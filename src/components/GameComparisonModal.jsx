import { useEffect } from 'react';
import { X, Flame, Snowflake, TrendingUp, TrendingDown } from 'lucide-react';
import { formatRecord, formatGoalDiff } from '../utils/formatters';
import './GameComparisonModal.css';

export default function GameComparisonModal({ game, teamHotness, onClose }) {
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

  if (!game || !teamHotness) return null;

  // Get team data from hotness rankings
  const awayTeamData = teamHotness.find(t => t.id === game.awayTeam.abbrev);
  const homeTeamData = teamHotness.find(t => t.id === game.homeTeam.abbrev);

  // Sort teams by hotness to get rankings
  const sortedTeams = [...teamHotness].sort((a, b) => b.hotnessScore - a.hotnessScore);
  const awayRank = sortedTeams.findIndex(t => t.id === game.awayTeam.abbrev) + 1;
  const homeRank = sortedTeams.findIndex(t => t.id === game.homeTeam.abbrev) + 1;

  const awayHotter = awayRank < homeRank;
  const homeHotter = homeRank < awayRank;

  const getHotnessLabel = (rank) => {
    if (rank <= 5) return 'Hot';
    if (rank <= 10) return 'Warm';
    if (rank <= 22) return 'Cool';
    return 'Cold';
  };

  const getHotnessClass = (rank) => {
    if (rank <= 5) return 'hot';
    if (rank <= 10) return 'warm';
    if (rank <= 22) return 'cool';
    return 'cold';
  };

  const renderTeamSide = (teamData, gameTeam, rank, isHotter, side) => {
    if (!teamData) {
      return (
        <div className={`team-side ${side}`}>
          <img src={gameTeam.logo} alt={gameTeam.abbrev} className="comparison-logo" />
          <h3>{gameTeam.name || gameTeam.abbrev}</h3>
          <p className="no-data">No hotness data available</p>
        </div>
      );
    }

    return (
      <div className={`team-side ${side} ${isHotter ? 'hotter' : ''}`}>
        {isHotter && (
          <div className="hotter-badge">
            <Flame size={14} />
            <span>Hotter Team</span>
          </div>
        )}
        <img src={teamData.logo} alt={teamData.id} className="comparison-logo" />
        <h3>{teamData.commonName || teamData.name}</h3>
        <p className="team-division">{teamData.conferenceName} • {teamData.divisionName}</p>

        <div className={`hotness-rank ${getHotnessClass(rank)}`}>
          {rank <= 5 && <Flame size={16} />}
          {rank > sortedTeams.length - 5 && <Snowflake size={16} />}
          <span className="rank-number">#{rank}</span>
          <span className="rank-label">{getHotnessLabel(rank)}</span>
        </div>

        <div className="team-stats-grid">
          <div className="stat-item">
            <span className="stat-value">{formatRecord(teamData.wins, teamData.losses, teamData.otLosses)}</span>
            <span className="stat-label">Season</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{teamData.points}</span>
            <span className="stat-label">Points</span>
          </div>
        </div>

        <div className="recent-form-section">
          <h4>Recent Form</h4>
          <div className="team-stats-grid">
            <div className="stat-item">
              <span className="stat-value">{teamData.recentRecord}</span>
              <span className="stat-label">Record</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{(teamData.recentWinPct * 100).toFixed(0)}%</span>
              <span className="stat-label">Win %</span>
            </div>
            <div className="stat-item">
              <span className={`stat-value ${teamData.recentGoalDiff >= 0 ? 'positive' : 'negative'}`}>
                {formatGoalDiff(teamData.recentGoalDiff)}
              </span>
              <span className="stat-label">Goal Diff</span>
            </div>
            <div className="stat-item highlight">
              <span className="stat-value">{(teamData.hotnessScore * 100).toFixed(0)}</span>
              <span className="stat-label">Hotness</span>
            </div>
          </div>
        </div>

        <div className="trend-indicator">
          {teamData.recentWinPct >= 0.6 && (
            <>
              <TrendingUp size={16} className="trending-up" />
              <span>Trending Up</span>
            </>
          )}
          {teamData.recentWinPct <= 0.4 && (
            <>
              <TrendingDown size={16} className="trending-down" />
              <span>Trending Down</span>
            </>
          )}
          {teamData.recentWinPct > 0.4 && teamData.recentWinPct < 0.6 && (
            <span className="steady">Steady</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content game-comparison-modal">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="comparison-header">
          <h2>Game Matchup</h2>
          <p>Hotness Comparison</p>
        </div>

        <div className="comparison-body">
          {renderTeamSide(awayTeamData, game.awayTeam, awayRank, awayHotter, 'away')}

          <div className="vs-divider">
            <span className="vs-text">@</span>
            {game.gameState !== 'FUT' && (
              <div className="current-score">
                <span className="away-score">{game.awayTeam.score ?? '-'}</span>
                <span className="score-divider">-</span>
                <span className="home-score">{game.homeTeam.score ?? '-'}</span>
              </div>
            )}
          </div>

          {renderTeamSide(homeTeamData, game.homeTeam, homeRank, homeHotter, 'home')}
        </div>

        <div className="comparison-footer">
          <p>
            {awayHotter && awayTeamData && homeTeamData && (
              <>
                <Flame size={14} className="flame-icon" />
                {awayTeamData.commonName || awayTeamData.name} is currently {Math.abs(homeRank - awayRank)} spots higher in hotness rankings
              </>
            )}
            {homeHotter && awayTeamData && homeTeamData && (
              <>
                <Flame size={14} className="flame-icon" />
                {homeTeamData.commonName || homeTeamData.name} is currently {Math.abs(homeRank - awayRank)} spots higher in hotness rankings
              </>
            )}
            {!awayHotter && !homeHotter && 'Teams are evenly matched in hotness rankings'}
          </p>
        </div>
      </div>
    </div>
  );
}
