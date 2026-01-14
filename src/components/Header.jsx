import { RefreshCw } from 'lucide-react';
import './Header.css';

// Oilers logo SVG component
function OilersLogo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="oilers-logo"
    >
      {/* Oil drop shape */}
      <path
        d="M50 5C50 5 20 45 20 65C20 81.5685 33.4315 95 50 95C66.5685 95 80 81.5685 80 65C80 45 50 5 50 5Z"
        fill="#CF4520"
        stroke="#ffffff"
        strokeWidth="3"
      />
      {/* Inner circle */}
      <circle cx="50" cy="62" r="22" fill="#00205B" stroke="#ffffff" strokeWidth="2" />
      {/* Letter O */}
      <text
        x="50"
        y="70"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="24"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        O
      </text>
    </svg>
  );
}

export default function Header({ onRefresh, isRefreshing }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-branding">
          <OilersLogo size={44} />
          <div className="header-title">
            <h1>Edmonton Oilers</h1>
            <span className="header-subtitle">Stats & Momentum Tracker</span>
          </div>
        </div>
        <button
          className={`refresh-button ${isRefreshing ? 'spinning' : ''}`}
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh data"
        >
          <RefreshCw size={20} />
        </button>
      </div>
    </header>
  );
}
