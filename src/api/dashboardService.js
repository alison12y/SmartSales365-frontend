const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('access');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Obtiene estadísticas de ventas: total, por fecha (últimos 30 días)
 */
export async function getSalesStats() {
  const res = await fetch(`${API_BASE}/sales/ventas/`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error fetching sales stats: ${res.status} ${text}`);
  }
  const json = await res.json();
  const ventas = Array.isArray(json) ? json : json.results || [];

  // Agrupar por fecha (últimos 30 días)
  const hoy = new Date();
  const hace30 = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);

  const ventasPorFecha = {};
  ventas.forEach((v) => {
    const fecha = new Date(v.fecha_venta);
    if (fecha >= hace30 && fecha <= hoy) {
      const fechaStr = fecha.toLocaleDateString('es-BO', { month: 'short', day: 'numeric' });
      ventasPorFecha[fechaStr] = (ventasPorFecha[fechaStr] || 0) + parseFloat(v.total);
    }
  });

  // Transformar a array para gráfico
  const ventasMensuales = Object.entries(ventasPorFecha).map(([mes, ventas]) => ({
    mes,
    ventas: Math.round(ventas),
  }));

  const totalVentas = ventas.reduce((sum, v) => sum + parseFloat(v.total), 0);

  return { ventasMensuales, totalVentas };
}

/**
 * Obtiene estadísticas de clientes
 */
export async function getClientsStats() {
  try {
    const res = await fetch(`${API_BASE}/customers/clientes/`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error(`Error fetching clients: ${res.status}`);
    const json = await res.json();
    const clientes = Array.isArray(json) ? json : json.results || [];
    return {
      total: clientes.length,
      detalle: clientes.slice(0, 6).map((c) => ({
        nombre: c.nombre_cliente || c.user?.full_name || 'Sin nombre',
        compras: c.numero_compras || 0,
      })),
    };
  } catch (err) {
    console.warn('Error fetching clients stats:', err);
    return { total: 0, detalle: [] };
  }
}

/**
 * Obtiene distribución de productos (top 4 vendidos)
 */
export async function getProductsDistribution() {
  try {
    const res = await fetch(`${API_BASE}/catalog/productos/`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error(`Error fetching products: ${res.status}`);
    const json = await res.json();
    const productos = Array.isArray(json) ? json : json.results || [];

    // Ordenar por stock/venta (o simplemente top 4)
    const top4 = productos.slice(0, 4).map((p) => ({
      name: p.nombre,
      value: p.stock || 10, // usar stock como valor para gráfico o número de compras
    }));

    // Agrupar resto como "Otros"
    const otros = productos.slice(4).length;
    if (otros > 0) {
      top4.push({ name: 'Otros', value: otros });
    }

    return {
      total: productos.length,
      distribucion: top4,
    };
  } catch (err) {
    console.warn('Error fetching products distribution:', err);
    return { total: 0, distribucion: [] };
  }
}

/**
 * Obtiene ingresos totales (suma de ventas completadas)
 */
export async function getTotalIncome() {
  try {
    const res = await fetch(`${API_BASE}/sales/ventas/?estado_venta=completada`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error(`Error fetching income: ${res.status}`);
    const json = await res.json();
    const ventas = Array.isArray(json) ? json : json.results || [];
    return ventas.reduce((sum, v) => sum + parseFloat(v.total), 0);
  } catch (err) {
    console.warn('Error fetching income:', err);
    return 0;
  }
}

/**
 * Obtiene últimas actividades (ventas, clientes, productos recientes)
 */
export async function getRecentActivity() {
  try {
    const [ventasRes, clientesRes] = await Promise.all([
      fetch(`${API_BASE}/sales/ventas/?page_size=3`, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      }),
      fetch(`${API_BASE}/customers/clientes/?page_size=3`, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      }),
    ]);

    const ventasData = await ventasRes.json();
    const clientesData = await clientesRes.json();

    const ventas = Array.isArray(ventasData) ? ventasData : ventasData.results || [];
    const clientes = Array.isArray(clientesData) ? clientesData : clientesData.results || [];

    const actividad = [];
    ventas.forEach((v) => {
      actividad.push(`Nueva venta registrada (ID #${v.id})`);
    });
    clientes.forEach((c) => {
      actividad.push(`Cliente "${c.nombre_cliente || c.user?.full_name || 'Sin nombre'}" añadido`);
    });

    return actividad.slice(0, 9);
  } catch (err) {
    console.warn('Error fetching activity:', err);
    return [];
  }
}
