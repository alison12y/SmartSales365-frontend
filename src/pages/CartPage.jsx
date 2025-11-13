// src/pages/CartPage.jsx
import React from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

function CartPage() {
  const { cartItems, removeFromCart, clearCart } = useCart();

  const total = cartItems.reduce((sum, item) => sum + item.precio * item.quantity, 0);

  return (
    <div>
      <h1>🛒 Carrito de Compras</h1>
      {cartItems.length === 0 ? (
        <p>Tu carrito está vacío. <Link to="/dashboard/shop">Ir al catálogo</Link></p>
      ) : (
        <>
          <ul>
            {cartItems.map((item) => (
              <li key={item.id}>
                {item.nombre} — Bs. {item.precio} x {item.quantity}
                <button onClick={() => removeFromCart(item.id)}>Eliminar</button>
              </li>
            ))}
          </ul>
          <p>Total: Bs. {total}</p>
          <button onClick={clearCart}>Vaciar carrito</button>
          <button>Pagar</button>
        </>
      )}
    </div>
  );
}

export default CartPage;
