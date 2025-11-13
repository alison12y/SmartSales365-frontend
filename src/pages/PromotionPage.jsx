// src/pages/PromotionPage.jsx
import React, { useEffect, useState } from "react";
import { getPromocionesActivas } from "../api/promotionService";

function PromotionPage() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        setLoading(true);
        const res = await getPromocionesActivas();
        setPromos(res.data);
      } catch (err) {
        console.error("Error cargando promociones:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPromos();
  }, []);

  if (loading) return <p>Cargando promociones...</p>;
  if (promos.length === 0) return <p>No hay promociones activas.</p>;

  return (
    <div className="promotion-page">
      <h1>Promociones activas</h1>
      <ul>
        {promos.map((p) => (
          <li key={p.id}>
            <strong>{p.titulo}</strong> - {p.descuento_porcentaje}% de descuento
            <p>{p.descripcion}</p>
            <small>
              Válido: {new Date(p.fecha_inicio).toLocaleDateString()} hasta{" "}
              {new Date(p.fecha_fin).toLocaleDateString()}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PromotionPage;
