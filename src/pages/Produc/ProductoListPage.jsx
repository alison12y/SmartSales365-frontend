import React, { useState, useEffect } from "react";
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  createGarantia,
} from "../../api/productos";
import "../../styles/ProductoListPage.css";
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
import axios from "axios";

function ProductoListPage() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarDetalles, setMostrarDetalles] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [mostrarGarantiaModal, setMostrarGarantiaModal] = useState(false);

  const [tipo_garantia, setTipo_garantia] = useState("");
  const [duracion_meses, setDuracion_meses] = useState("");
  const [proveedor_servicio, setProveedor_servicio] = useState("");
  const [descripcion_condiciones, setDescripcion_condiciones] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    marca: "",
    modelo: "",
    precio: "",
    stock: "",
    descripcion: "",
    estado: "activo",
    imagen: null,
  });
  const [preview, setPreview] = useState(null);
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, imagen: file });
    setPreview(URL.createObjectURL(file)); // vista previa en vivo
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });

      if (editing) {
        await updateProducto(editingId, formDataToSend);
      } else {
        await createProducto(formDataToSend);
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
      imagen: null,
    });
    setPreview(null);
  };

  const handleNuevo = () => {
    setEditing(false);
    resetForm();
    setMostrarModal(true);
  };

  const handleEditar = (p) => {
    setEditing(true);
    setEditingId(p.id);
    setFormData({
      nombre: p.nombre,
      marca: p.marca,
      modelo: p.modelo,
      precio: p.precio,
      stock: p.stock,
      descripcion: p.descripcion,
      estado: p.estado,
      imagen: null,
    });
    setPreview(p.imagen_url || null);
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

  // === GARANTÍAS ===
  const handleAgregarGarantia = async () => {
    if (!mostrarDetalles?.id) {
      alert("Selecciona un producto primero");
      return;
    }

    if (!tipo_garantia.trim() || !duracion_meses || !proveedor_servicio.trim()) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      const data = {
        producto_id: mostrarDetalles.id,
        tipo_garantia,
        duracion_meses: parseInt(duracion_meses),
        proveedor_servicio,
        descripcion_condiciones,
        estado: "activo",
      };

      await createGarantia(data);
      alert("Garantía agregada exitosamente");

      // Limpiar formulario
      resetGarantiaForm();
      setMostrarGarantiaModal(false);

      // Recargar detalles del producto
      loadProductos();
    } catch (error) {
      console.error("Error al agregar garantía:", error);
      alert("Error al agregar garantía: " + error.message);
    }
  };

  const resetGarantiaForm = () => {
    setTipo_garantia("");
    setDuracion_meses("");
    setProveedor_servicio("");
    setDescripcion_condiciones("");
  };

  // === FILTROS ===
  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.modelo.toLowerCase().includes(busqueda.toLowerCase())
  );

  // === PAGINACIÓN ===
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const indexInicial = (paginaActual - 1) * productosPorPagina;
  const productosPagina = productosFiltrados.slice(
    indexInicial,
    indexInicial + productosPorPagina
  );
  const cambiarPagina = (num) => setPaginaActual(num);

  // === EXPORTAR DETALLE PDF ===
  const exportarDetallePDF = (producto) => {
    if (!producto) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });
    doc.setFontSize(16);
    doc.text("Detalle de Producto", 40, 40);
    doc.setFontSize(12);
    doc.text(`SmartSales365 — ${new Date().toLocaleDateString()}`, 40, 60);

    const datosProducto = [
      ["Nombre", producto.nombre || "-"],
      ["Marca", producto.marca || "-"],
      ["Modelo", producto.modelo || "-"],
      ["Precio", `Bs. ${producto.precio || 0}`],
      ["Stock", producto.stock || "0"],
      ["Estado", producto.estado || "-"],
      ["Descripción", producto.descripcion || "-"],
    ];

    autoTable(doc, {
      startY: 80,
      head: [["Campo", "Valor"]],
      body: datosProducto,
      theme: "striped",
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
      },
    });

    const garantias = producto.garantias || [];
    if (garantias.length > 0) {
      doc.setFontSize(14);
      doc.text("Garantías Asociadas", 40, doc.lastAutoTable.finalY + 30);
      const datosGarantias = garantias.map((g) => [
        g.tipo_garantia || "-",
        `${g.duracion_meses || 0} meses`,
        g.proveedor_servicio || "-",
        g.descripcion_condiciones || "-",
        g.estado || "-",
      ]);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 50,
        head: [["Tipo", "Duración", "Proveedor", "Condiciones", "Estado"]],
        body: datosGarantias,
        theme: "grid",
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: 255,
        },
      });
    } else {
      doc.setFontSize(12);
      doc.text(
        "No hay garantías registradas para este producto.",
        40,
        doc.lastAutoTable.finalY + 40
      );
    }

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl);
    printWindow.onload = () => printWindow.print();
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
          <button className="btn-success" onClick={() => exportarExcel()}>
            <FaFileExcel /> Excel
          </button>
          <button className="btn-danger" onClick={() => exportarPDF()}>
            <FaFilePdf /> PDF
          </button>
          <button className="btn-secondary" onClick={() => exportarHTML()}>
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
                    <button className="btn-accion btn-ver" onClick={() => setMostrarDetalles(p)}>
                      <FaEye />
                    </button>
                    <button className="btn-accion btn-editar" onClick={() => handleEditar(p)}>
                      <FaEdit />
                    </button>
                    <button className="btn-accion btn-eliminar" onClick={() => handleEliminar(p)}>
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
      </div>

      {/* === MODAL FORMULARIO === */}
      {mostrarModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editing ? "Editar Producto" : "Nuevo Producto"}</h3>
            <form onSubmit={handleGuardar}>
              <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />
              <input type="text" name="marca" placeholder="Marca" value={formData.marca} onChange={handleChange} />
              <input type="text" name="modelo" placeholder="Modelo" value={formData.modelo} onChange={handleChange} />
              <input type="number" name="precio" placeholder="Precio (Bs)" value={formData.precio} onChange={handleChange} />
              <input type="number" name="stock" placeholder="Stock" value={formData.stock} onChange={handleChange} />
              <textarea name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleChange} />

              {/* === Campo para subir imagen === */}
              <label>Imagen del producto:</label>
              <input type="file" name="imagen" accept="image/*" onChange={handleImageChange} />

              {/* Vista previa */}
              {preview && (
                <div style={{ textAlign: "center", margin: "10px 0" }}>
                  <img
                    src={preview}
                    alt="Vista previa"
                    style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "10px" }}
                  />
                </div>
              )}

              <select name="estado" value={formData.estado} onChange={handleChange}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>

              <div className="modal-actions">
                <button className="btn-cancelar" type="button" onClick={() => setMostrarModal(false)}>
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

            {mostrarDetalles.imagen_url && (
              <div style={{ textAlign: "center", marginBottom: "15px" }}>
                <img
                  src={mostrarDetalles.imagen_url}
                  alt={mostrarDetalles.nombre}
                  style={{
                    width: "200px",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    border: "2px solid #334155",
                  }}
                />
              </div>
            )}

            <p><b>Nombre:</b> {mostrarDetalles.nombre}</p>
            <p><b>Marca:</b> {mostrarDetalles.marca}</p>
            <p><b>Modelo:</b> {mostrarDetalles.modelo}</p>
            <p><b>Precio:</b> Bs. {mostrarDetalles.precio}</p>
            <p><b>Stock:</b> {mostrarDetalles.stock}</p>
            <p><b>Estado:</b> {mostrarDetalles.estado}</p>
            <p><b>Descripción:</b> {mostrarDetalles.descripcion}</p>

            {/* Garantías */}
            {mostrarDetalles.garantias && mostrarDetalles.garantias.length > 0 && (
              <div style={{ marginTop: "15px" }}>
                <h4>Garantías Asociadas:</h4>
                <ul style={{ marginLeft: "20px" }}>
                  {mostrarDetalles.garantias.map((g) => (
                    <li key={g.id}>
                      <b>{g.tipo_garantia}</b> - {g.duracion_meses} meses
                      <br />
                      <small>{g.proveedor_servicio}</small>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button className="btn-primary" onClick={() => setMostrarGarantiaModal(true)}>
              + Agregar Garantía
            </button>
            <button className="btn-primary" onClick={() => exportarDetallePDF(mostrarDetalles)}>
              <FaFilePdf /> Imprimir Detalle
            </button>
            <button className="btn-cancelar" onClick={() => setMostrarDetalles(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* === MODAL GARANTÍA === */}
      {mostrarGarantiaModal && mostrarDetalles && (
        <div className="modal">
          <div className="modal-content">
            <h3>Agregar Garantía a {mostrarDetalles.nombre}</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAgregarGarantia();
            }}>
              <input
                type="text"
                placeholder="Tipo de Garantía (Ej: Garantía del Fabricante)"
                value={tipo_garantia}
                onChange={(e) => setTipo_garantia(e.target.value)}
                required
              />

              <input
                type="number"
                placeholder="Duración (meses)"
                value={duracion_meses}
                onChange={(e) => setDuracion_meses(e.target.value)}
                min="1"
                required
              />

              <input
                type="text"
                placeholder="Proveedor del Servicio"
                value={proveedor_servicio}
                onChange={(e) => setProveedor_servicio(e.target.value)}
                required
              />

              <textarea
                placeholder="Descripción y Condiciones"
                value={descripcion_condiciones}
                onChange={(e) => setDescripcion_condiciones(e.target.value)}
                rows="4"
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => {
                    setMostrarGarantiaModal(false);
                    resetGarantiaForm();
                  }}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Agregar Garantía
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === MODAL ELIMINACIÓN === */}
      {mostrarConfirmacion && (
        <div className="modal">
          <div className="modal-content eliminar-modal">
            <h3>¿Seguro que deseas eliminar este producto?</h3>
            <p style={{ marginTop: "10px", color: "#94a3b8" }}>
              {productoAEliminar?.nombre} — {productoAEliminar?.marca} {productoAEliminar?.modelo}
            </p>
            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setMostrarConfirmacion(false)}>
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
