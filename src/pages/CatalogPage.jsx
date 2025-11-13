// src/pages/CatalogPage.jsx
import React, { useState, useEffect } from "react";
import { getPublicProducts, getPublicCategories } from "../api/catalogService";
import { useDebounce } from "../hooks/useDebounce";
import { Link } from "react-router-dom";
import ProductCard from "../components/products/ProductCard";
import { useCart } from "../context/CartContext";
import { Grid3x3, List } from "lucide-react";
import "../styles/CatalogPage.css";

const ITEMS_POR_PAGINA = 12;

function CatalogPage() {
  // === ESTADOS ===
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [ordenamiento, setOrdenamiento] = useState("nombre");
  const [viewType, setViewType] = useState("grid");
  const debouncedBusqueda = useDebounce(busqueda, 300);

  // === CARGAR CATEGORÍAS ===
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getPublicCategories();
        const cats = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];
        setCategories(cats);
      } catch (err) {
        console.warn("No se pudieron cargar categorías:", err);
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  // === CARGAR PRODUCTOS ===
  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: paginaActual,
        page_size: ITEMS_POR_PAGINA,
        search: debouncedBusqueda || "",
        estado: "activo",
        ordering: ordenamiento,
      };
      if (categoriaSeleccionada) params.categoria = categoriaSeleccionada;

      const res = await getPublicProducts(params);
      setProducts(res.data.results || []);
      setTotalItems(res.data.count || 0);
      setError(null);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError("Error al cargar productos. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos en cambios de filtro
  useEffect(() => {
    setPaginaActual(1);
    loadProducts();
  }, [debouncedBusqueda, categoriaSeleccionada, ordenamiento]);

  // Cargar productos al cambiar de página
  useEffect(() => {
    loadProducts();
  }, [paginaActual]);

  // === PAGINACIÓN ===
  const totalPaginas = Math.ceil(totalItems / ITEMS_POR_PAGINA);

  // === AGREGAR AL CARRITO ===
  const { addToCart } = useCart();

  const handleAddToCart = (productId, quantity = 1) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return console.warn('Producto no encontrado para agregar al carrito', productId);
    addToCart(product, quantity);
  };

  return (
    <div className="catalog-page">
      {/* Breadcrumb */}
      <div className="catalog-breadcrumb">
        <Link to="/dashboard">Inicio</Link>
        <span>/</span>
        <span>Catálogo</span>
      </div>

      {/* Header */}
      <div className="catalog-header">
        <div className="catalog-title-section">
          <h1>🛍️ Nuestro Catálogo</h1>
          <p className="catalog-subtitle">
            {totalItems > 0
              ? `${totalItems} productos disponibles`
              : "Sin productos"}
          </p>
        </div>
        <div className="catalog-header-actions">
          <Link to="/dashboard/cart" className="btn btn-secondary">Ir al carrito</Link>
        </div>
        <input
          type="text"
          placeholder="Buscar productos..."
          className="catalog-search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="catalog-container">
        {/* Sidebar de filtros */}
        <aside className="catalog-sidebar">
          <div className="filter-group">
            <h3 className="filter-title">Categorías</h3>
            <div className="filter-list">
              <label className="filter-option">
                <input
                  type="radio"
                  name="categoria"
                  value=""
                  checked={categoriaSeleccionada === ""}
                  onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                />
                Todas las categorías
              </label>
              {categories.map((cat) => (
                <label key={cat.id} className="filter-option">
                  <input
                    type="radio"
                    name="categoria"
                    value={cat.id}
                    checked={categoriaSeleccionada === cat.id.toString()}
                    onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                  />
                  {cat.nombre}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3 className="filter-title">Ordenar por</h3>
            <select
              className="filter-select"
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value)}
            >
              <option value="nombre">Nombre (A-Z)</option>
              <option value="-nombre">Nombre (Z-A)</option>
              <option value="precio">Precio menor</option>
              <option value="-precio">Precio mayor</option>
              <option value="-fecha_registro">Más recientes</option>
            </select>
          </div>
        </aside>

        {/* Main Content */}
        <div className="catalog-main">
          {/* View Controls */}
          <div className="catalog-controls">
            <div className="view-toggle">
              <button
                className={`view-btn ${viewType === "grid" ? "active" : ""}`}
                onClick={() => setViewType("grid")}
                title="Vista en cuadrícula"
              >
                <Grid3x3 size={20} />
              </button>
              <button
                className={`view-btn ${viewType === "list" ? "active" : ""}`}
                onClick={() => setViewType("list")}
                title="Vista en lista"
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando productos...</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div
                className={`product-grid ${
                  viewType === "list" ? "product-list" : ""
                }`}
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    viewType={viewType}
                  />
                ))}
              </div>

              {totalPaginas > 1 && (
                <div className="pagination-container">
                  <button
                    disabled={paginaActual === 1}
                    onClick={() =>
                      setPaginaActual((prev) => Math.max(1, prev - 1))
                    }
                    className="pagination-btn"
                  >
                    ← Anterior
                  </button>

                  <div className="pagination-numbers">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
                      (num) => (
                        <button
                          key={num}
                          className={`pagination-num ${
                            paginaActual === num ? "active" : ""
                          }`}
                          onClick={() => setPaginaActual(num)}
                        >
                          {num}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    disabled={paginaActual === totalPaginas}
                    onClick={() =>
                      setPaginaActual((prev) =>
                        Math.min(totalPaginas, prev + 1)
                      )
                    }
                    className="pagination-btn"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-products">
              <p>😔 No se encontraron productos con esos filtros.</p>
              <button
                onClick={() => {
                  setBusqueda("");
                  setCategoriaSeleccionada("");
                }}
                className="btn btn-primary"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CatalogPage;
