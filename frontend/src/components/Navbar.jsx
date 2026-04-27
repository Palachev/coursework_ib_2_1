import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const displayName = user?.full_name || user?.email || 'User';

  return (
    <nav className="navbar">
      <div className="brand">Task Manager</div>
      <div className="links">
        {!isAuthenticated ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/tasks">Tasks</Link>
            <Link to="/notifications">Notifications</Link>
            <span className="muted">Hi, {displayName}</span>
            <button type="button" onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
