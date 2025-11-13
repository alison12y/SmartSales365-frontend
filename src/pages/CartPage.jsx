// src/pages/CartPage.jsx
import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { createInvoice } from "../api/salesService";

function CartPage() {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invoiceResult, setInvoiceResult] = useState(null);
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + item.precio * item.quantity, 0);

  async function handlePay() {
    if (cartItems.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      // Construir payload básico. Ajusta campos según tu backend.
      const payload = {
        items: cartItems.map(ci => ({ product: ci.id, quantity: ci.quantity, precio: ci.precio })),
        total,
      };
      const res = await createInvoice(payload);
      setInvoiceResult(res);
      // Limpiar carrito y navegar a página de orden/factura si backend devuelve id
      clearCart();
      if (res && res.id) {
        // Si el backend ofrece una vista pública o detalle, navega ahí
        navigate(`/dashboard/orders/${res.id}`);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error procesando pago');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cart-page page">
      <h1>🛒 Carrito de Compras</h1>
      {cartItems.length === 0 ? (
        <p>Tu carrito está vacío. <Link to="/dashboard/shop">Ir al catálogo</Link></p>
      ) : (
        <>
          <ul className="cart-list">
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <strong>{item.nombre}</strong>
                  <div>Bs. {item.precio} x {item.quantity}</div>
                </div>
                <div className="cart-item-actions">
                  <button onClick={() => removeFromCart(item.id)}>Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
          <p className="cart-total">Total: Bs. {total}</p>
          <div className="cart-actions">
            <button onClick={clearCart} disabled={loading}>Vaciar carrito</button>
            <button onClick={handlePay} disabled={loading}>{loading ? 'Procesando...' : 'Pagar'}</button>
          </div>
          {error && <p className="error">{error}</p>}
          {invoiceResult && (
            <div className="invoice-result">
              <h3>Factura creada</h3>
              <pre>{JSON.stringify(invoiceResult, null, 2)}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CartPage;
