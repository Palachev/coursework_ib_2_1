import { useEffect, useState } from 'react';

import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const emptyTask = { title: '', description: '', status: 'todo' };

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyTask);
  const [error, setError] = useState('');

  const headers = { 'X-User-Id': user?.id };

  const loadTasks = async () => {
    if (!user?.id) return;
    try {
      const { data } = await api.get('/tasks', { headers });
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load tasks');
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user?.id]);

  const createTask = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await api.post('/tasks', form, { headers });
      setForm(emptyTask);
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create task');
    }
  };

  const updateStatus = async (task, status) => {
    try {
      await api.put(`/tasks/${task.id}`, { status }, { headers });
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update task');
    }
  };

  const removeTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`, { headers });
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete task');
    }
  };

  return (
    <div className="page">
      <h1>Tasks</h1>
      <form className="card" onSubmit={createTask}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          required
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        />
        <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
          <option value="todo">todo</option>
          <option value="in_progress">in_progress</option>
          <option value="done">done</option>
        </select>
        <button type="submit">Create task</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="list">
        {tasks.map((task) => (
          <div className="card" key={task.id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Status: <strong>{task.status}</strong></p>
            <div className="row">
              <button type="button" onClick={() => updateStatus(task, 'todo')}>todo</button>
              <button type="button" onClick={() => updateStatus(task, 'in_progress')}>in progress</button>
              <button type="button" onClick={() => updateStatus(task, 'done')}>done</button>
              <button type="button" className="danger" onClick={() => removeTask(task.id)}>delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
