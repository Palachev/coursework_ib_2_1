import { useEffect, useState } from 'react';

import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page">
      <h1 className="page-title">Панель управления</h1>
      <div className="card">
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Имя:</strong> {user?.full_name}</p>
        <p><strong>ID пользователя:</strong> {user?.id}</p>
        <p className="muted">Используйте меню сверху, чтобы управлять задачами и уведомлениями.</p>
      </div>
      <HealthWidget />
    </div>
  );
}

function HealthWidget() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const { data } = await api.get('/health');
        if (active) setHealth(data);
      } catch {
        if (active) setHealth({ status: 'недоступно' });
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="card">
      <h3>Состояние API Gateway</h3>
      <pre>{JSON.stringify(health, null, 2)}</pre>
    </div>
  );
}
