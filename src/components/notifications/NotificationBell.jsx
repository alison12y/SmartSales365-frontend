import React, { useEffect, useState, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import { fetchRecentNotifications, markAsRead } from '../../api/notificationService';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await fetchRecentNotifications(5);
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  }

  async function handleMarkRead(id) {
    try {
      await markAsRead(id);
      setNotifications((prev) => prev.map(n => n.id === id ? { ...n, leido: true } : n));
    } catch (err) {
      console.error(err);
    }
  }

  const unreadCount = notifications.filter(n => !n.leido).length;

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <div className="notification-bell" ref={ref} style={{position:'relative', marginRight: '12px'}}>
      <button className="bell-btn" onClick={() => setOpen(!open)} aria-label="Notificaciones">
        <FaBell />
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="bell-dropdown">
          <div className="dropdown-header">Notificaciones</div>
          <div className="dropdown-list">
            {notifications.length === 0 && <div className="empty">No hay notificaciones</div>}
            {notifications.map(n => (
              <div key={n.id} className={`notif ${n.leido ? 'read' : 'unread'}`}>
                <div className="notif-title"><strong>{n.titulo}</strong></div>
                <div className="notif-msg">{n.mensaje}</div>
                <div className="notif-meta">
                  <small>{new Date(n.fecha_envio).toLocaleString()}</small>
                  {!n.leido && <button className="mark-btn" onClick={() => handleMarkRead(n.id)}>Marcar</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
