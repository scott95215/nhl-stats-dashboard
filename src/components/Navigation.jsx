import { NavLink } from 'react-router-dom';
import { Target, BarChart3 } from 'lucide-react';
import './Navigation.css';

export default function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-content">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          end
        >
          <Target size={18} />
          <span>Oilers Focus</span>
        </NavLink>
        <NavLink
          to="/league"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <BarChart3 size={18} />
          <span>League Stats</span>
        </NavLink>
      </div>
    </nav>
  );
}
