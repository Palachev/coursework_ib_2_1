import { useEffect, useState } from 'react';

import api from '../api/axios';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setNotifications(sorted);
    } catch (err) {
      setError(err.response?.data?.detail || 'Не удалось загрузить уведомления');
    }
  };

  useEffect(() => {
    loadNotifications();
    const intervalId = setInterval(loadNotifications, 10_000);
    return () => clearInterval(intervalId);
  }, []);

  const createNotification = async (event) => {
    event.preventDefault();
    try {
      await api.post('/notifications', { message });
      setMessage('');
      await loadNotifications();
    } catch (err) {
      setError(err.response?.data?.detail || 'Не удалось создать уведомление');
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Уведомления</h1>
      <form className="card" onSubmit={createNotification}>
        <input
          placeholder="Текст уведомления"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit">Создать</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="list">
        {notifications.length === 0 && <div className="empty">Уведомлений пока нет.</div>}
        {notifications.map((notification) => (
          <div className="card" key={notification.id}>
            <p>{notification.message}</p>
            <small>{new Date(notification.created_at).toLocaleString('ru-RU')}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
