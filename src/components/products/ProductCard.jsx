import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getPromocionesDeProducto } from '../../api/promotionService';
import '../../styles/ProductCard.css';

function ProductCard({ product, onAddToCart, viewType = "grid" }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [promocion, setPromocion] = useState(null);

    // === Cargar promoción del producto ===
    useEffect(() => {
        const cargarPromocion = async () => {
            try {
                const res = await getPromocionesDeProducto(product.id);
                if (res?.data?.results?.length > 0) {
                    // Tomar la primera promoción (la más reciente o importante)
                    const pp = res.data.results[0];
                    // Transformar estructura para acceso consistente
                    setPromocion({
                        titulo: pp.promocion_titulo,
                        descuento_porcentaje: pp.descuento_porcentaje,
                        descuento_fijo: pp.descuento_fijo,
                    });
                }
            } catch (error) {
                // Silenciar errores si no hay promociones
                setPromocion(null);
            }
        };
        cargarPromocion();
    }, [product.id]);

    // --- Precios y descuentos ---
    const calcularPrecioConDescuento = () => {
        let precioFinal = product.precio;

        // Primero aplicar descuento directo del producto
        if (product.descuento > 0) {
            precioFinal = product.precio * (1 - product.descuento / 100);
        }

        // Luego aplicar promoción (si existe)
        if (promocion?.descuento_porcentaje) {
            precioFinal = precioFinal * (1 - promocion.descuento_porcentaje / 100);
        } else if (promocion?.descuento_fijo) {
            precioFinal = Math.max(0, precioFinal - promocion.descuento_fijo);
        }

        return precioFinal;
    };

    const discount = product.descuento || 0;
    const precioConPromocion = calcularPrecioConDescuento();
    const descuentoTotal = ((product.precio - precioConPromocion) / product.precio * 100).toFixed(0);
    const originalPrice = precioConPromocion !== product.precio ? product.precio : null;

    const formattedPrice = new Intl.NumberFormat('es-BO', {
        style: 'currency',
        currency: 'BOB',
        minimumFractionDigits: 2
    }).format(precioConPromocion);

    // --- Stock ---
    const isOutOfStock = product.stock <= 0;
    const isLowStock = product.stock > 0 && product.stock < 5;

    // --- Render list view ---
    if (viewType === "list") {
        return (
            <div className="product-card-list">
                <div className="product-list-image">
                    <img src={product.imagen_url} alt={product.nombre} />
                    {discount > 0 && <div className="discount-badge">{discount}% OFF</div>}
                </div>

                <div className="product-list-info">
                    <span className="product-category">{product.categoria_nombre || "Sin Categoría"}</span>
                    <h3 className="product-list-title">{product.nombre}</h3>
                    <p className="product-list-desc">{product.descripcion?.substring(0, 100)}...</p>

                    {/* Garantías */}
                    {product.garantias?.length > 0 && (
                        <ul className="product-garantias">
                            {product.garantias.map((g) => (
                                <li key={g.id}>{g.tipo_garantia} ({g.duracion_meses} meses)</li>
                            ))}
                        </ul>
                    )}

                    <div className="product-list-footer">
                        <div className="price-section">
                            {originalPrice && <span className="original-price">Bs. {originalPrice}</span>}
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

    // --- Render grid view ---
    return (
        <div
            className="product-card"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="product-card-image-container">
                <img src={product.imagen_url} alt={product.nombre} className="product-card-image" />

                {/* Badge de descuento */}
                {descuentoTotal > 0 && (
                    <div className="discount-badge">
                        {Math.round(descuentoTotal)}% OFF
                    </div>
                )}

                {/* Badge de promoción */}
                {promocion && (
                    <div
                        className="promotion-badge"
                        title={promocion.titulo}
                    >
                        🎯 {promocion.titulo.substring(0, 12)}
                    </div>
                )}

                {isOutOfStock ? (
                    <span className="stock-badge out-of-stock">Agotado</span>
                ) : isLowStock ? (
                    <span className="stock-badge low-stock">⚠️ Stock Limitado</span>
                ) : (
                    <span className="stock-badge in-stock">✓ En Stock</span>
                )}

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
                <p className="product-card-description">{product.descripcion?.substring(0, 60)}...</p>

                {/* Garantías */}
                {product.garantias?.length > 0 && (
                    <ul className="product-garantias">
                        {product.garantias.map((g) => (
                            <li key={g.id}>{g.tipo_garantia} ({g.duracion_meses} meses)</li>
                        ))}
                    </ul>
                )}

                {/* Rating */}
                {product.rating && (
                    <div className="product-rating">
                        <span className="stars">⭐ {product.rating}/5</span>
                        <span className="reviews">({product.reviews_count || 0})</span>
                    </div>
                )}

                <div className="product-card-footer">
                    <div className="price-section">
                        {originalPrice && <span className="original-price">Bs. {originalPrice}</span>}
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
