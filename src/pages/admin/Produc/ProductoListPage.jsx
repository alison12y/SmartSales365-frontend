import React, { useState, useEffect } from "react";
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
} from "../../../api/productos";
import "../../../styles/ProductoListPage.css";
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

function ProductoListPage() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarDetalles, setMostrarDetalles] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    marca: "",
    modelo: "",
    precio: "",
    stock: "",
    descripcion: "",
    estado: "activo",
  });
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 5;

  // === Cargar productos ===
  const loadProductos = async () => {
    try {
      const res = await getProductos();
      setProductos(res.data.results || res.data);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  };

  useEffect(() => {
    loadProductos();
  }, []);

  // === HANDLERS ===
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateProducto(editingId, formData);
      } else {
        await createProducto(formData);
      }
      setMostrarModal(false);
      setEditing(false);
      resetForm();
      loadProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      marca: "",
      modelo: "",
      precio: "",
      stock: "",
      descripcion: "",
      estado: "activo",
    });
  };

  const handleNuevo = () => {
    setEditing(false);
    resetForm();
    setMostrarModal(true);
  };

  const handleEditar = (p) => {
    setEditing(true);
    setEditingId(p.id);
    setFormData(p);
    setMostrarModal(true);
  };

  const handleEliminar = (producto) => {
    setProductoAEliminar(producto);
    setMostrarConfirmacion(true);
  };

  const confirmarEliminar = async () => {
    if (!productoAEliminar) return;
    try {
      await deleteProducto(productoAEliminar.id);
      setMostrarConfirmacion(false);
      setProductoAEliminar(null);
      loadProductos();
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  // === FILTROS ===
  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.modelo.toLowerCase().includes(busqueda.toLowerCase())
  );

  // === PAGINACIÓN LOCAL ===
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const indexInicial = (paginaActual - 1) * productosPorPagina;
  const productosPagina = productosFiltrados.slice(
    indexInicial,
    indexInicial + productosPorPagina
  );

  const cambiarPagina = (num) => setPaginaActual(num);

  // === EXPORTACIONES ===
  const exportarPDF = () => {
    try {
      if (!productos || productos.length === 0) {
        alert("No hay productos para exportar.");
        return;
      }

      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });
      doc.setFontSize(14);
      doc.text("Reporte de Productos - SmartSales365", 40, 40);

      const datos = productos.map((p) => [
        p.id,
        p.nombre || "",
        p.marca || "",
        p.modelo || "",
        `Bs. ${p.precio || 0}`,
        p.stock || 0,
        p.estado || "",
      ]);

      autoTable(doc, {
        head: [["ID", "Nombre", "Marca", "Modelo", "Precio", "Stock", "Estado"]],
        body: datos,
        startY: 60,
        theme: "grid",
        styles: {
          fontSize: 10,
          halign: "center",
          cellPadding: 4,
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: 255,
        },
      });

      doc.save("reporte_productos.pdf");
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Ocurrió un problema al generar el PDF. Revisa la consola.");
    }
  };

  const exportarExcel = () => {
    const hoja = XLSX.utils.json_to_sheet(productos);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Productos");
    const excel = XLSX.write(libro, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excel], { type: "application/octet-stream" }), "productos.xlsx");
  };

  const exportarHTML = () => {
    try {
      if (!productos || productos.length === 0) {
        alert("No hay productos para exportar.");
        return;
      }

      const fecha = new Date().toLocaleDateString();
      const hora = new Date().toLocaleTimeString();

      const html = `
        <html>
          <head>
            <title>Reporte de Productos</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #0f172a;
                color: #f1f5f9;
                padding: 40px;
              }
              h1 {
                text-align: center;
                color: #3b82f6;
                margin-bottom: 20px;
              }
              .info {
                text-align: right;
                font-size: 13px;
                color: #94a3b8;
                margin-bottom: 15px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
                background-color: #1e293b;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(0,0,0,0.3);
              }
              th {
                background-color: #2563eb;
                color: white;
                padding: 10px;
                font-size: 14px;
                text-transform: uppercase;
                text-align: left;
              }
              td {
                padding: 10px;
                font-size: 14px;
                border-bottom: 1px solid #334155;
              }
              tr:nth-child(even) {
                background-color: #14213d;
              }
              tr:hover {
                background-color: #243b53;
              }
              .activo {
                color: #10b981;
                font-weight: 600;
              }
              .inactivo {
                color: #ef4444;
                font-weight: 600;
              }
              footer {
                text-align: center;
                margin-top: 30px;
                font-size: 12px;
                color: #64748b;
              }
            </style>
          </head>
          <body>
            <h1>Reporte de Productos</h1>
            <div class="info">
              Generado el ${fecha} a las ${hora} <br />
              Sistema SmartSales365
            </div>

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${productos
                  .map(
                    (p) => `
                    <tr>
                      <td>${p.id}</td>
                      <td>${p.nombre}</td>
                      <td>${p.marca}</td>
                      <td>${p.modelo}</td>
                      <td>Bs. ${p.precio}</td>
                      <td>${p.stock}</td>
                      <td class="${p.estado === "activo" ? "activo" : "inactivo"}">
                        ${p.estado}
                      </td>
                    </tr>
                  `
                  )
                  .join("")}
              </tbody>
            </table>

            <footer>
              © ${new Date().getFullYear()} SmartSales365 — Todos los derechos reservados.
            </footer>
          </body>
        </html>
      `;

      const newWindow = window.open("", "_blank");
      newWindow.document.write(html);
      newWindow.document.close();
    } catch (error) {
      console.error("Error al generar HTML:", error);
      alert("Ocurrió un problema al generar el reporte HTML.");
    }
  };

  // === UI ===
  return (
    <div className="productos-page">
      <div className="productos-header">
        <h2>Gestión de Productos</h2>

        <div className="acciones-top">
          <input
            type="text"
            placeholder="Buscar por nombre, marca o modelo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <button className="btn-primary" onClick={handleNuevo}>
            <FaPlus /> Nuevo Producto
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
              <th>ID</th>
              <th>Nombre</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosPagina.length > 0 ? (
              productosPagina.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{p.marca}</td>
                  <td>{p.modelo}</td>
                  <td>Bs. {p.precio}</td>
                  <td>{p.stock}</td>
                  <td>{p.estado}</td>
                  <td className="acciones">
                    <button
                      className="btn-accion btn-ver"
                      onClick={() => setMostrarDetalles(p)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn-accion btn-editar"
                      onClick={() => handleEditar(p)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-accion btn-eliminar"
                      onClick={() => handleEliminar(p)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="sin-datos">
                  No hay productos registrados
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
                className={`pagina-btn ${
                  paginaActual === i + 1 ? "activa" : ""
                }`}
                onClick={() => cambiarPagina(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* === MODAL FORMULARIO === */}
      {mostrarModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editing ? "Editar Producto" : "Nuevo Producto"}</h3>
            <form onSubmit={handleGuardar}>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="marca"
                placeholder="Marca"
                value={formData.marca}
                onChange={handleChange}
              />
              <input
                type="text"
                name="modelo"
                placeholder="Modelo"
                value={formData.modelo}
                onChange={handleChange}
              />
              <input
                type="number"
                name="precio"
                placeholder="Precio (Bs)"
                value={formData.precio}
                onChange={handleChange}
              />
              <input
                type="number"
                name="stock"
                placeholder="Stock"
                value={formData.stock}
                onChange={handleChange}
              />
              <textarea
                name="descripcion"
                placeholder="Descripción"
                value={formData.descripcion}
                onChange={handleChange}
              />
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
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
            <h3>Detalles del Producto</h3>
            <p>
              <b>ID:</b> {mostrarDetalles.id}
            </p>
            <p>
              <b>Nombre:</b> {mostrarDetalles.nombre}
            </p>
            <p>
              <b>Marca:</b> {mostrarDetalles.marca}
            </p>
            <p>
              <b>Modelo:</b> {mostrarDetalles.modelo}
            </p>
            <p>
              <b>Precio:</b> Bs. {mostrarDetalles.precio}
            </p>
            <p>
              <b>Stock:</b> {mostrarDetalles.stock}
            </p>
            <p>
              <b>Estado:</b> {mostrarDetalles.estado}
            </p>
            <p>
              <b>Descripción:</b> {mostrarDetalles.descripcion}
            </p>
            <div className="modal-actions">
              <button
                className="btn-cancelar"
                onClick={() => setMostrarDetalles(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL DE CONFIRMACIÓN DE ELIMINACIÓN === */}
      {mostrarConfirmacion && (
        <div className="modal">
          <div className="modal-content eliminar-modal">
            <h3>¿Seguro que deseas eliminar este producto?</h3>
            <p style={{ marginTop: "10px", color: "#94a3b8" }}>
              {productoAEliminar?.nombre} — {productoAEliminar?.marca}{" "}
              {productoAEliminar?.modelo}
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

export default ProductoListPage;