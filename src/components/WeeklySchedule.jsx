import { Calendar, Home, Plane, Clock } from 'lucide-react';
import './WeeklySchedule.css';

export default function WeeklySchedule({ games, loading }) {
  const formatGameDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'TODAY';
    }
    // Check if it's tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'TOMORROW';
    }
    // Otherwise return weekday
    return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/Edmonton' }).toUpperCase();
  };

  const formatGameTime = (utcTime) => {
    return new Date(utcTime).toLocaleTimeString('en-US', {
      timeZone: 'America/Edmonton',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'America/Edmonton'
    });
  };

  const getGameStatus = (game) => {
    if (game.gameState === 'LIVE' || game.gameState === 'CRIT') {
      return 'live';
    } else if (game.gameState === 'FINAL' || game.gameState === 'OFF') {
      return 'final';
    }
    return 'upcoming';
  };

  if (loading) {
    return (
      <div className="weekly-schedule">
        <div className="schedule-header">
          <Calendar size={24} />
          <h2>Upcoming Schedule</h2>
        </div>
        <div className="schedule-loading">Loading schedule...</div>
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="weekly-schedule">
        <div className="schedule-header">
          <Calendar size={24} />
          <h2>Upcoming Schedule</h2>
        </div>
        <div className="schedule-empty">No games scheduled in the next 7 days</div>
      </div>
    );
  }

  return (
    <div className="weekly-schedule">
      <div className="schedule-header">
        <Calendar size={24} />
        <h2>Upcoming Schedule</h2>
        <span className="schedule-subtitle">Next 7 Days</span>
      </div>

      <div className="schedule-grid">
        {games.map((game) => {
          const status = getGameStatus(game);
          const isToday = formatGameDate(game.date) === 'TODAY';

          return (
            <div
              key={game.id}
              className={`schedule-game ${status} ${isToday ? 'today' : ''}`}
            >
              {isToday && <div className="today-badge">TODAY</div>}

              <div className="game-date">
                <span className="game-day">{formatGameDate(game.date)}</span>
                <span className="game-full-date">{formatFullDate(game.date)}</span>
              </div>

              <div className="game-opponent">
                {game.opponentLogo && (
                  <img src={game.opponentLogo} alt={game.opponent} className="opponent-logo" />
                )}
                <div className="opponent-info">
                  <span className="opponent-abbrev">{game.opponent}</span>
                  <span className="opponent-name">{game.opponentName}</span>
                </div>
              </div>

              <div className="game-details">
                <div className="game-location">
                  {game.isHome ? (
                    <>
                      <Home size={14} />
                      <span>Home</span>
                    </>
                  ) : (
                    <>
                      <Plane size={14} />
                      <span>Away</span>
                    </>
                  )}
                </div>
                <div className="game-time">
                  <Clock size={14} />
                  <span>{formatGameTime(game.startTime)}</span>
                </div>
              </div>

              {status === 'live' && (
                <div className="live-indicator">
                  <span className="live-dot"></span>
                  LIVE
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
