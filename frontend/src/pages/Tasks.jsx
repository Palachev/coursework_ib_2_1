import { useEffect, useState } from 'react';

import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const emptyTask = { title: '', description: '', status: 'todo' };
const statusLabels = {
  todo: 'К выполнению',
  in_progress: 'В процессе',
  done: 'Готово',
};

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyTask);
  const [editForm, setEditForm] = useState(emptyTask);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const headers = { 'X-User-Id': user?.id };

  const loadTasks = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data } = await api.get('/tasks', { headers });
      setTasks(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Не удалось загрузить задачи');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user?.id]);

  const createTask = async (event) => {
    event.preventDefault();
    setError('');

    const tempId = `tmp-${Date.now()}`;
    const optimisticTask = {
      ...form,
      id: tempId,
      owner_user_id: user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTasks((prev) => [optimisticTask, ...prev]);
    setForm(emptyTask);

    try {
      const { data } = await api.post('/tasks', form, { headers });
      setTasks((prev) => prev.map((task) => (task.id === tempId ? data : task)));
    } catch (err) {
      setTasks((prev) => prev.filter((task) => task.id !== tempId));
      setError(err.response?.data?.detail || 'Не удалось создать задачу');
    }
  };

  const startEdit = async (taskId) => {
    setError('');
    try {
      const { data } = await api.get(`/tasks/${taskId}`, { headers });
      setEditForm({
        title: data.title,
        description: data.description || '',
        status: data.status,
      });
      setEditingTaskId(taskId);
    } catch (err) {
      setError(err.response?.data?.detail || 'Не удалось загрузить задачу');
    }
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditForm(emptyTask);
  };

  const saveEdit = async (taskId) => {
    setError('');
    const previousTask = tasks.find((task) => task.id === taskId);
    if (!previousTask) return;

    const optimistic = { ...previousTask, ...editForm, updated_at: new Date().toISOString() };
    setTasks((prev) => prev.map((task) => (task.id === taskId ? optimistic : task)));
    setEditingTaskId(null);

    try {
      const { data } = await api.put(`/tasks/${taskId}`, editForm, { headers });
      setTasks((prev) => prev.map((task) => (task.id === taskId ? data : task)));
    } catch (err) {
      setTasks((prev) => prev.map((task) => (task.id === taskId ? previousTask : task)));
      setError(err.response?.data?.detail || 'Не удалось обновить задачу');
    }
  };

  const removeTask = async (taskId) => {
    const previousTasks = tasks;
    setTasks((prev) => prev.filter((task) => task.id !== taskId));

    try {
      await api.delete(`/tasks/${taskId}`, { headers });
    } catch (err) {
      setTasks(previousTasks);
      setError(err.response?.data?.detail || 'Не удалось удалить задачу');
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Задачи</h1>
      <form className="card" onSubmit={createTask}>
        <input
          placeholder="Название"
          value={form.title}
          onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          required
        />
        <textarea
          placeholder="Описание"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        />
        <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
          <option value="todo">К выполнению</option>
          <option value="in_progress">В процессе</option>
          <option value="done">Готово</option>
        </select>
        <button type="submit">Создать задачу</button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading && <p>Загрузка задач...</p>}

      <div className="list">
        {tasks.length === 0 && !loading && <div className="empty">Пока нет задач. Создайте первую задачу выше.</div>}
        {tasks.map((task) => (
          <div className="card" key={task.id}>
            {editingTaskId === task.id ? (
              <>
                <input
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Название"
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Описание"
                />
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="todo">К выполнению</option>
                  <option value="in_progress">В процессе</option>
                  <option value="done">Готово</option>
                </select>
                <div className="row">
                  <button type="button" onClick={() => saveEdit(task.id)}>Сохранить</button>
                  <button type="button" onClick={cancelEdit}>Отмена</button>
                </div>
              </>
            ) : (
              <>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p>Статус: <strong>{statusLabels[task.status] || task.status}</strong></p>
                <div className="row">
                  <button type="button" onClick={() => startEdit(task.id)}>Редактировать</button>
                  <button type="button" className="danger" onClick={() => removeTask(task.id)}>Удалить</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
