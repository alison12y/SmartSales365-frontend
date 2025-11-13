import React, { useState, useEffect } from "react";
import { getBitacoras } from "../../api/adminService";
import { useDebounce } from "../../hooks/useDebounce";
import { Link } from "react-router-dom"; // Para el botón de detalles
import { Eye } from "lucide-react";
import "../../styles/AdminLayout.css";
import "bootstrap/dist/css/bootstrap.min.css";

const ITEMS_POR_PAGINA = 15;

function BitacoraListPage() {
  const [bitacoras, setBitacoras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const debouncedBusqueda = useDebounce(busqueda, 300);

  const loadBitacoras = async () => {
    try {
      setLoading(true);
      const params = {
        page: paginaActual,
        page_size: ITEMS_POR_PAGINA,
        search: debouncedBusqueda || "",
      };
      
      const res = await getBitacoras(params);
      
      setBitacoras(res.data.results);
      setTotalItems(res.data.count);
      setError(null);
    } catch (err) {
      console.error("Error al cargar bitácoras:", err);
      setError("Error al cargar bitácoras. ¿Estás logueado como Admin?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBitacoras();
  }, [paginaActual, debouncedBusqueda]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const totalPaginas = Math.ceil(totalItems / ITEMS_POR_PAGINA);
  const cambiarPagina = (num) => setPaginaActual(num);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Bitácora del Sistema (Sesiones)</h2>
      </div>

      <input
        type="text"
        placeholder="Buscar por IP, Username, User Agent..."
        className="form-control mb-3"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      
      {error && <p className="text-danger">{error}</p>}

      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>IP</th>
              <th>Dispositivo</th>
              <th>Login</th>
              <th>Logout</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center">Cargando...</td></tr>
            ) : bitacoras.length > 0 ? (
              bitacoras.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.user_details?.username || 'N/A'}</td>
                  <td>{b.ip}</td>
                  <td>{b.dispositivo}</td>
                  <td>{formatearFecha(b.login_at)}</td>
                  <td>{formatearFecha(b.logout_at)}</td>
                  <td>
                    <>
                      <Link
                        to={`/dashboard/security/audit/${b.id}`}
                        state={{ bitacora: b }}
                        className="btn btn-sm btn-outline-info d-inline d-sm-none"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/dashboard/security/audit/${b.id}`}
                        state={{ bitacora: b }}
                        className="btn btn-sm btn-outline-info d-none d-sm-inline-flex"
                      >
                        <Eye size={16} className="me-1" /> Ver detalles
                      </Link>
                    </>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No se encontraron registros de bitácora.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPaginas > 1 && (
          <div className="paginacion d-flex justify-content-center gap-2 mt-3">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                className={`btn btn-sm ${paginaActual === num ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => cambiarPagina(num)}
              >
                {num}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BitacoraListPage;