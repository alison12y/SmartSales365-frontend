import React, { useState } from 'react';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../styles/ProductCard.css';

function ProductCard({ product, onAddToCart, viewType = "grid" }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formattedPrice = new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2
  }).format(product.precio);

  const discount = product.descuento || 0;
  const originalPrice = discount > 0 
    ? (product.precio / (1 - discount / 100)).toFixed(2)
    : null;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock < 5;

  if (viewType === "list") {
    return (
      <div className="product-card-list">
        <div className="product-list-image">
          <img src={product.imagen_url} alt={product.nombre} />
          {discount > 0 && (
            <div className="discount-badge">{discount}% OFF</div>
          )}
        </div>
        <div className="product-list-info">
          <span className="product-category">{product.categoria_nombre || "Sin Categoría"}</span>
          <h3 className="product-list-title">{product.nombre}</h3>
          <p className="product-list-desc">{product.descripcion?.substring(0, 100)}...</p>
          <div className="product-list-footer">
            <div className="price-section">
              {originalPrice && (
                <span className="original-price">Bs. {originalPrice}</span>
              )}
              <span className="current-price">{formattedPrice}</span>
            </div>
            <div className="actions">
              <button
                className={`btn-favorite ${isFavorite ? "active" : ""}`}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
              </button>
              <Link to={`/product/${product.id}`} className="btn-view">
                <Eye size={18} /> Ver detalles
              </Link>
              <button
                className="btn-cart"
                onClick={() => onAddToCart(product.id, 1)}
                disabled={isOutOfStock}
              >
                <ShoppingCart size={18} /> Añadir
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-card-image-container">
        <img src={product.imagen_url} alt={product.nombre} className="product-card-image" />

        {/* Badges */}
        {discount > 0 && (
          <div className="discount-badge">{Math.round(discount)}% OFF</div>
        )}

        {isOutOfStock ? (
          <span className="stock-badge out-of-stock">Agotado</span>
        ) : isLowStock ? (
          <span className="stock-badge low-stock">⚠️ Stock Limitado</span>
        ) : (
          <span className="stock-badge in-stock">✓ En Stock</span>
        )}

        {/* Overlay con acciones */}
        {isHovered && (
          <div className="product-overlay">
            <Link to={`/product/${product.id}`} className="overlay-btn view-btn">
              <Eye size={20} /> Ver detalles
            </Link>
            <button
              className="overlay-btn favorite-btn"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
              {isFavorite ? "Añadido" : "Favorito"}
            </button>
          </div>
        )}
      </div>

      <div className="product-card-content">
        <span className="product-card-category">{product.categoria_nombre || "Sin Categoría"}</span>
        <h3 className="product-card-title">{product.nombre}</h3>
        <p className="product-card-description">
          {product.descripcion?.substring(0, 60)}...
        </p>

        {/* Rating (si existe) */}
        {product.rating && (
          <div className="product-rating">
            <span className="stars">⭐ {product.rating}/5</span>
            <span className="reviews">({product.reviews_count || 0})</span>
          </div>
        )}

        <div className="product-card-footer">
          <div className="price-section">
            {originalPrice && (
              <span className="original-price">Bs. {originalPrice}</span>
            )}
            <span className="product-card-price">{formattedPrice}</span>
          </div>
          <button
            className="product-card-button"
            onClick={() => onAddToCart(product.id, 1)}
            disabled={isOutOfStock}
            title={isOutOfStock ? "Producto agotado" : "Añadir al carrito"}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;