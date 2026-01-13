import { RefreshCw } from 'lucide-react';
import './Header.css';

export default function Header({ onRefresh, isRefreshing }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <h1>NHL Stats Dashboard</h1>
          <span className="header-subtitle">Real-time player and team analytics</span>
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
