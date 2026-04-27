import { Link, NavLink } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const displayName = user?.full_name || user?.email || 'User';
  const navClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="brand">Task Manager</Link>
        <div className="links">
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className={navClass}>Login</NavLink>
              <NavLink to="/register" className={navClass}>Register</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
              <NavLink to="/tasks" className={navClass}>Tasks</NavLink>
              <NavLink to="/notifications" className={navClass}>Notifications</NavLink>
              <span className="muted">Hi, {displayName}</span>
              <button type="button" className="secondary" onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
