import React, { useEffect, useState } from 'react';
import { fetchNotifications, markAsRead, createNotification, updateNotification, deleteNotification, broadcastNotification } from '../../api/notificationService';
import NotificationItem from '../../components/notifications/NotificationItem';

export default function NotificationListPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ titulo: '', mensaje: '', tipo: 'alerta' });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  async function handleMark(id) {
    try {
      const updated = await markAsRead(id);
      setNotifications(ns => ns.map(n => n.id === id ? { ...n, leido: true } : n));
    } catch (err) {
      console.error(err);
      setError('No se pudo marcar como leída');
    }
  }

  // CREATE
  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      // El backend actual expone POST sólo a través de la acción 'broadcast' (IsAdminUser).
      // Hacemos la llamada a broadcast para crear una notificación global (user=null).
      const created = await broadcastNotification(form);
      setNotifications(ns => [created, ...ns]);
      setForm({ titulo: '', mensaje: '', tipo: 'alerta' });
    } catch (err) {
      console.error(err);
      // Mostrar mensaje más informativo según la respuesta del backend
      if (err.message && err.message.includes('403')) {
        setError('No tienes permisos para crear avisos (requiere rol administrador).');
      } else {
        setError('No se pudo crear la notificación');
      }
    } finally {
      setCreating(false);
    }
  }

  // EDIT
  function startEdit(n) {
    setEditing(n);
    setForm({ titulo: n.titulo, mensaje: n.mensaje, tipo: n.tipo });
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editing) return;
    try {
      const updated = await updateNotification(editing.id, form);
      setNotifications(ns => ns.map(n => n.id === editing.id ? updated : n));
      setEditing(null);
      setForm({ titulo: '', mensaje: '', tipo: 'alerta' });
    } catch (err) {
      console.error(err);
      setError('No se pudo actualizar');
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta notificación?')) return;
    try {
      await deleteNotification(id);
      setNotifications(ns => ns.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar');
    }
  }

  return (
    <div className="page notification-list-page">
      <h2>Avisos</h2>
      <div className="notification-crud">
        <h3>{editing ? 'Editar aviso' : 'Crear nuevo aviso'}</h3>
        <form onSubmit={editing ? handleUpdate : handleCreate} className="notif-form">
          <input placeholder="Título" value={form.titulo} onChange={e => setForm(f => ({...f, titulo: e.target.value}))} required />
          <select value={form.tipo} onChange={e => setForm(f => ({...f, tipo: e.target.value}))}>
            <option value="alerta">Alerta</option>
            <option value="promocion">Promoción</option>
            <option value="recordatorio">Recordatorio</option>
          </select>
          <textarea placeholder="Mensaje" value={form.mensaje} onChange={e => setForm(f => ({...f, mensaje: e.target.value}))} required />
          <button type="submit">{editing ? 'Actualizar' : (creating ? 'Creando...' : 'Crear')}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm({ titulo: '', mensaje: '', tipo: 'alerta' }); }}>Cancelar</button>}
        </form>
      </div>
      {loading && <p>Cargando...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && notifications.length === 0 && <p>No hay notificaciones.</p>}
      <div className="notifications-grid">
        {notifications.map(n => (
          <NotificationItem key={n.id} notification={n} onMarkRead={handleMark} onEdit={startEdit} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
