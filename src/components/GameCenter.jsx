import { Activity, Clock, Target, TrendingUp, Trophy, Calendar } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import MomentumComparison from './MomentumComparison';
import { useLiveGameData, useGameBoxscore, useMomentumComparison } from '../hooks/useNhlData';
import './GameCenter.css';

export default function GameCenter({ gameStatus }) {
  const { status, game } = gameStatus;

  if (status === 'none' || status === 'error' || !game) {
    return <NoGameView />;
  }

  if (status === 'live') {
    return <LiveGameView game={game} />;
  }

  if (status === 'recap') {
    return <RecapView game={game} />;
  }

  return <PreviewView game={game} />;
}

function NoGameView() {
  return (
    <div className="game-center no-game">
      <div className="no-game-content">
        <Calendar size={48} />
        <h3>No Upcoming Games</h3>
        <p>Check back later for the next Oilers game</p>
      </div>
    </div>
  );
}

function LiveGameView({ game }) {
  const { loading: liveLoading } = useLiveGameData(game.id);
  const { data: boxscore, loading: boxscoreLoading } = useGameBoxscore(game.id);
  const { data: momentum } = useMomentumComparison(game.opponent.abbrev);

  const formatPeriod = () => {
    if (!game.period) return 'Pre-Game';
    const periodNum = game.period;
    if (periodNum <= 3) return `${periodNum}${getOrdinalSuffix(periodNum)} Period`;
    if (game.periodType === 'OT') return 'Overtime';
    if (game.periodType === 'SO') return 'Shootout';
    return `${periodNum - 3}${getOrdinalSuffix(periodNum - 3)} OT`;
  };

  const getOrdinalSuffix = (n) => {
    if (n === 1) return 'st';
    if (n === 2) return 'nd';
    if (n === 3) return 'rd';
    return 'th';
  };

  return (
    <div className="game-center live-game">
      <div className="game-center-header live">
        <Activity size={20} />
        <span>LIVE GAME</span>
        <span className="live-indicator">
          <span className="live-dot" />
          {formatPeriod()} {game.clock && `- ${game.clock}`}
        </span>
      </div>

      <div className="live-scoreboard">
        <div className="team-side oilers">
          <img src={game.oilers.logo} alt="EDM" className="team-logo-large" />
          <span className="team-name">Edmonton</span>
          <span className="team-score">{game.oilers.score ?? 0}</span>
        </div>

        <div className="score-divider">
          <span className="vs-text">VS</span>
          <span className="game-venue">{game.isHome ? 'Home' : 'Away'}</span>
        </div>

        <div className="team-side opponent">
          <img src={game.opponent.logo} alt={game.opponent.abbrev} className="team-logo-large" />
          <span className="team-name">{game.opponent.name || game.opponent.abbrev}</span>
          <span className="team-score">{game.opponent.score ?? 0}</span>
        </div>
      </div>

      {(liveLoading || boxscoreLoading) ? (
        <LoadingSpinner message="Loading game stats..." />
      ) : (
        <div className="live-stats">
          {boxscore && (
            <div className="game-stats-grid">
              <StatRow
                label="Shots on Goal"
                oilersValue={getTeamStat(boxscore, 'EDM', 'sog')}
                opponentValue={getTeamStat(boxscore, game.opponent.abbrev, 'sog')}
              />
              <StatRow
                label="Power Play"
                oilersValue={getTeamStat(boxscore, 'EDM', 'powerPlay')}
                opponentValue={getTeamStat(boxscore, game.opponent.abbrev, 'powerPlay')}
              />
              <StatRow
                label="Faceoff %"
                oilersValue={getTeamStat(boxscore, 'EDM', 'faceoffWinningPctg')}
                opponentValue={getTeamStat(boxscore, game.opponent.abbrev, 'faceoffWinningPctg')}
                isPercent
              />
            </div>
          )}

          <MomentumComparison
            oilers={momentum.oilers}
            opponent={momentum.opponent}
            oilersRank={momentum.oilersRank}
            opponentRank={momentum.opponentRank}
            opponentName={game.opponent.name || game.opponent.abbrev}
          />
        </div>
      )}
    </div>
  );
}

