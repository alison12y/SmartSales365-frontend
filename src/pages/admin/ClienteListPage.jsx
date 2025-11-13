import React, { useState, useEffect } from "react";
// 1. Importamos las funciones del nuevo archivo API
import {
  getClientes,
  getAllClientes, // Para los reportes
  updateCliente,
  deleteCliente,
} from "../../api/clientes"; // <-- USANDO EL NUEVO ARCHIVO
// 2. Importamos el hook de debounce
import { useDebounce } from "../../hooks/useDebounce";

import "../../styles/AdminLayout.css"; // Usamos el CSS unificado
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  FaEdit, FaTrash, FaEye,
  FaFilePdf, FaFileExcel, FaPrint
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const CLIENTES_POR_PAGINA = 10; // Puedes ajustar esto

function ClienteListPage() {
  // --- Estados de Datos ---
  const [clientes, setClientes] = useState([]); // Almacena solo los clientes de la PÁGINA ACTUAL
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados de Paginación y Búsqueda (SERVER-SIDE) ---
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalClientes, setTotalClientes] = useState(0); // Total de clientes en la BD
  const [busqueda, setBusqueda] = useState("");
  const debouncedBusqueda = useDebounce(busqueda, 300); // Búsqueda "retrasada"

  // --- Estados de UI (Modales) ---
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarDetalles, setMostrarDetalles] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    user: "",
    username: "",
    email: "",
    nombre_completo: "",
    ci_nit: "",
    telefono: "",
    direccion: "",
    ciudad: "",
  });

  // === 1. Cargar Clientes (PAGINADO y con BÚSQUEDA) ===
  const loadClientes = async () => {
    try {
      setLoading(true);
      // Pide al backend solo la página y la búsqueda que necesitamos
      const params = {
        page: paginaActual,
        page_size: CLIENTES_POR_PAGINA,
        search: debouncedBusqueda || "", // Envía la búsqueda al backend
      };

      const res = await getClientes(params);

      setClientes(res.data.results); // Guardamos solo los resultados de esta página
      setTotalClientes(res.data.count); // Guardamos el conteo total
      setError(null);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
      setError("Error al cargar clientes. ¿Estás logueado como Admin?");
    } finally {
      setLoading(false);
    }
  };

  // === 2. useEffect para recargar datos ===
  // Se ejecuta al montar, o cuando la página actual o la búsqueda cambian
  useEffect(() => {
    loadClientes();
  }, [paginaActual, debouncedBusqueda]); // Dependencias

  // === 3. HANDLERS (CRUD) ===
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Esta función AHORA SOLO EDITA. No crea.
  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!clienteSeleccionado) return;

    try {
      // Preparamos solo los datos que el serializer de Cliente espera
      const dataParaActualizar = {
        user: formData.user, // El ID del usuario (lo necesita el serializer)
        ci_nit: formData.ci_nit,
        telefono: formData.telefono,
        direccion: formData.direccion,
        ciudad: formData.ciudad,
      };

      await updateCliente(clienteSeleccionado.id, dataParaActualizar);
      setMostrarModal(false);
      setClienteSeleccionado(null);
      loadClientes(); // Recargamos la data
      setError(null);
    } catch (error) {
      console.error("Error al guardar cliente:", error.response?.data);
      setError("Error al guardar. Revisa los campos.");
    }
  };

  const handleEditar = (cliente) => {
    setClienteSeleccionado(cliente);
    // Llenamos el formulario con los datos del cliente
    setFormData({
      user: cliente.user,
      username: cliente.username,
      email: cliente.email,
      nombre_completo: cliente.nombre_completo,
      ci_nit: cliente.ci_nit || "",
      telefono: cliente.telefono || "",
      direccion: cliente.direccion || "",
      ciudad: cliente.ciudad || "",
    });
    setMostrarModal(true);
  };

  const handleEliminar = (cliente) => {
    setClienteSeleccionado(cliente);
    setMostrarConfirmacion(true);
  };

  const confirmarEliminar = async () => {
    if (!clienteSeleccionado) return;
    try {
      await deleteCliente(clienteSeleccionado.id);
      setMostrarConfirmacion(false);
      setClienteSeleccionado(null);
      loadClientes(); // Recargamos la data
    } catch (err) {
      console.error("Error al eliminar:", err);
      setError("Error al eliminar cliente.");
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  // === 4. PAGINACIÓN (Basada en Server-Side) ===
  const totalPaginas = Math.ceil(totalClientes / CLIENTES_POR_PAGINA);
  const cambiarPagina = (num) => setPaginaActual(num);

  // === 5. EXPORTACIONES (Modificadas para cargar TODOS) ===
  const handleExport = async (format) => {
    alert("Generando reporte completo, esto puede tardar...");
    let allClientes = [];
    try {
      // Obtenemos TODOS los clientes (sin paginación)
      const res = await getAllClientes();
      allClientes = res.data.results || res.data;
    } catch (err) {
      alert("Error al cargar todos los clientes para exportar.");
      return;
    }

    if (allClientes.length === 0) {
      alert("No hay clientes para exportar.");
      return;
    }

    const exportData = allClientes.map(c => ({
      ID: c.id,
      Usuario: c.username || c.user,
      "CI/NIT": c.ci_nit || "",
      Telefono: c.telefono || "",
      Direccion: c.direccion || "",
      Ciudad: c.ciudad || "",
      "Fecha Registro": formatearFecha(c.fecha_registro)
    }));

    if (format === 'pdf') {
      const doc = new jsPDF({ orientation: "landscape" });
      doc.text("Reporte de Clientes - SmartSales365", 14, 20);
      autoTable(doc, {
        head: [Object.keys(exportData[0])],
        body: exportData.map(Object.values),
        startY: 25,
      });
      doc.save("reporte_clientes.pdf");
    }
    else if (format === 'excel') {
      const hoja = XLSX.utils.json_to_sheet(exportData);
      const libro = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libro, hoja, "Clientes");
      const excel = XLSX.write(libro, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([excel]), "reporte_clientes.xlsx");
    }
  };

  // === 6. UI (Render) ===
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Gestión de Clientes</h2>

        {/* ¡EL BOTÓN "NUEVO CLIENTE" SE FUE! 
          La creación se hace desde "Gestión de Usuarios".
        */}

        <div className="d-flex gap-2">
          <button className="btn btn-success btn-sm" onClick={() => handleExport('excel')}>
            <FaFileExcel /> Excel
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => handleExport('pdf')}>
            <FaFilePdf /> PDF
          </button>
        </div>
      </div>

      {/* Barra de búsqueda (Ahora funciona con el backend) */}
      <input
        type="text"
        placeholder="Buscar por Username, Email, CI, Teléfono o Ciudad..."
        className="form-control mb-3"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {error && !mostrarModal && <p className="text-danger">{error}</p>}

      {/* === TABLA === */}
      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Nombre Completo</th>
              <th>CI/NIT</th>
              <th>Teléfono</th>
              <th>Ciudad</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center">Cargando...</td></tr>
            ) : clientes.length > 0 ? (
              clientes.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.username}</td>
                  <td>{c.nombre_completo}</td>
                  <td>{c.ci_nit}</td>
                  <td>{c.telefono}</td>
                  <td>{c.ciudad}</td>
                  <td>{formatearFecha(c.fecha_registro)}</td>
                  <td className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-info" title="Ver Detalles" onClick={() => setMostrarDetalles(c)}>
                      <FaEye />
                    </button>
                    <button className="btn btn-sm btn-outline-primary" title="Editar Perfil (Rellenar Datos)" onClick={() => handleEditar(c)}>
                      <FaEdit />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" title="Eliminar Cliente" onClick={() => handleEliminar(c)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  No se encontraron clientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* === PAGINACIÓN (Basada en Server-Side) === */}
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

      {/* === MODAL FORMULARIO (SOLO EDITAR) === */}
      {mostrarModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal" style={{ width: '500px' }}>
            <h3>Editar Perfil de Cliente</h3>
            {error && <p className="text-danger small">{error}</p>}
            <form onSubmit={handleGuardar}>
              {/* Mostramos datos del User (solo lectura) */}
              <div className="mb-2 text-start">
                <label className="form-label">Username</label>
                <input type="text" className="form-control" value={formData.username} readOnly disabled />
              </div>
              <div className="mb-2 text-start">
                <label className="form-label">Nombre Completo</label>
                <input type="text" className="form-control" value={formData.nombre_completo} readOnly disabled />
              </div>

              {/* Campos editables (del modelo Cliente) */}
              <div className="mb-2 text-start">
                <label htmlFor="ci_nit" className="form-label">CI o NIT</label>
                <input type="text" className="form-control" id="ci_nit" name="ci_nit" value={formData.ci_nit} onChange={handleChange} />
              </div>
              <div className="mb-2 text-start">
                <label htmlFor="telefono" className="form-label">Teléfono</label>
                <input type="text" className="form-control" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} />
              </div>
              <div className="mb-2 text-start">
                <label htmlFor="direccion" className="form-label">Dirección</label>
                <input type="text" className="form-control" id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} />
              </div>
              <div className="mb-2 text-start">
                <label htmlFor="ciudad" className="form-label">Ciudad</label>
                <input type="text" className="form-control" id="ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange} />
              </div>

              <div className="logout-actions mt-4">
                <button type="button" onClick={() => setMostrarModal(false)} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-accept">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL DETALLES (Tu código, está perfecto) === */}
      {mostrarDetalles && (
        <div className="logout-modal-overlay">
          <div className="logout-modal detalles" style={{ textAlign: 'left', color: '#fff' }}>
            <h3>Detalles del Cliente</h3>
            <p><b>ID:</b> {mostrarDetalles.id}</p>
            <p><b>Username:</b> {mostrarDetalles.username}</p>
            <p><b>Nombre:</b> {mostrarDetalles.nombre_completo}</p>
            <p><b>CI/NIT:</b> {mostrarDetalles.ci_nit}</p>
            <p><b>Teléfono:</b> {mostrarDetalles.telefono}</p>
            <p><b>Dirección:</b> {mostrarDetalles.direccion}</p>
            <p><b>Ciudad:</b> {mostrarDetalles.ciudad}</p>
            <p><b>Fecha Registro:</b> {formatearFecha(mostrarDetalles.fecha_registro)}</p>
            <div className="logout-actions" style={{ justifyContent: 'flex-end' }}>
              <button className="btn-cancel" onClick={() => setMostrarDetalles(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL CONFIRMACIÓN (Tu código, está perfecto) === */}
      {mostrarConfirmacion && (
        <div className="logout-modal-overlay">
          <div className="logout-modal eliminar-modal">
            <h3>¿Seguro que deseas eliminar este cliente?</h3>
            <p style={{ marginTop: "10px", color: "#94a3b8" }}>
              {clienteSeleccionado?.username} — {clienteSeleccionado?.ci_nit}
            </p>
            <div className="logout-actions">
              <button className="btn-cancel" onClick={() => setMostrarConfirmacion(false)}>
                Cancelar
              </button>
              <button className="btn-accept" onClick={confirmarEliminar} style={{ backgroundColor: '#e74c3c' }}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClienteListPage;