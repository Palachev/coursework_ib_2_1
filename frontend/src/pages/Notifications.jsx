import { useEffect, useState } from 'react';

import api from '../api/axios';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load notifications');
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const createNotification = async (event) => {
    event.preventDefault();
    try {
      await api.post('/notifications', { message });
      setMessage('');
      await loadNotifications();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create notification');
    }
  };

  return (
    <div className="page">
      <h1>Notifications</h1>
      <form className="card" onSubmit={createNotification}>
        <input
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit">Create</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="list">
        {notifications.map((notification) => (
          <div className="card" key={notification.id}>
            <p>{notification.message}</p>
            <small>{notification.created_at}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
