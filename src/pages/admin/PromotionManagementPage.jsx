import React, { useState, useEffect } from "react";
import {
  getPromociones,
  createPromocion,
  updatePromocion,
  deletePromocion,
  assignPromocionToProducto,
  removePromocionFromProducto,
  getAllProductoPromociones,
} from "../../api/promotionService";
import { getPublicProducts } from "../../api/catalogService";
import "../../styles/PromotionManagementPage.css";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaFilePdf,
  FaFileExcel,
  FaToggleOn,
  FaToggleOff,
  FaLink,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const ITEMS_POR_PAGINA = 10;

function PromotionManagementPage() {
  const [promociones, setPromociones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarDetalles, setMostrarDetalles] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [promocionAEliminar, setPromocionAEliminar] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // === Estados para asignar productos ===
  const [mostrarAsignarProductos, setMostrarAsignarProductos] = useState(false);
  const [promocionSeleccionada, setPromocionSeleccionada] = useState(null);
  const [productos, setProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState(new Set());
  const [productosActuales, setProductosActuales] = useState([]);
  const [buscaProducto, setBuscaProducto] = useState("");
  const [loadingProductos, setLoadingProductos] = useState(false);

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    descuento_porcentaje: "",
    descuento_fijo: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "activa",
    tipo_descuento: "porcentaje", // 'porcentaje' o 'fijo'
  });

  // === Cargar promociones ===
  const loadPromociones = async () => {
    try {
      setLoading(true);
      const res = await getPromociones();
      setPromociones(res.data.results || res.data);
    } catch (err) {
      console.error("Error al cargar promociones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromociones();
  }, []);

  // === HANDLERS ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNuevo = () => {
    setEditing(false);
    resetForm();
    setMostrarModal(true);
  };

  const handleEditar = (promo) => {
    setEditing(true);
    setEditingId(promo.id);
    setFormData({
      titulo: promo.titulo,
      descripcion: promo.descripcion,
      descuento_porcentaje: promo.descuento_porcentaje || "",
      descuento_fijo: promo.descuento_fijo || "",
      fecha_inicio: promo.fecha_inicio ? promo.fecha_inicio.split("T")[0] : "",
      fecha_fin: promo.fecha_fin ? promo.fecha_fin.split("T")[0] : "",
      estado: promo.estado,
      tipo_descuento: promo.descuento_porcentaje ? "porcentaje" : "fijo",
    });
    setMostrarModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.titulo.trim()) {
      alert("El título es requerido");
      return;
    }

    if (formData.tipo_descuento === "porcentaje" && !formData.descuento_porcentaje) {
      alert("Ingresa el porcentaje de descuento");
      return;
    }

    if (formData.tipo_descuento === "fijo" && !formData.descuento_fijo) {
      alert("Ingresa el descuento fijo");
      return;
    }

    if (!formData.fecha_inicio || !formData.fecha_fin) {
      alert("Ambas fechas son requeridas");
      return;
    }

    try {
      const dataToSend = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        estado: formData.estado,
      };

      // Agregar descuento según tipo (SIN enviar null)
      if (formData.tipo_descuento === "porcentaje") {
        dataToSend.descuento_porcentaje = parseFloat(formData.descuento_porcentaje);
        // No enviar descuento_fijo si es porcentaje
      } else {
        dataToSend.descuento_fijo = parseFloat(formData.descuento_fijo);
        // No enviar descuento_porcentaje si es fijo
      }

      if (editing) {
        await updatePromocion(editingId, dataToSend);
        alert("Promoción actualizada exitosamente");
      } else {
        await createPromocion(dataToSend);
        alert("Promoción creada exitosamente");
      }

      setMostrarModal(false);
      setEditing(false);
      resetForm();
      loadPromociones();
    } catch (error) {
      console.error("Error al guardar promoción:", error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || error.message;
      alert("Error: " + errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      descripcion: "",
      descuento_porcentaje: "",
      descuento_fijo: "",
      fecha_inicio: "",
      fecha_fin: "",
      estado: "activa",
      tipo_descuento: "porcentaje",
    });
  };

  const handleEliminar = (promo) => {
    setPromocionAEliminar(promo);
    setMostrarConfirmacion(true);
  };

  const confirmarEliminar = async () => {
    if (!promocionAEliminar) return;
    try {
      await deletePromocion(promocionAEliminar.id);
      alert("Promoción eliminada exitosamente");
      setMostrarConfirmacion(false);
      setPromocionAEliminar(null);
      loadPromociones();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("Error: " + err.message);
    }
  };

  const handleToggleEstado = async (promo) => {
    try {
      const nuevoEstado = promo.estado === "activa" ? "inactiva" : "activa";
      await updatePromocion(promo.id, { estado: nuevoEstado });
      loadPromociones();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  // === ASIGNAR PRODUCTOS ===
  const abrirAsignarProductos = async (promo) => {
    try {
      setLoadingProductos(true);
      setPromocionSeleccionada(promo);
      
      // Cargar todos los productos
      const resProductos = await getPublicProducts({ page_size: 1000 });
      setProductos(resProductos.data.results || []);
      
      // Cargar productos actualmente asignados
      const resActuales = await getAllProductoPromociones({ promocion: promo.id });
      const idsAsignados = new Set(
        (resActuales.data?.results || []).map(pp => pp.producto)
      );
      setProductosActuales(idsAsignados);
      setProductosSeleccionados(new Set(idsAsignados));
      
      setBuscaProducto("");
      setMostrarAsignarProductos(true);
    } catch (error) {
      console.error("Error cargando productos:", error);
      alert("Error al cargar productos");
    } finally {
      setLoadingProductos(false);
    }
  };

  const cerrarAsignarProductos = () => {
    setMostrarAsignarProductos(false);
    setPromocionSeleccionada(null);
    setProductos([]);
    setProductosSeleccionados(new Set());
    setBuscaProducto("");
  };

  const toggleProducto = (productoId) => {
    const nuevos = new Set(productosSeleccionados);
    if (nuevos.has(productoId)) {
      nuevos.delete(productoId);
    } else {
      nuevos.add(productoId);
    }
    setProductosSeleccionados(nuevos);
  };

  const guardarAsignaciones = async () => {
    if (!promocionSeleccionada) return;
    
    try {
      setLoadingProductos(true);
      
      // Productos a agregar (nuevos)
      const aAgregar = Array.from(productosSeleccionados).filter(
        id => !productosActuales.has(id)
      );
      
      // Productos a remover (desseleccionados)
      const aRemover = Array.from(productosActuales).filter(
        id => !productosSeleccionados.has(id)
      );
      
      // Agregar nuevas asignaciones
      for (const productoId of aAgregar) {
        await assignPromocionToProducto({
          producto: productoId,
          promocion: promocionSeleccionada.id,
        });
      }
      
      // Remover asignaciones desseleccionadas
      for (const pp of (await getAllProductoPromociones()).data.results || []) {
        if (
          pp.promocion === promocionSeleccionada.id &&
          aRemover.includes(pp.producto)
        ) {
          await removePromocionFromProducto(pp.id);
        }
      }
      
      alert(
        `Asignaciones guardadas: +${aAgregar.length} productos agregados, -${aRemover.length} removidos`
      );
      cerrarAsignarProductos();
      loadPromociones();
    } catch (error) {
      console.error("Error guardando asignaciones:", error);
      alert("Error al guardar asignaciones");
    } finally {
      setLoadingProductos(false);
    }
  };

  // === FILTROS ===
  const promocionesFiltradas = promociones.filter(
    (p) =>
      p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  // === PAGINACIÓN ===
  const totalPaginas = Math.ceil(promocionesFiltradas.length / ITEMS_POR_PAGINA);
  const indexInicial = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const promocionesPagina = promocionesFiltradas.slice(
    indexInicial,
    indexInicial + ITEMS_POR_PAGINA
  );

  // === EXPORTACIONES ===
  const exportarPDF = () => {
    if (promociones.length === 0) {
      alert("No hay promociones para exportar");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });
    doc.setFontSize(14);
    doc.text("Reporte de Promociones - SmartSales365", 40, 40);

    const datos = promociones.map((p) => [
      p.id,
      p.titulo,
      p.descripcion?.substring(0, 30) || "-",
      p.descuento_porcentaje ? `${p.descuento_porcentaje}%` : `Bs. ${p.descuento_fijo}`,
      new Date(p.fecha_inicio).toLocaleDateString(),
      new Date(p.fecha_fin).toLocaleDateString(),
      p.estado,
    ]);

    autoTable(doc, {
      startY: 80,
      head: [["ID", "Título", "Descripción", "Descuento", "Inicio", "Fin", "Estado"]],
      body: datos,
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    });

    doc.save("promociones.pdf");
  };

  const exportarExcel = () => {
    if (promociones.length === 0) {
      alert("No hay promociones para exportar");
      return;
    }

    const datos = promociones.map((p) => ({
      ID: p.id,
      Título: p.titulo,
      Descripción: p.descripcion,
      Descuento: p.descuento_porcentaje ? `${p.descuento_porcentaje}%` : `Bs. ${p.descuento_fijo}`,
      "Fecha Inicio": new Date(p.fecha_inicio).toLocaleDateString(),
      "Fecha Fin": new Date(p.fecha_fin).toLocaleDateString(),
      Estado: p.estado,
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Promociones");
    XLSX.write(wb, { bookType: "xlsx", type: "binary" });
    XLSX.writeFile(wb, "promociones.xlsx");
  };

  const exportarDetallePDF = (promo) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Detalle de Promoción", 20, 20);
    doc.setFontSize(12);

    const datos = [
      ["Título", promo.titulo],
      ["Descripción", promo.descripcion],
      ["Descuento", promo.descuento_porcentaje ? `${promo.descuento_porcentaje}%` : `Bs. ${promo.descuento_fijo}`],
      ["Fecha Inicio", new Date(promo.fecha_inicio).toLocaleDateString()],
      ["Fecha Fin", new Date(promo.fecha_fin).toLocaleDateString()],
      ["Estado", promo.estado],
    ];

    autoTable(doc, {
      startY: 50,
      head: [["Campo", "Valor"]],
      body: datos,
      theme: "striped",
    });

    doc.save(`promocion_${promo.id}.pdf`);
  };

  return (
    <div className="promotion-management-page">
      <div className="page-header">
        <h1>📢 Gestión de Promociones</h1>
        <p className="subtitle">
          {promociones.length} promociones registradas
        </p>
      </div>

      {/* === CONTROLES === */}
      <div className="controles-top">
        <div className="acciones-top">
          <input
            type="text"
            placeholder="Buscar por título o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />

          <button className="btn-primary" onClick={handleNuevo}>
            <FaPlus /> Nueva Promoción
          </button>
          <button className="btn-success" onClick={exportarExcel}>
            <FaFileExcel /> Excel
          </button>
          <button className="btn-danger" onClick={exportarPDF}>
            <FaFilePdf /> PDF
          </button>
        </div>
      </div>

      {/* === TABLA === */}
      <div className="tabla-card">
        {loading ? (
          <p className="loading">Cargando...</p>
        ) : promocionesPagina.length > 0 ? (
          <>
            <table className="table-dark">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Descuento</th>
                  <th>Vigencia</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {promocionesPagina.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.titulo}</td>
                    <td>
                      {p.descuento_porcentaje
                        ? `${p.descuento_porcentaje}%`
                        : `Bs. ${p.descuento_fijo}`}
                    </td>
                    <td>
                      {new Date(p.fecha_inicio).toLocaleDateString()} -{" "}
                      {new Date(p.fecha_fin).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge badge-${p.estado}`}>
                        {p.estado}
                      </span>
                    </td>
                    <td className="acciones">
                      <button
                        className="btn-accion btn-ver"
                        onClick={() => setMostrarDetalles(p)}
                        title="Ver detalles"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn-accion btn-editar"
                        onClick={() => handleEditar(p)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-accion"
                        onClick={() => abrirAsignarProductos(p)}
                        title="Asignar Productos"
                        style={{ background: "#0ea5e9" }}
                      >
                        <FaLink />
                      </button>
                      <button
                        className="btn-accion"
                        onClick={() => handleToggleEstado(p)}
                        title={p.estado === "activa" ? "Desactivar" : "Activar"}
                        style={{
                          background: p.estado === "activa" ? "#10b981" : "#6b7280",
                        }}
                      >
                        {p.estado === "activa" ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                      <button
                        className="btn-accion btn-eliminar"
                        onClick={() => handleEliminar(p)}
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="pagination">
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                  (num) => (
                    <button
                      key={num}
                      className={paginaActual === num ? "active" : ""}
                      onClick={() => setPaginaActual(num)}
                    >
                      {num}
                    </button>
                  )
                )}
              </div>
            )}
          </>
        ) : (
          <p className="sin-datos">No hay promociones registradas</p>
        )}
      </div>

      {/* === MODAL FORMULARIO === */}
      {mostrarModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editing ? "Editar Promoción" : "Nueva Promoción"}</h3>
            <form onSubmit={handleGuardar}>
              <input
                type="text"
                name="titulo"
                placeholder="Título de la promoción"
                value={formData.titulo}
                onChange={handleChange}
                required
              />

              <textarea
                name="descripcion"
                placeholder="Descripción"
                value={formData.descripcion}
                onChange={handleChange}
                rows="3"
              />

              {/* Tipo de descuento */}
              <label>Tipo de Descuento:</label>
              <select
                name="tipo_descuento"
                value={formData.tipo_descuento}
                onChange={handleChange}
              >
                <option value="porcentaje">Porcentaje (%)</option>
                <option value="fijo">Cantidad Fija (Bs.)</option>
              </select>

              {/* Descuento según tipo */}
              {formData.tipo_descuento === "porcentaje" ? (
                <input
                  type="number"
                  name="descuento_porcentaje"
                  placeholder="Ej: 15 (por 15%)"
                  value={formData.descuento_porcentaje}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                />
              ) : (
                <input
                  type="number"
                  name="descuento_fijo"
                  placeholder="Ej: 50 (Bs. 50)"
                  value={formData.descuento_fijo}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              )}

              <label>Fecha de Inicio:</label>
              <input
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                required
              />

              <label>Fecha de Fin:</label>
              <input
                type="date"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleChange}
                required
              />

              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
              >
                <option value="activa">Activa</option>
                <option value="inactiva">Inactiva</option>
              </select>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editing ? "Guardar Cambios" : "Crear Promoción"}
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
            <h3>{mostrarDetalles.titulo}</h3>

            <p>
              <b>Descripción:</b> {mostrarDetalles.descripcion}
            </p>
            <p>
              <b>Descuento:</b>{" "}
              {mostrarDetalles.descuento_porcentaje
                ? `${mostrarDetalles.descuento_porcentaje}%`
                : `Bs. ${mostrarDetalles.descuento_fijo}`}
            </p>
            <p>
              <b>Válido desde:</b>{" "}
              {new Date(mostrarDetalles.fecha_inicio).toLocaleDateString()}
            </p>
            <p>
              <b>Válido hasta:</b>{" "}
              {new Date(mostrarDetalles.fecha_fin).toLocaleDateString()}
            </p>
            <p>
              <b>Estado:</b>{" "}
              <span className={`badge badge-${mostrarDetalles.estado}`}>
                {mostrarDetalles.estado}
              </span>
            </p>

            <button
              className="btn-primary"
              onClick={() => exportarDetallePDF(mostrarDetalles)}
            >
              <FaFilePdf /> Descargar PDF
            </button>
            <button
              className="btn-cancelar"
              onClick={() => setMostrarDetalles(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* === MODAL ELIMINACIÓN === */}
      {mostrarConfirmacion && (
        <div className="modal">
          <div className="modal-content eliminar-modal">
            <h3>¿Eliminar esta promoción?</h3>
            <p>{promocionAEliminar?.titulo}</p>
            <div className="modal-actions">
              <button
                className="btn-cancelar"
                onClick={() => setMostrarConfirmacion(false)}
              >
                Cancelar
              </button>
              <button className="btn-aceptar" onClick={confirmarEliminar}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL ASIGNAR PRODUCTOS === */}
      {mostrarAsignarProductos && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: "600px", maxHeight: "80vh", overflowY: "auto" }}>
            <h3>🔗 Asignar Productos a: {promocionSeleccionada?.titulo}</h3>
            <p style={{ fontSize: "12px", color: "#aaa", marginBottom: "15px" }}>
              Selecciona los productos que deseas vincular con esta promoción
            </p>

            {/* Búsqueda */}
            <input
              type="text"
              placeholder="🔍 Buscar producto..."
              value={buscaProducto}
              onChange={(e) => setBuscaProducto(e.target.value.toLowerCase())}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "15px",
                borderRadius: "5px",
                border: "1px solid #444",
                background: "#2a2f3a",
                color: "#fff",
              }}
            />

            {/* Lista de productos */}
            <div style={{ maxHeight: "400px", overflowY: "auto", marginBottom: "15px" }}>
              {loadingProductos ? (
                <p style={{ textAlign: "center", color: "#aaa" }}>Cargando productos...</p>
              ) : productos
                  .filter((p) => p.nombre.toLowerCase().includes(buscaProducto))
                  .map((p) => (
                    <label
                      key={p.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "10px",
                        marginBottom: "8px",
                        borderRadius: "5px",
                        background: "#2a2f3a",
                        cursor: "pointer",
                        border: productosSeleccionados.has(p.id)
                          ? "2px solid #00bfff"
                          : "1px solid #444",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={productosSeleccionados.has(p.id)}
                        onChange={() => toggleProducto(p.id)}
                        style={{ marginRight: "10px", cursor: "pointer" }}
                      />
                      <span style={{ flex: 1 }}>
                        <strong>{p.nombre}</strong>
                        <br />
                        <small style={{ color: "#aaa" }}>
                          Bs. {parseFloat(p.precio).toFixed(2)} | Stock: {p.stock}
                        </small>
                      </span>
                    </label>
                  ))}
            </div>

            {/* Resumen */}
            <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "15px", textAlign: "center" }}>
              {productosSeleccionados.size} producto(s) seleccionado(s)
            </div>

            {/* Acciones */}
            <div className="modal-actions">
              <button
                className="btn-cancelar"
                onClick={cerrarAsignarProductos}
                disabled={loadingProductos}
              >
                Cancelar
              </button>
              <button
                className="btn-aceptar"
                onClick={guardarAsignaciones}
                disabled={loadingProductos}
                style={{
                  opacity: loadingProductos ? 0.5 : 1,
                  cursor: loadingProductos ? "not-allowed" : "pointer",
                }}
              >
                {loadingProductos ? "Guardando..." : "Guardar Asignaciones"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PromotionManagementPage;
