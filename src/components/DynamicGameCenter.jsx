import { Activity, Clock, TrendingUp, TrendingDown, Target, Users } from 'lucide-react';
import './DynamicGameCenter.css';

export default function DynamicGameCenter({ game, oilersMomentum, opponentMomentum, loading }) {
  if (loading) {
    return (
      <div className="game-center">
        <div className="game-center-header">
          <Activity size={24} />
          <h2>Game Center</h2>
        </div>
        <div className="game-center-loading">Loading game information...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="game-center">
        <div className="game-center-header">
          <Activity size={24} />
          <h2>Game Center</h2>
        </div>
        <div className="game-center-empty">No games scheduled soon</div>
      </div>
    );
  }

  const formatGameTime = (utcTime) => {
    return new Date(utcTime).toLocaleString('en-US', {
      timeZone: 'America/Edmonton',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getTeamScore = (team, isOilers) => {
    return isOilers ? team.score : team.score;
  };

  // Live Game View
  if (game.isLive) {
    const oilersTeam = game.homeTeam?.abbrev === 'EDM' ? game.homeTeam : game.awayTeam;
    const opponentTeam = game.homeTeam?.abbrev === 'EDM' ? game.awayTeam : game.homeTeam;
    const oilersScore = oilersTeam.score || 0;
    const opponentScore = opponentTeam.score || 0;

    return (
      <div className="game-center">
        <div className="game-center-header live">
          <Activity size={24} />
          <h2>Live Game</h2>
          <span className="live-badge">
            <span className="live-dot"></span>
            LIVE
          </span>
        </div>

        <div className="game-center-content">
          {/* Live Score Display */}
          <div className="live-score-display">
            <div className="team-score oilers">
              <img src={oilersTeam.logo} alt="Oilers" className="team-logo-large" />
              <div className="team-info">
                <span className="team-name">OILERS</span>
                <span className="team-record">{oilersTeam.record}</span>
              </div>
              <div className="score">{oilersScore}</div>
            </div>

            <div className="score-divider">
              <div className="period-info">
                <span className="period">Period {game.period}</span>
                {game.clock && <span className="time">{game.clock}</span>}
              </div>
            </div>

            <div className="team-score opponent">
              <div className="score">{opponentScore}</div>
              <div className="team-info">
                <span className="team-name">{opponentTeam.abbrev}</span>
                <span className="team-record">{opponentTeam.record}</span>
              </div>
              <img src={opponentTeam.logo} alt={opponentTeam.abbrev} className="team-logo-large" />
            </div>
          </div>

          {/* Momentum Comparison */}
          <div className="momentum-comparison">
            <h3>
              <TrendingUp size={18} />
              Momentum Comparison
            </h3>
            <div className="momentum-bars">
              <div className="momentum-row">
                <span className="team-label">Oilers</span>
                <div className="momentum-bar-container">
                  <div
                    className="momentum-bar oilers"
                    style={{ width: `${oilersMomentum * 100}%` }}
                  ></div>
                </div>
                <span className="momentum-value">{(oilersMomentum * 100).toFixed(0)}</span>
              </div>
              <div className="momentum-row">
                <span className="team-label">{opponentTeam.abbrev}</span>
                <div className="momentum-bar-container">
                  <div
                    className="momentum-bar opponent"
                    style={{ width: `${opponentMomentum * 100}%` }}
                  ></div>
                </div>
                <span className="momentum-value">{(opponentMomentum * 100).toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Recent Game Recap
  if (game.isRecent) {
    const oilersTeam = game.homeTeam?.abbrev === 'EDM' ? game.homeTeam : game.awayTeam;
    const opponentTeam = game.homeTeam?.abbrev === 'EDM' ? game.awayTeam : game.homeTeam;
    const oilersScore = oilersTeam.score || 0;
    const opponentScore = opponentTeam.score || 0;
    const oilersWon = oilersScore > opponentScore;

    return (
      <div className="game-center">
        <div className="game-center-header recent">
          <Clock size={24} />
          <h2>Recent Game Recap</h2>
          <span className={`result-badge ${oilersWon ? 'win' : 'loss'}`}>
            {oilersWon ? 'W' : 'L'}
          </span>
        </div>

        <div className="game-center-content">
          <div className="recap-header">
            <span className="game-date">{formatGameTime(game.gameDate)}</span>
            <span className={`final-result ${oilersWon ? 'win' : 'loss'}`}>
              {oilersWon ? 'OILERS WIN!' : 'OILERS LOSE'}
            </span>
          </div>

          <div className="final-score-display">
            <div className="team-final oilers">
              <img src={oilersTeam.logo} alt="Oilers" className="team-logo-medium" />
              <span className="team-name">OILERS</span>
              <span className="final-score">{oilersScore}</span>
            </div>

            <div className="final-divider">FINAL</div>

            <div className="team-final opponent">
              <span className="final-score">{opponentScore}</span>
              <span className="team-name">{opponentTeam.abbrev}</span>
              <img src={opponentTeam.logo} alt={opponentTeam.abbrev} className="team-logo-medium" />
            </div>
          </div>

          {/* Momentum Impact */}
          <div className="momentum-impact">
            <h3>
              <TrendingUp size={18} />
              Momentum Impact
            </h3>
            <div className="momentum-bars">
              <div className="momentum-row">
                <span className="team-label">Oilers</span>
                <div className="momentum-bar-container">
                  <div
                    className="momentum-bar oilers"
                    style={{ width: `${oilersMomentum * 100}%` }}
                  ></div>
                </div>
                <span className="momentum-value">{(oilersMomentum * 100).toFixed(0)}</span>
              </div>
              <div className="momentum-row">
                <span className="team-label">{opponentTeam.abbrev}</span>
                <div className="momentum-bar-container">
                  <div
                    className="momentum-bar opponent"
                    style={{ width: `${opponentMomentum * 100}%` }}
                  ></div>
                </div>
                <span className="momentum-value">{(opponentMomentum * 100).toFixed(0)}</span>
              </div>
            </div>
            <p className="impact-note">
              {oilersMomentum > opponentMomentum
                ? `Oilers maintain higher momentum after this ${oilersWon ? 'victory' : 'game'}`
                : `Oilers' momentum ${oilersWon ? 'remains competitive despite the win' : 'affected by this loss'}`
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Upcoming Game Preview
  if (game.isUpcoming) {
    const opponent = game.homeTeam?.abbrev === 'EDM' ? game.awayTeam : game.homeTeam;
    const isHome = game.homeTeam?.abbrev === 'EDM';

    return (
      <div className="game-center">
        <div className="game-center-header upcoming">
          <Target size={24} />
          <h2>Next Game Preview</h2>
        </div>

        <div className="game-center-content">
          <div className="preview-matchup">
            <div className="preview-team oilers">
              <img src={game.homeTeam?.abbrev === 'EDM' ? game.homeTeam?.logo : game.awayTeam?.logo} alt="Oilers" className="team-logo-large" />
              <h3>EDMONTON OILERS</h3>
              <span className="location-badge">{isHome ? 'Home' : 'Away'}</span>
            </div>

            <div className="preview-vs">
              <span className="vs-text">VS</span>
              <div className="game-time">
                <Clock size={16} />
                <span>{formatGameTime(game.startTime || game.gameDate)}</span>
              </div>
            </div>

            <div className="preview-team opponent">
              <img src={opponent.logo} alt={opponent.abbrev} className="team-logo-large" />
              <h3>{opponent.placeName?.default || opponent.abbrev}</h3>
              <span className="location-badge">{isHome ? 'Visitor' : 'Home'}</span>
            </div>
          </div>

          {/* Momentum Comparison */}
          <div className="preview-momentum">
            <h3>
              <TrendingUp size={18} />
              Momentum Comparison
            </h3>
            <div className="momentum-bars">
              <div className="momentum-row">
                <span className="team-label">Oilers</span>
                <div className="momentum-bar-container">
                  <div
                    className="momentum-bar oilers"
                    style={{ width: `${oilersMomentum * 100}%` }}
                  ></div>
                </div>
                <span className="momentum-value">{(oilersMomentum * 100).toFixed(0)}</span>
              </div>
              <div className="momentum-row">
                <span className="team-label">{opponent.abbrev}</span>
                <div className="momentum-bar-container">
                  <div
                    className="momentum-bar opponent"
                    style={{ width: `${opponentMomentum * 100}%` }}
                  ></div>
                </div>
                <span className="momentum-value">{(opponentMomentum * 100).toFixed(0)}</span>
              </div>
            </div>
            <p className="matchup-note">
              {oilersMomentum > opponentMomentum
                ? `Oilers enter with ${((oilersMomentum - opponentMomentum) * 100).toFixed(0)} points higher momentum`
                : oilersMomentum < opponentMomentum
                ? `${opponent.abbrev} enters with ${((opponentMomentum - oilersMomentum) * 100).toFixed(0)} points higher momentum`
                : 'Both teams enter with equal momentum'
              }
            </p>
          </div>

          {/* Key Matchup Info */}
          <div className="key-matchups">
            <h3>
              <Users size={18} />
              Key Matchup Info
            </h3>
            <div className="matchup-grid">
              <div className="matchup-stat">
                <span className="stat-label">Oilers Recent Form</span>
                <span className="stat-value">{(oilersMomentum * 100).toFixed(0)}% Momentum</span>
              </div>
              <div className="matchup-stat">
                <span className="stat-label">{opponent.abbrev} Recent Form</span>
                <span className="stat-value">{(opponentMomentum * 100).toFixed(0)}% Momentum</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
