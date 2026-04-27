import { Link, NavLink } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const displayName = user?.full_name || user?.email || 'Пользователь';
  const navClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="brand">Менеджер задач</Link>
        <div className="links">
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className={navClass}>Вход</NavLink>
              <NavLink to="/register" className={navClass}>Регистрация</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" className={navClass}>Панель</NavLink>
              <NavLink to="/tasks" className={navClass}>Задачи</NavLink>
              <NavLink to="/notifications" className={navClass}>Уведомления</NavLink>
              <span className="muted">Привет, {displayName}</span>
              <button type="button" className="secondary" onClick={logout}>Выйти</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
