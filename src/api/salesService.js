const API_BASE = '/api/sales/ventas/';

function getAuthHeaders() {
  const token = localStorage.getItem('access');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Crea una venta / factura en el backend.
 * Payload esperado: { items: [{product: id, quantity, precio}], customer: id?, ... }
 * Ajusta la ruta si tu backend expone otra.
 */
export async function createInvoice(payload) {
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
    throw new Error(`Error creando factura: ${res.status} ${text}`);
  }
  return res.json();
}
