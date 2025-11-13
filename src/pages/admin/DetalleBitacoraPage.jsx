import React, { useState, useEffect } from "react";
import { getBitacoraDetalles, getBitacoraById } from "../../api/adminService";
import { useParams, Link, useLocation } from "react-router-dom"; // Para leer el ID de la URL
import { ArrowLeft } from "lucide-react";
import "../../styles/AdminLayout.css";
import "bootstrap/dist/css/bootstrap.min.css";

// Traemos todas las acciones de la sesión pidiendo un page_size grande
const ITEMS_POR_PAGINA = 10000;

function DetalleBitacoraPage() {
  const { id } = useParams(); // Lee el ':id' de la URL
  const location = useLocation();
  const [bitacora, setBitacora] = useState(location.state?.bitacora || null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadDetalles = async () => {
    try {
      setLoading(true);
      // Pide al backend los detalles FILTRADOS por el ID de la bitácora
      const params = {
        bitacora: id,
        page: 1,
        page_size: ITEMS_POR_PAGINA,
      };
      
      const res = await getBitacoraDetalles(params);
      const items = res.data.results || [];
      // Ordenamos por fecha ascendente para mostrar la secuencia completa de acciones
      items.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

      setDetalles(items);
      setTotalItems(res.data.count || items.length);
      setError(null);
    } catch (err) {
      console.error("Error al cargar detalles de bitácora:", err);
      setError("Error al cargar detalles. ¿Estás logueado como Admin?");
    } finally {
      setLoading(false);
    }
  };

  const loadBitacoraInfo = async () => {
    // Si ya recibimos la bitacora por Link state, no hacemos petición.
    if (bitacora) return;
    try {
      const res = await getBitacoraById(id);
      setBitacora(res.data);
    } catch (err) {
      console.warn("No se pudo obtener info de la bitácora por id:", err);
      // No es crítico: seguiremos mostrando los detalles si existen.
    }
  };

  useEffect(() => {
    loadBitacoraInfo();
    loadDetalles();
  }, [id, paginaActual]); // Recarga si cambia el ID o la página

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    return new Date(fecha).toLocaleString();
  };

  const totalPaginas = Math.ceil(totalItems / ITEMS_POR_PAGINA);
  const cambiarPagina = (num) => setPaginaActual(num);

  // Función para dar color al Método HTTP
  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'text-success';
      case 'POST': return 'text-primary';
      case 'PUT':
      case 'PATCH': return 'text-warning';
      case 'DELETE': return 'text-danger';
      default: return 'text-light';
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2 className="d-flex align-items-center gap-2">
          <Link to="/dashboard/security/audit" className="btn btn-outline-primary btn-sm">
            <ArrowLeft size={20} />
          </Link>
          Detalles de Sesión (ID: {id}) — Acciones: {totalItems}
        </h2>
      </div>

      {error && <p className="text-danger">{error}</p>}

      {/* Card con información general de la sesión (si está disponible) */}
      {bitacora && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title">Información General</h5>
            <p><strong>Usuario:</strong> {bitacora.user_details?.username || bitacora.username || 'N/A'}</p>
            <p><strong>Acción:</strong> {bitacora.login || bitacora.action || 'Sesión'}</p>
            <p><strong>IP:</strong> {bitacora.ip || '—'}</p>
            <p><strong>Fecha (Login):</strong> {formatearFecha(bitacora.login_at || bitacora.fecha)}</p>
            <p><strong>Dispositivo:</strong> {bitacora.dispositivo || bitacora.device || '—'}</p>
            <p><strong>UserAgent:</strong> {bitacora.user_agent || bitacora.userAgent || '—'}</p>
          </div>
        </div>
      )}

      <h5 className="mb-3">📑 Acciones registradas</h5>

      <div className="table-responsive stack-xs table-xs-compact stack-tight">
        <table className="table table-striped table-hover align-middle">
          <thead className="thead-light">
            <tr>
              <th>Fecha</th>
              <th>Tabla</th>
              <th>Acción</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center">Cargando...</td></tr>
            ) : detalles.length > 0 ? (
              detalles.map((d) => (
                <tr key={d.id}>
                  <td className="td-nowrap">{formatearFecha(d.fecha)}</td>
                  <td>{d.tabla || d.path || 'N/A'}</td>
                  <td>{d.accion}</td>
                  <td className="td-wrap" style={{maxWidth: 600, overflowWrap: 'break-word'}}>{d.detalle || '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">No hay detalles asociados a este registro.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Link to="/dashboard/security/audit" className="btn btn-secondary">← Volver a la Bitácora</Link>
      </div>
    </div>
  );
}

export default DetalleBitacoraPage;