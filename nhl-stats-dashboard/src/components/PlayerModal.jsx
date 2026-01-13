import { useEffect } from 'react';
import { X } from 'lucide-react';
import { usePlayerDetails } from '../hooks/useNhlData';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { getPositionLabel } from '../utils/formatters';
import './PlayerModal.css';

export default function PlayerModal({ playerId, onClose }) {
  const { data: player, loading, error } = usePlayerDetails(playerId);

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

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {loading && <LoadingSpinner message="Loading player details..." />}

        {error && <ErrorMessage message={error} />}

        {player && (
          <>
            <div className="player-header">
              <div className="player-photo">
                {player.headshot ? (
                  <img src={player.headshot} alt={player.firstName?.default} />
                ) : (
                  <div className="photo-placeholder">
                    {player.firstName?.default?.charAt(0)}
                    {player.lastName?.default?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="player-title">
                <h2>
                  {player.firstName?.default} {player.lastName?.default}
                </h2>
                <p className="player-team">
                  #{player.sweaterNumber} • {player.teamLogo && (
                    <img src={player.teamLogo} alt="" className="team-logo-small" />
                  )}
                  {player.fullTeamName?.default || 'N/A'}
                </p>
                <p className="player-position">
                  {getPositionLabel(player.position)}
                </p>
              </div>
            </div>

            <div className="player-bio">
              <div className="bio-item">
                <span className="bio-label">Height</span>
                <span className="bio-value">{player.heightInInches ? `${Math.floor(player.heightInInches / 12)}'${player.heightInInches % 12}"` : 'N/A'}</span>
              </div>
              <div className="bio-item">
                <span className="bio-label">Weight</span>
                <span className="bio-value">{player.weightInPounds ? `${player.weightInPounds} lbs` : 'N/A'}</span>
              </div>
              <div className="bio-item">
                <span className="bio-label">Birthplace</span>
                <span className="bio-value">{player.birthCity?.default || 'N/A'}, {player.birthCountry || ''}</span>
              </div>
              <div className="bio-item">
                <span className="bio-label">Age</span>
                <span className="bio-value">{player.currentAge || 'N/A'}</span>
              </div>
            </div>

            {player.featuredStats?.regularSeason?.subSeason && (
              <div className="player-season-stats">
                <h3>Current Season Stats</h3>
                {player.position !== 'G' ? (
                  <div className="stats-grid">
                    <div className="stat-box">
                      <span className="stat-value">{player.featuredStats.regularSeason.subSeason.gamesPlayed || 0}</span>
                      <span className="stat-label">GP</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-value">{player.featuredStats.regularSeason.subSeason.goals || 0}</span>
                      <span className="stat-label">Goals</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-value">{player.featuredStats.regularSeason.subSeason.assists || 0}</span>
                      <span className="stat-label">Assists</span>
                    </div>
                    <div className="stat-box stat-primary">
                      <span className="stat-value">{player.featuredStats.regularSeason.subSeason.points || 0}</span>
                      <span className="stat-label">Points</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-value">{player.featuredStats.regularSeason.subSeason.plusMinus || 0}</span>
                      <span className="stat-label">+/-</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-value">{player.featuredStats.regularSeason.subSeason.pim || 0}</span>
                      <span className="stat-label">PIM</span>
                    </div>
                  </div>
                ) : (
                  <div className="stats-grid">
                    <div className="stat-box">
                      <span className="stat-value">{player.featuredStats.regularSeason.subSeason.gamesPlayed || 0}</span>
                      <span className="stat-label">GP</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-value">{player.featuredStats.regularSeason.subSeason.wins || 0}</span>
                      <span className="stat-label">Wins</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-value">{player.featuredStats.regularSeason.subSeason.losses || 0}</span>
                      <span className="stat-label">Losses</span>
                    </div>
                    <div className="stat-box stat-primary">
                      <span className="stat-value">{player.featuredStats.regularSeason.subSeason.savePctg?.toFixed(3) || '.000'}</span>
                      <span className="stat-label">SV%</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-value">{player.featuredStats.regularSeason.subSeason.goalsAgainstAvg?.toFixed(2) || '0.00'}</span>
                      <span className="stat-label">GAA</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-value">{player.featuredStats.regularSeason.subSeason.shutouts || 0}</span>
                      <span className="stat-label">SO</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {player.careerTotals?.regularSeason && (
              <div className="player-career-stats">
                <h3>Career Totals</h3>
                {player.position !== 'G' ? (
                  <div className="stats-grid">
                    <div className="stat-box">
                      <span className="stat-value">{player.careerTotals.regularSeason.gamesPlayed || 0}</span>
                      <span className="stat-label">GP</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-value">{player.careerTotals.regularSeason.goals || 0}</span>
                      <span className="stat-label">Goals</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-value">{player.careerTotals.regularSeason.assists || 0}</span>
                      <span className="stat-label">Assists</span>
                    </div>
                    <div className="stat-box stat-primary">
                      <span className="stat-value">{player.careerTotals.regularSeason.points || 0}</span>
                      <span className="stat-label">Points</span>
                    </div>
                  </div>
                ) : (
                  <div className="stats-grid">
                    <div className="stat-box">
                      <span className="stat-value">{player.careerTotals.regularSeason.gamesPlayed || 0}</span>
                      <span className="stat-label">GP</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-value">{player.careerTotals.regularSeason.wins || 0}</span>
                      <span className="stat-label">Wins</span>
                    </div>
                    <div className="stat-box stat-primary">
                      <span className="stat-value">{player.careerTotals.regularSeason.savePctg?.toFixed(3) || '.000'}</span>
                      <span className="stat-label">SV%</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-value">{player.careerTotals.regularSeason.shutouts || 0}</span>
                      <span className="stat-label">SO</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
