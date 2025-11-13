import React from 'react';

export default function NotificationItem({ notification, onMarkRead, onEdit, onDelete }) {
  return (
    <div className={`notification-item ${notification.leido ? 'read' : 'unread'}`}>
      <div className="notification-header">
        <strong>{notification.titulo}</strong>
        <span className="notification-type">{notification.tipo}</span>
      </div>
      <div className="notification-body">
        <p>{notification.mensaje}</p>
        <small>{new Date(notification.fecha_envio).toLocaleString()}</small>
      </div>
      <div className="notification-actions">
        {!notification.leido && (
          <button onClick={() => onMarkRead(notification.id)}>Marcar como leída</button>
        )}
        {onEdit && <button onClick={() => onEdit(notification)}>Editar</button>}
        {onDelete && <button onClick={() => onDelete(notification.id)}>Eliminar</button>}
      </div>
    </div>
  );
}
