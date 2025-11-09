import React, { useState, useEffect } from "react";
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
} from "../../api/clientes";
import "../../styles/ClienteListPage.css";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaFilePdf,
  FaFileExcel,
  FaPrint,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function ClienteListPage() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarDetalles, setMostrarDetalles] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);

  const [formData, setFormData] = useState({
    user: "",
    ci_nit: "",
    telefono: "",
    direccion: "",
    ciudad: "",
  });

  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const clientesPorPagina = 5;

  // === Cargar clientes ===
  const loadClientes = async () => {
    try {
      const res = await getClientes();
      setClientes(res.data.results || res.data);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

  // === HANDLERS ===
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateCliente(editingId, formData);
      } else {
        await createCliente(formData);
      }
      setMostrarModal(false);
      setEditing(false);
      resetForm();
      loadClientes();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      user: "",
      ci_nit: "",
      telefono: "",
      direccion: "",
      ciudad: "",
    });
  };

  const handleNuevo = () => {
    setEditing(false);
    resetForm();
    setMostrarModal(true);
  };

  const handleEditar = (c) => {
    setEditing(true);
    setEditingId(c.id);
    setFormData(c);
    setMostrarModal(true);
  };

  const handleEliminar = (cliente) => {
    setClienteAEliminar(cliente);
    setMostrarConfirmacion(true);
  };

  const confirmarEliminar = async () => {
    if (!clienteAEliminar) return;
    try {
      await deleteCliente(clienteAEliminar.id);
      setMostrarConfirmacion(false);
      setClienteAEliminar(null);
      loadClientes();
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  // === FORMATO FECHA ===
  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  // === FILTROS ===
  const clientesFiltrados = clientes.filter(
    (c) =>
      c.ci_nit?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.telefono?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.ciudad?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // === PAGINACIÓN LOCAL ===
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
  const indexInicial = (paginaActual - 1) * clientesPorPagina;
  const clientesPagina = clientesFiltrados.slice(
    indexInicial,
    indexInicial + clientesPorPagina
  );

  const cambiarPagina = (num) => setPaginaActual(num);

  // === EXPORTACIONES ===
  const exportarPDF = () => {
    if (!clientes || clientes.length === 0) {
      alert("No hay clientes para exportar.");
      return;
    }
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text("Reporte de Clientes - SmartSales365", 40, 40);
    const datos = clientes.map((c) => [
      c.id,
      c.user || "",
      c.ci_nit || "",
      c.telefono || "",
      c.direccion || "",
      c.ciudad || "",
      formatearFecha(c.fecha_registro),
    ]);
    autoTable(doc, {
      head: [["ID", "Usuario", "CI/NIT", "Teléfono", "Dirección", "Ciudad", "Fecha Registro"]],
      body: datos,
      startY: 60,
    });
    doc.save("reporte_clientes.pdf");
  };

  const exportarExcel = () => {
    const hoja = XLSX.utils.json_to_sheet(clientes);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Clientes");
    const excel = XLSX.write(libro, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excel], { type: "application/octet-stream" }), "clientes.xlsx");
  };

  const exportarHTML = () => {
  if (!clientes || clientes.length === 0) {
    alert("No hay clientes para exportar.");
    return;
  }

  const html = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Reporte de Clientes - SmartSales365</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #0f172a;
        color: #e2e8f0;
        padding: 40px;
      }
      h1 {
        text-align: center;
        color: #38bdf8;
        margin-bottom: 30px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        border-radius: 12px;
        overflow: hidden;
        background-color: #1e293b;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
      }
      thead {
        background-color: #2563eb;
        color: white;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      th, td {
        padding: 12px 16px;
        text-align: center;
      }
      tbody tr:nth-child(odd) {
        background-color: #334155;
      }
      tbody tr:nth-child(even) {
        background-color: #1e293b;
      }
      tbody tr:hover {
        background-color: #475569;
        transition: 0.2s ease-in-out;
      }
      th {
        font-size: 0.9rem;
      }
      td {
        font-size: 0.9rem;
      }
      .footer {
        text-align: center;
        color: #94a3b8;
        margin-top: 25px;
        font-size: 0.85rem;
      }
    </style>
  </head>
  <body>
    <h1>Reporte de Clientes</h1>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Usuario</th>
          <th>CI/NIT</th>
          <th>Teléfono</th>
          <th>Dirección</th>
          <th>Ciudad</th>
          <th>Fecha Registro</th>
        </tr>
      </thead>
      <tbody>
        ${clientes.map((c) => `
          <tr>
            <td>${c.id}</td>
            <td>${c.username || c.user}</td>
            <td>${c.ci_nit || "-"}</td>
            <td>${c.telefono || "-"}</td>
            <td>${c.direccion || "-"}</td>
            <td>${c.ciudad || "-"}</td>
            <td>${formatearFecha(c.fecha_registro)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    <div class="footer">
      Generado automáticamente por <b>SmartSales365</b> — ${new Date().toLocaleString()}
    </div>
  </body>
  </html>
  `;

  const newWindow = window.open("", "_blank");
  newWindow.document.write(html);
  newWindow.document.close();
};
  // === UI ===
  return (
    <div className="clientes-page">
      <div className="clientes-header">
        <h2>Gestión de Clientes</h2>

        <div className="acciones-top">
          <input
            type="text"
            placeholder="Buscar por CI, teléfono o ciudad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button className="btn-primary" onClick={handleNuevo}>
            <FaPlus /> Nuevo Cliente
          </button>
          <button className="btn-success" onClick={exportarExcel}>
            <FaFileExcel /> Excel
          </button>
          <button className="btn-danger" onClick={exportarPDF}>
            <FaFilePdf /> PDF
          </button>
          <button className="btn-secondary" onClick={exportarHTML}>
            <FaPrint /> HTML
          </button>
        </div>
      </div>

      {/* === TABLA === */}
      <div className="tabla-card">
        <table className="table-dark">
          <thead>
            <tr>
              <th>N°</th>
              <th>ID</th>
              <th>Usuario</th>
              <th>CI/NIT</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Ciudad</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesPagina.length > 0 ? (
              clientesPagina.map((c, index) => (
                <tr key={c.id}>
                   {/* 🔹 Numeración visual (1,2,3,...) según página actual */}
                  <td>{index + 1 + (paginaActual - 1) * clientesPorPagina}</td>
                  <td>{c.id}</td>
                  <td>{c.username || c.user}</td>
                  <td>{c.ci_nit}</td>
                  <td>{c.telefono}</td>
                  <td>{c.direccion}</td>
                  <td>{c.ciudad}</td>
                  <td>{formatearFecha(c.fecha_registro)}</td>
                  <td className="acciones">
                    <button className="btn-accion btn-ver" onClick={() => setMostrarDetalles(c)}>
                      <FaEye />
                    </button>
                    <button className="btn-accion btn-editar" onClick={() => handleEditar(c)}>
                      <FaEdit />
                    </button>
                    <button className="btn-accion btn-eliminar" onClick={() => handleEliminar(c)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="sin-datos">
                  No hay clientes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* === PAGINACIÓN === */}
        {totalPaginas > 1 && (
          <div className="paginacion">
            {Array.from({ length: totalPaginas }).map((_, i) => (
              <button
                key={i}
                className={`pagina-btn ${paginaActual === i + 1 ? "activa" : ""}`}
                onClick={() => cambiarPagina(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* === MODAL FORMULARIO (CREAR/EDITAR) === */}
      {mostrarModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editing ? "Editar Cliente" : "Nuevo Cliente"}</h3>
            <form onSubmit={handleGuardar}>
              <input
                type="text"
                name="user"
                placeholder="Usuario (ID o nombre)"
                value={formData.user}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="ci_nit"
                placeholder="CI o NIT"
                value={formData.ci_nit}
                onChange={handleChange}
              />
              <input
                type="text"
                name="telefono"
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={handleChange}
              />
              <input
                type="text"
                name="direccion"
                placeholder="Dirección"
                value={formData.direccion}
                onChange={handleChange}
              />
              <input
                type="text"
                name="ciudad"
                placeholder="Ciudad"
                value={formData.ciudad}
                onChange={handleChange}
              />
              <div className="modal-actions">
                <button
                  className="btn-cancelar"
                  type="button"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editing ? "Guardar Cambios" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL DETALLES === */}
      {mostrarDetalles && (
        <div className="modal">
          <div className="modal-content detalles">
            <h3>Detalles del Cliente</h3>
            <p><b>ID:</b> {mostrarDetalles.id}</p>
            <p><b>Usuario:</b> {mostrarDetalles.username}</p>
            <p><b>CI/NIT:</b> {mostrarDetalles.ci_nit}</p>
            <p><b>Teléfono:</b> {mostrarDetalles.telefono}</p>
            <p><b>Dirección:</b> {mostrarDetalles.direccion}</p>
            <p><b>Ciudad:</b> {mostrarDetalles.ciudad}</p>
            <p><b>Fecha Registro:</b> {formatearFecha(mostrarDetalles.fecha_registro)}</p>
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setMostrarDetalles(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL CONFIRMACIÓN === */}
      {mostrarConfirmacion && (
        <div className="modal">
          <div className="modal-content eliminar-modal">
            <h3>¿Seguro que deseas eliminar este cliente?</h3>
            <p style={{ marginTop: "10px", color: "#94a3b8" }}>
              {clienteAEliminar?.user} — {clienteAEliminar?.ci_nit}
            </p>
            <div className="modal-actions">
              <button
                className="btn-cancelar"
                onClick={() => setMostrarConfirmacion(false)}
              >
                Cancelar
              </button>
              <button className="btn-aceptar" onClick={confirmarEliminar}>
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