function RecapView({ game }) {
  const { data: boxscore } = useGameBoxscore(game.id);
  const { data: momentum } = useMomentumComparison(game.opponent.abbrev);

  const oilersWon = (game.oilers.score ?? 0) > (game.opponent.score ?? 0);

  return (
    <div className="game-center recap">
      <div className="game-center-header recap">
        <Trophy size={20} />
        <span>GAME RECAP</span>
        <span className="result-badge">{oilersWon ? 'VICTORY' : 'DEFEAT'}</span>
      </div>

      <div className="recap-scoreboard">
        <div className="team-side oilers">
          <img src={game.oilers.logo} alt="EDM" className="team-logo-large" />
          <span className="team-name">Edmonton</span>
          <span className={`team-score ${oilersWon ? 'winner' : ''}`}>
            {game.oilers.score ?? 0}
          </span>
        </div>

        <div className="score-divider">
          <span className="final-text">FINAL</span>
          <span className="game-venue">{game.isHome ? 'Home' : 'Away'}</span>
        </div>

        <div className="team-side opponent">
          <img src={game.opponent.logo} alt={game.opponent.abbrev} className="team-logo-large" />
          <span className="team-name">{game.opponent.name || game.opponent.abbrev}</span>
          <span className={`team-score ${!oilersWon ? 'winner' : ''}`}>
            {game.opponent.score ?? 0}
          </span>
        </div>
      </div>

      <div className="recap-content">
        {boxscore && (
          <div className="game-stats-grid">
            <StatRow
              label="Shots on Goal"
              oilersValue={getTeamStat(boxscore, 'EDM', 'sog')}
              opponentValue={getTeamStat(boxscore, game.opponent.abbrev, 'sog')}
            />
            <StatRow
              label="Power Play"
              oilersValue={getTeamStat(boxscore, 'EDM', 'powerPlay')}
              opponentValue={getTeamStat(boxscore, game.opponent.abbrev, 'powerPlay')}
            />
            <StatRow
              label="Faceoff %"
              oilersValue={getTeamStat(boxscore, 'EDM', 'faceoffWinningPctg')}
              opponentValue={getTeamStat(boxscore, game.opponent.abbrev, 'faceoffWinningPctg')}
              isPercent
            />
          </div>
        )}

        <MomentumComparison
          oilers={momentum.oilers}
          opponent={momentum.opponent}
          oilersRank={momentum.oilersRank}
          opponentRank={momentum.opponentRank}
          opponentName={game.opponent.name || game.opponent.abbrev}
          showImpact
          oilersWon={oilersWon}
        />
      </div>
    </div>
  );
}

function PreviewView({ game }) {
  const { data: momentum, loading } = useMomentumComparison(game.opponent.abbrev);

  const formatGameTime = (utcTime) => {
    const date = new Date(utcTime);
    return {
      date: date.toLocaleDateString('en-US', {
        timeZone: 'America/Edmonton',
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        timeZone: 'America/Edmonton',
        hour: 'numeric',
        minute: '2-digit',
      }),
    };
  };

  const gameTime = formatGameTime(game.startTimeUTC);

  return (
    <div className="game-center preview">
      <div className="game-center-header preview">
        <Target size={20} />
        <span>NEXT GAME</span>
        {game.isToday && <span className="today-badge">TODAY</span>}
      </div>

      <div className="preview-matchup">
        <div className="team-side oilers">
          <img src={game.oilers.logo} alt="EDM" className="team-logo-large" />
          <span className="team-name">Edmonton Oilers</span>
        </div>

        <div className="matchup-info">
          <span className="vs-text">VS</span>
          <div className="game-datetime">
            <Clock size={14} />
            <span>{gameTime.date}</span>
            <span className="time">{gameTime.time}</span>
          </div>
          <span className="venue-text">{game.isHome ? 'Rogers Place' : `@ ${game.venue || 'Away'}`}</span>
        </div>

        <div className="team-side opponent">
          <img src={game.opponent.logo} alt={game.opponent.abbrev} className="team-logo-large" />
          <span className="team-name">{game.opponent.name || game.opponent.abbrev}</span>
        </div>
      </div>

      <div className="preview-content">
        {loading ? (
          <LoadingSpinner message="Loading momentum data..." />
        ) : (
          <MomentumComparison
            oilers={momentum.oilers}
            opponent={momentum.opponent}
            oilersRank={momentum.oilersRank}
            opponentRank={momentum.opponentRank}
            opponentName={game.opponent.name || game.opponent.abbrev}
            isPreview
          />
        )}
      </div>
    </div>
  );
}

function StatRow({ label, oilersValue, opponentValue, isPercent }) {
  const formatValue = (val) => {
    if (val === null || val === undefined) return '-';
    if (isPercent) return `${(val * 100).toFixed(1)}%`;
    return val;
  };

  const oilersNum = typeof oilersValue === 'number' ? oilersValue : 0;
  const opponentNum = typeof opponentValue === 'number' ? opponentValue : 0;
  const oilersWinning = oilersNum > opponentNum;

  return (
    <div className="stat-row">
      <span className={`stat-value oilers ${oilersWinning ? 'leading' : ''}`}>
        {formatValue(oilersValue)}
      </span>
      <span className="stat-label">{label}</span>
      <span className={`stat-value opponent ${!oilersWinning && opponentNum > oilersNum ? 'leading' : ''}`}>
        {formatValue(opponentValue)}
      </span>
    </div>
  );
}

// Helper to extract team stats from boxscore
function getTeamStat(boxscore, teamAbbrev, stat) {
  if (!boxscore) return null;

  const isHome = boxscore.homeTeam?.abbrev === teamAbbrev;
  const team = isHome ? boxscore.homeTeam : boxscore.awayTeam;

  if (!team) return null;

  switch (stat) {
    case 'sog':
      return team.sog;
    case 'powerPlay':
      return team.powerPlayConversion || `${team.powerPlayGoals || 0}/${team.powerPlayOpportunities || 0}`;
    case 'faceoffWinningPctg':
      return team.faceoffWinningPctg;
    default:
      return null;
  }
}
