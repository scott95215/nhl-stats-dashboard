import { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Flame, Shield, TrendingUp } from 'lucide-react';
import './Methodology.css';

export default function Methodology() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="methodology-section">
      <button
        className="methodology-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <Info size={18} />
        <span>How We Calculate "Hotness"</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="methodology-content">
          <div className="method-card">
            <div className="method-header">
              <Flame size={20} />
              <h3>Player Hotness</h3>
            </div>
            <p>Players are ranked by <strong>Points Per Game (PPG)</strong> over the selected period.</p>
            <ul>
              <li>We analyze the top 30 point leaders in the league</li>
              <li>For each player, we calculate their PPG over the last N games</li>
              <li>Higher PPG = "Hotter" player</li>
            </ul>
            <div className="formula">
              PPG = Total Points / Games Played
            </div>
          </div>

          <div className="method-card">
            <div className="method-header">
              <Shield size={20} />
              <h3>Goalie Hotness</h3>
            </div>
            <p>Goalie hotness uses a weighted formula combining three key metrics:</p>
            <ul>
              <li><strong>50%</strong> - Save Percentage (SV%)</li>
              <li><strong>30%</strong> - Goals Against Average (GAA, inverted so lower is better)</li>
              <li><strong>20%</strong> - Win Percentage</li>
            </ul>
            <div className="formula">
              Hotness = (SV% x 0.5) + ((1 - GAA/5) x 0.3) + (Win% x 0.2)
            </div>
          </div>

          <div className="method-card">
            <div className="method-header">
              <TrendingUp size={20} />
              <h3>Team Hotness</h3>
            </div>
            <p>Team hotness combines recent win percentage with goal differential:</p>
            <ul>
              <li><strong>60%</strong> - Recent Win Percentage</li>
              <li><strong>40%</strong> - Recent Goal Differential per Game (normalized to 0-1 scale)</li>
            </ul>
            <div className="formula">
              Hotness = (Win% x 0.6) + (Normalized GD x 0.4)
            </div>
            <p className="method-note">Goal differential is normalized assuming a typical range of -3 to +3 per game.</p>
          </div>

          <div className="methodology-note">
            <strong>Note:</strong> All calculations are based on the selected "Last N games" period.
            Data refreshes every 5 minutes from the official NHL API. Today's games refresh every 60 seconds.
            Times are displayed in Edmonton (MST/MDT) timezone.
          </div>
        </div>
      )}
    </div>
  );
}
