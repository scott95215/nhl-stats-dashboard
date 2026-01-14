import { useState } from 'react';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import GameComparisonModal from './GameComparisonModal';
import './TodaysGames.css';

export default function TodaysGames({ games, loading, teamMomentum }) {
  const [selectedGame, setSelectedGame] = useState(null);

  // Function to get team momentum indicator
  const getMomentumIndicator = (teamAbbrev) => {
    if (!teamMomentum?.length) return null;

    const sortedTeams = [...teamMomentum].sort((a, b) => b.hotnessScore - a.hotnessScore);
    const rank = sortedTeams.findIndex(t => t.id === teamAbbrev);

    if (rank === -1) return null;
    // Top 5 = high momentum, Bottom 5 = low momentum
    if (rank < 5) return { type: 'high', rank: rank + 1 };
    if (rank >= sortedTeams.length - 5) return { type: 'low', rank: sortedTeams.length - rank };
    return null;
  };

  // Get team record from momentum data
  const getTeamRecord = (teamAbbrev) => {
    const team = teamMomentum?.find(t => t.id === teamAbbrev);
    if (!team) return null;
    return `${team.wins}-${team.losses}-${team.otLosses}`;
  };

  const formatGameTime = (utcTime) => {
    return new Date(utcTime).toLocaleTimeString('en-US', {
      timeZone: 'America/Edmonton',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getGameStatus = (game) => {
    switch (game.gameState) {
      case 'LIVE':
      case 'CRIT':
        return { label: `P${game.period} ${game.clock || ''}`.trim(), live: true };
      case 'FINAL':
      case 'OFF':
        return { label: 'Final', live: false };
      default:
        return { label: formatGameTime(game.startTime), live: false };
    }
  };

  if (loading) {
    return (
      <div className="todays-games-banner loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (!games?.length) {
    return (
      <div className="todays-games-banner empty">
        <Calendar size={20} />
        <span>No games scheduled today</span>
      </div>
    );
  }

  return (
    <div className="todays-games-banner">
      <div className="banner-header">
        <Calendar size={18} />
        <span>Today's Games</span>
        <span className="banner-timezone">Edmonton Time</span>
      </div>
      <div className="games-scroll">
        {games.map(game => {
          const status = getGameStatus(game);
          const homeMomentum = getMomentumIndicator(game.homeTeam.abbrev);
          const awayMomentum = getMomentumIndicator(game.awayTeam.abbrev);
          const homeRecord = getTeamRecord(game.homeTeam.abbrev);
          const awayRecord = getTeamRecord(game.awayTeam.abbrev);

          return (
            <div
              key={game.id}
              className={`game-card ${status.live ? 'live' : ''}`}
              onClick={() => setSelectedGame(game)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedGame(game)}
            >
              <div className={`game-status ${status.live ? 'live' : ''}`}>
                {status.live && <span className="live-dot" />}
                {status.label}
              </div>

              <div className="game-teams">
                <div className="team away">
                  <div className="team-logo-wrapper">
                    {game.awayTeam.logo && (
                      <img src={game.awayTeam.logo} alt={game.awayTeam.abbrev} />
                    )}
                    {awayMomentum && (
                      <span className={`momentum-icon ${awayMomentum.type}`}>
                        {awayMomentum.type === 'high'
                          ? <TrendingUp size={10} />
                          : <TrendingDown size={10} />
                        }
                      </span>
                    )}
                  </div>
                  <span className="team-abbrev">{game.awayTeam.abbrev}</span>
                  {awayRecord && <span className="team-record">{awayRecord}</span>}
                  {game.gameState !== 'FUT' && (
                    <span className="score">{game.awayTeam.score ?? '-'}</span>
                  )}
                </div>

                <span className="vs">@</span>

                <div className="team home">
                  <div className="team-logo-wrapper">
                    {game.homeTeam.logo && (
                      <img src={game.homeTeam.logo} alt={game.homeTeam.abbrev} />
                    )}
                    {homeMomentum && (
                      <span className={`momentum-icon ${homeMomentum.type}`}>
                        {homeMomentum.type === 'high'
                          ? <TrendingUp size={10} />
                          : <TrendingDown size={10} />
                        }
                      </span>
                    )}
                  </div>
                  <span className="team-abbrev">{game.homeTeam.abbrev}</span>
                  {homeRecord && <span className="team-record">{homeRecord}</span>}
                  {game.gameState !== 'FUT' && (
                    <span className="score">{game.homeTeam.score ?? '-'}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedGame && (
        <GameComparisonModal
          game={selectedGame}
          teamMomentum={teamMomentum}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </div>
  );
}
