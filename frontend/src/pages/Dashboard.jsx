import { useEffect, useState } from 'react';

import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <div className="card">
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Full name:</strong> {user?.full_name}</p>
        <p><strong>User ID:</strong> {user?.id}</p>
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
        if (active) setHealth({ status: 'unavailable' });
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="card">
      <h3>Gateway health</h3>
      <pre>{JSON.stringify(health, null, 2)}</pre>
    </div>
  );
}
