import { Calendar, MapPin, Clock } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import './OilersSchedule.css';

export default function OilersSchedule({ schedule, loading, onGameSelect }) {
  const formatGameTime = (utcTime) => {
    return new Date(utcTime).toLocaleTimeString('en-US', {
      timeZone: 'America/Edmonton',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getGameStatusClass = (game) => {
    if (game.gameState === 'LIVE' || game.gameState === 'CRIT') return 'live';
    if (game.gameState === 'FINAL' || game.gameState === 'OFF') return 'completed';
    if (game.isToday) return 'today';
    return 'upcoming';
  };

  const getGameStatusLabel = (game) => {
    if (game.gameState === 'LIVE' || game.gameState === 'CRIT') {
      return `P${game.period || 1} ${game.clock || ''}`.trim();
    }
    if (game.gameState === 'FINAL' || game.gameState === 'OFF') return 'Final';
    if (game.isToday) return 'TODAY';
    return formatGameTime(game.startTimeUTC);
  };

  if (loading) {
    return (
      <div className="oilers-schedule loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (!schedule?.length) {
    return (
      <div className="oilers-schedule empty">
        <Calendar size={24} />
        <span>No games scheduled this week</span>
      </div>
    );
  }

  return (
    <div className="oilers-schedule">
      <div className="schedule-header">
        <Calendar size={18} />
        <span>Upcoming Schedule</span>
        <span className="timezone-badge">Edmonton Time</span>
      </div>
      <div className="schedule-games">
        {schedule.map(game => {
          const statusClass = getGameStatusClass(game);
          const statusLabel = getGameStatusLabel(game);

          return (
            <div
              key={game.id}
              className={`schedule-game ${statusClass}`}
              onClick={() => onGameSelect?.(game)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onGameSelect?.(game)}
            >
              <div className="game-date">
                <span className="date-text">{formatDate(game.date)}</span>
                <span className={`status-badge ${statusClass}`}>
                  {statusClass === 'live' && <span className="live-pulse" />}
                  {statusLabel}
                </span>
              </div>

              <div className="game-matchup">
                <div className="opponent">
                  {game.opponent.logo && (
                    <img
                      src={game.opponent.logo}
                      alt={game.opponent.abbrev}
                      className="opponent-logo"
                    />
                  )}
                  <span className="opponent-name">
                    {game.isHome ? 'vs' : '@'} {game.opponent.name || game.opponent.abbrev}
                  </span>
                </div>

                {(game.gameState === 'LIVE' || game.gameState === 'CRIT' ||
                  game.gameState === 'FINAL' || game.gameState === 'OFF') && (
                  <div className="game-score">
                    <span className="oilers-score">{game.oilers.score ?? 0}</span>
                    <span className="score-divider">-</span>
                    <span className="opponent-score">{game.opponent.score ?? 0}</span>
                  </div>
                )}
              </div>

              <div className="game-info">
                <span className="game-location">
                  <MapPin size={12} />
                  {game.isHome ? 'Rogers Place' : game.venue || 'Away'}
                </span>
                {game.gameState === 'FUT' && (
                  <span className="game-time">
                    <Clock size={12} />
                    {formatGameTime(game.startTimeUTC)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
