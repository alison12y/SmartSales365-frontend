const API_BASE = '/api/marketing/notificaciones/';

function getAuthHeaders() {
  const token = localStorage.getItem('access');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchNotifications() {
  const res = await fetch(API_BASE, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error fetching notifications: ${res.status} ${text}`);
  }
  const json = await res.json();
  // If API is paginated (DRF) it may return { results: [...] }
  return Array.isArray(json) ? json : json.results || [];
}

export async function fetchRecentNotifications(limit = 5) {
  const url = `${API_BASE}?limit=${limit}`; // backend may ignore 'limit' but we try
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error fetching recent notifications: ${res.status} ${text}`);
  }
  const json = await res.json();
  return Array.isArray(json) ? json : json.results || [];
}

export async function markAsRead(id) {
  const url = `${API_BASE}${id}/marcar-leida/`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error marking as read: ${text}`);
  }
  return res.json();
}

export async function createNotification(payload) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error creating notification: ${text}`);
  }
  return res.json();
}

export async function updateNotification(id, payload) {
  const url = `${API_BASE}${id}/`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error updating notification: ${text}`);
  }
  return res.json();
}

export async function deleteNotification(id) {
  const url = `${API_BASE}${id}/`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error deleting notification: ${text}`);
  }
  return true;
}

export async function broadcastNotification(payload) {
  const url = `${API_BASE}broadcast/`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error broadcasting: ${text}`);
  }
  return res.json();
}
