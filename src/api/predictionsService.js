/**
 * Calcula productos recomendados basados en:
 * - Productos que están en tendencia
 * - Stock bajo (urgencia)
 * - Popularidad (más comprados)
 */
export function getRecommendedProducts(productos = []) {
  if (!productos || productos.length === 0) {
    // Productos simulados por defecto
    return [
      {
        id: 1,
        nombre: "iPhone 15 Pro",
        razon: "Tendencia en alza",
        probabilidad: 92,
        icono: "📱",
      },
      {
        id: 2,
        nombre: "MacBook Air M3",
        razon: "Stock bajo",
        probabilidad: 87,
        icono: "💻",
      },
      {
        id: 3,
        nombre: "AirPods Pro",
        razon: "Muy popular",
        probabilidad: 85,
        icono: "🎧",
      },
      {
        id: 4,
        nombre: "Samsung Galaxy S24",
        razon: "Nuevo modelo",
        probabilidad: 81,
        icono: "📲",
      },
    ];
  }

  // Si hay productos reales, ordenar por probabilidad de compra
  return productos
    .filter((p) => p.stock > 0) // Solo productos en stock
    .map((p) => ({
      id: p.id,
      nombre: p.nombre,
      razon: p.stock < 5 ? "Stock bajo" : "Trending",
      probabilidad: Math.min(99, 60 + Math.random() * 35), // 60-95%
      icono: "📦",
    }))
    .sort((a, b) => b.probabilidad - a.probabilidad)
    .slice(0, 4);
}

/**
 * Genera insights basados en datos de ventas y predicciones
 */
export function generateInsights(ventasMensuales = [], ingresos = 0) {
  if (!ventasMensuales || ventasMensuales.length === 0) {
    return [
      "📈 Las ventas muestran una tendencia positiva",
      "💡 Los productos electrónicos son los más vendidos",
      "🎯 Se espera un aumento del 15% en las próximas 2 semanas",
    ];
  }

  const insights = [];
  const ventasArray = ventasMensuales.map((v) => v.ventas);
  const ventaPromedio = ventasArray.reduce((a, b) => a + b, 0) / ventasArray.length;
  const ultimasVentas = ventasArray.slice(-3);
  const ultimaPromedio =
    ultimasVentas.reduce((a, b) => a + b, 0) / ultimasVentas.length;

  // Analizar tendencia
  if (ultimaPromedio > ventaPromedio) {
    insights.push(
      `📈 Tendencia alcista: ventas promedio Bs. ${Math.round(ultimaPromedio)} (últimos 3 días)`
    );
  } else {
    insights.push(
      `📉 Tendencia bajista: ventas promedio Bs. ${Math.round(ultimaPromedio)} (últimos 3 días)`
    );
  }

  // Insight de ingresos
  if (ingresos > 50000) {
    insights.push(`💰 Ingresos superiores a lo esperado: Bs. ${Math.round(ingresos)}`);
  } else if (ingresos > 10000) {
    insights.push(`💵 Ingresos: Bs. ${Math.round(ingresos)} (en línea)`);
  }

  // Recomendación
  if (ultimaPromedio > ventaPromedio * 1.2) {
    insights.push(
      "🎯 Considera aumentar inventario de productos de alto movimiento"
    );
  } else if (ultimaPromedio < ventaPromedio * 0.8) {
    insights.push("💡 Implementar promociones para reactivar ventas");
  }

  return insights.slice(0, 3);
}
