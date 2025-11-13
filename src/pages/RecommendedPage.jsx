import React, { useEffect, useState } from "react";
import { getRecommendedProductsForUser } from "../api/catalogService";
import ProductCard from "../components/products/ProductCard";
import { useCart } from "../context/CartContext";
import "../styles/CatalogPage.css"; // Reutilizamos estilos del catálogo

function RecommendedPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart } = useCart();

  useEffect(() => {
    const loadRecommended = async () => {
      try {
        setLoading(true);
        const res = await getRecommendedProductsForUser();
        setProducts(res.data || []);
      } catch (err) {
        console.error("Error al cargar productos recomendados:", err);
        setError("No se pudieron cargar los productos recomendados.");
      } finally {
        setLoading(false);
      }
    };

    loadRecommended();
  }, []);

  const handleAddToCart = (productId, quantity = 1) => {
    const product = products.find((p) => p.id === productId);
    if (product) addToCart(product, quantity);
  };

  return (
    <div className="catalog-page">
      <h1>🛍️ Productos Recomendados para ti</h1>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando productos...</p>
        </div>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => handleAddToCart(product.id)}
            />
          ))}
        </div>
      ) : (
        <p>No hay productos recomendados disponibles.</p>
      )}
    </div>
  );
}

export default RecommendedPage;
