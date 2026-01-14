import { TrendingUp, TrendingDown, Zap } from 'lucide-react';
import './MomentumComparison.css';

export default function MomentumComparison({
  oilers,
  opponent,
  oilersRank,
  opponentRank,
  opponentName,
  showImpact = false,
  oilersWon = false,
  isPreview = false,
}) {
  if (!oilers || !opponent) {
    return (
      <div className="momentum-comparison loading">
        <p>Loading momentum data...</p>
      </div>
    );
  }

  const oilersMomentum = (oilers.hotnessScore * 100).toFixed(0);
  const opponentMomentum = (opponent.hotnessScore * 100).toFixed(0);
  const momentumDiff = oilersMomentum - opponentMomentum;
  const oilersAdvantage = momentumDiff > 0;

  return (
    <div className="momentum-comparison">
      <div className="momentum-header">
        <Zap size={18} />
        <h3>Momentum Score Comparison</h3>
        {isPreview && (
          <span className="preview-label">Based on last 10 games</span>
        )}
      </div>

      <div className="momentum-bars">
        <div className="momentum-team oilers">
          <div className="team-header">
            <span className="team-label">Oilers</span>
            <span className="rank-badge">#{oilersRank} in NHL</span>
          </div>
          <div className="momentum-bar-container">
            <div
              className="momentum-bar oilers-bar"
              style={{ width: `${Math.min(oilersMomentum, 100)}%` }}
            >
              <span className="momentum-value">{oilersMomentum}</span>
            </div>
          </div>
          <div className="recent-form">
            <span className="form-label">Recent:</span>
            <span className="form-record">{oilers.recentRecord}</span>
            <span className={`form-diff ${oilers.recentGoalDiff >= 0 ? 'positive' : 'negative'}`}>
              {oilers.recentGoalDiff >= 0 ? '+' : ''}{oilers.recentGoalDiff} GD
            </span>
          </div>
        </div>

        <div className="momentum-team opponent">
          <div className="team-header">
            <span className="team-label">{opponentName}</span>
            <span className="rank-badge">#{opponentRank} in NHL</span>
          </div>
          <div className="momentum-bar-container">
            <div
              className="momentum-bar opponent-bar"
              style={{ width: `${Math.min(opponentMomentum, 100)}%` }}
            >
              <span className="momentum-value">{opponentMomentum}</span>
            </div>
          </div>
          <div className="recent-form">
            <span className="form-label">Recent:</span>
            <span className="form-record">{opponent.recentRecord}</span>
            <span className={`form-diff ${opponent.recentGoalDiff >= 0 ? 'positive' : 'negative'}`}>
              {opponent.recentGoalDiff >= 0 ? '+' : ''}{opponent.recentGoalDiff} GD
            </span>
          </div>
        </div>
      </div>

      <div className={`momentum-verdict ${oilersAdvantage ? 'favorable' : 'unfavorable'}`}>
        {oilersAdvantage ? (
          <>
            <TrendingUp size={20} />
            <span>
              Oilers have <strong>+{momentumDiff}</strong> momentum advantage
            </span>
          </>
        ) : momentumDiff === 0 ? (
          <>
            <span>Teams are evenly matched in momentum</span>
          </>
        ) : (
          <>
            <TrendingDown size={20} />
            <span>
              {opponentName} has <strong>+{Math.abs(momentumDiff)}</strong> momentum advantage
            </span>
          </>
        )}
      </div>

      {showImpact && (
        <div className={`game-impact ${oilersWon ? 'positive' : 'negative'}`}>
          <span className="impact-label">Game Impact:</span>
          <span className="impact-text">
            {oilersWon
              ? 'This victory will boost the Oilers\' momentum score'
              : 'This loss may affect the Oilers\' momentum score'}
          </span>
        </div>
      )}

      {isPreview && (
        <div className="matchup-insight">
          <h4>Key Matchup Insights</h4>
          <ul>
            <li>
              Oilers averaging <strong>{oilers.recentGDPerGame?.toFixed(2) || '0.00'}</strong> goal differential per game
            </li>
            <li>
              {opponentName} averaging <strong>{opponent.recentGDPerGame?.toFixed(2) || '0.00'}</strong> goal differential per game
            </li>
            <li>
              Oilers recent win rate: <strong>{(oilers.recentWinPct * 100).toFixed(0)}%</strong>
            </li>
            <li>
              {opponentName} recent win rate: <strong>{(opponent.recentWinPct * 100).toFixed(0)}%</strong>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
