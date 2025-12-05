import React, { useState, useEffect } from "react";
import "../styles/AdminLayout.css";
import { FaChartLine, FaUsers, FaBox, FaFileAlt } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getSalesStats, getClientsStats, getProductsDistribution, getTotalIncome, getRecentActivity } from "../api/dashboardService";
import { getRecommendedProducts, generateInsights } from "../api/predictionsService";

function Dashboard() {
  // Estados
  const [ventasMensuales, setVentasMensuales] = useState([]);
  const [clientes, setClientes] = useState({ total: 0, detalle: [] });
  const [productos, setProductos] = useState({ total: 0, distribucion: [] });
  const [ingresos, setIngresos] = useState(0);
  const [actividad, setActividad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos del backend
  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true);
        const [salesData, clientsData, productsData, incomeData, activityData] = await Promise.all([
          getSalesStats(),
          getClientsStats(),
          getProductsDistribution(),
          getTotalIncome(),
          getRecentActivity(),
        ]);
        setVentasMensuales(salesData.ventasMensuales);
        setClientes(clientsData);
        setProductos(productsData);
        setIngresos(incomeData);
        setActividad(activityData);
        setError(null);
      } catch (err) {
        console.error('Error cargando dashboard:', err);
        setError(err.message || 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, []);

  // Datos simulados para gráfico (fallback si no hay datos)
  const ventasMensualesFallback = [
    { mes: "Oct 1", ventas: 1200 },
    { mes: "Oct 2", ventas: 900 },
    { mes: "Oct 3", ventas: 1500 },
    { mes: "Oct 4", ventas: 2000 },
    { mes: "Oct 5", ventas: 1800 },
    { mes: "Oct 6", ventas: 2200 },
    { mes: "Oct 7", ventas: 1700 },
    { mes: "Oct 8", ventas: 1900 },
    { mes: "Oct 9", ventas: 2100 },
    { mes: "Oct 10", ventas: 2300 },
    { mes: "Nov 1", ventas: 2500 },
    { mes: "Nov 2", ventas: 2700 },
    { mes: "Nov 3", ventas: 2600 },
    { mes: "Nov 4", ventas: 2400 },
    { mes: "Nov 5", ventas: 2800 },
    { mes: "Nov 6", ventas: 3000 },
    { mes: "Nov 7", ventas: 3200 },
    { mes: "Nov 8", ventas: 3100 },
    { mes: "Nov 9", ventas: 3300 },
    { mes: "Nov 10", ventas: 3400 },
  ];

  // Función para calcular predicciones (regresión lineal simple)
  function calcularPredicciones(datos, diasPrediccion = 7) {
    if (datos.length < 2) return [];
    
    // Extraer valores de ventas
    const y = datos.map(d => d.ventas);
    const n = y.length;
    
    // Calcular pendiente (m) e intersección (b) de y = mx + b
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += y[i];
      sumXY += i * y[i];
      sumX2 += i * i;
    }
    
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;
    
    // Generar predicciones para los próximos días
    const predicciones = [];
    const ultimaFecha = new Date(datos[datos.length - 1].mes || new Date());
    
    for (let i = 1; i <= diasPrediccion; i++) {
      const prediccionFecha = new Date(ultimaFecha);
      prediccionFecha.setDate(prediccionFecha.getDate() + i);
      const mesStr = prediccionFecha.toLocaleDateString('es-BO', { month: 'short', day: 'numeric' });
      const ventasPredichas = Math.max(0, Math.round(m * (n + i - 1) + b));
      predicciones.push({ mes: mesStr, ventas: ventasPredichas, prediccion: true });
    }
    
    return predicciones;
  }

  // Combinar datos reales con predicciones
  const ventasConPredicciones = ventasMensuales.length > 0 
    ? [...ventasMensuales, ...calcularPredicciones(ventasMensuales, 7)]
    : [...ventasMensualesFallback, ...calcularPredicciones(ventasMensualesFallback, 7)];

  // Separar datos reales y predicciones
  const datosReales = ventasConPredicciones.filter(d => !d.prediccion);
  const datosPredicciones = ventasConPredicciones.filter(d => d.prediccion);
  
  // Productos recomendados
  const productosRecomendados = getRecommendedProducts(productos.distribucion || []);
  
  // Insights
  const insights = generateInsights(ventasMensuales, ingresos);

  // Datos simulados para actividad (fallback)
  const actividadDefault = [
    "Nueva venta registrada (ID #1101)",
    "Cliente “Sofía López” añadido",
    "Producto “Té Verde” actualizado",
    "Nueva venta registrada (ID #1102)",
    "Cliente “Luis García” añadido",
    "Producto “Café Orgánico” actualizado",
    "Nueva venta registrada (ID #1103)",
    "Cliente “Ana Fernández” añadido",
    "Producto “Dulces Tradicionales” actualizado",
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="dashboard-container">
      {loading && <p style={{textAlign: 'center', padding: '20px'}}>Cargando datos...</p>}
      {error && <p style={{textAlign: 'center', padding: '20px', color: 'red'}}>Error: {error}</p>}
      {!loading && !error && (
        <>

      {/* Tarjetas */}
      <section className="cards-section-dark">
        <div className="card-dark">
          <FaChartLine className="card-icon" />
          <h3>Total Ventas</h3>
          <p>Bs. {(ventasMensuales.reduce((a, b) => a + b.ventas, 0)).toLocaleString()}</p>
          <span>+12% vs anterior</span>
        </div>

        <div className="card-dark">
          <FaUsers className="card-icon" />
          <h3>Clientes Activos</h3>
          <p>{clientes.total}</p>
          <span>+5% este mes</span>
        </div>

        <div className="card-dark">
          <FaBox className="card-icon" />
          <h3>Productos</h3>
          <p>{productos.total}</p>
          <span>Inventario actualizado</span>
        </div>

        <div className="card-dark">
          <FaFileAlt className="card-icon" />
          <h3>Ingresos Mensuales</h3>
          <p>Bs. {Math.round(ingresos).toLocaleString()}</p>
          <span>+8% respecto al mes anterior</span>
        </div>
      </section>

      {/* Gráfico de ventas */}
      <section className="charts-section-dark">
        <h2>Ventas Históricas y Predicciones</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={ventasConPredicciones}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Legend />
            {/* Línea azul para datos reales */}
            <Line 
              type="monotone" 
              dataKey={d => d.prediccion ? null : d.ventas}
              stroke="#8884d8" 
              activeDot={{ r: 8 }} 
              name="Ventas Reales (Bs.)" 
              strokeWidth={2}
              connectNulls={true}
            />
            {/* Línea naranja punteada para predicciones */}
            <Line 
              type="monotone" 
              dataKey={d => d.prediccion ? d.ventas : null}
              stroke="#FF7300" 
              strokeDasharray="5 5"
              name="Predicción (Bs.)" 
              strokeWidth={2}
              connectNulls={true}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* Pie chart de productos */}
      <section className="charts-section-dark">
        <h2>Distribución de Productos</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={productos.distribucion}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {productos.distribucion.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </section>

      {/* Productos Recomendados / Predicción de compra */}
      <section className="charts-section-dark">
        <h2>🎯 Productos Recomendados (Predicción de Compra)</h2>
        <div className="recommended-products" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {productosRecomendados.map((prod) => (
            <div key={prod.id} style={{
              backgroundColor: '#1e1e2e',
              border: '1px solid #444',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>{prod.icono}</div>
              <h4 style={{ margin: '8px 0', color: '#fff' }}>{prod.nombre}</h4>
              <p style={{ color: '#888', fontSize: '12px', margin: '4px 0' }}>{prod.razon}</p>
              <div style={{
                backgroundColor: '#FF7300',
                color: '#fff',
                padding: '8px',
                borderRadius: '4px',
                fontWeight: 'bold',
                marginTop: '8px',
              }}>
                {Math.round(prod.probabilidad)}% probabilidad
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Insights / Recomendaciones */}
      <section className="charts-section-dark">
        <h2>💡 Insights y Recomendaciones</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {insights.map((insight, index) => (
            <div key={index} style={{
              backgroundColor: '#1e1e2e',
              border: '1px solid #444',
              borderRadius: '8px',
              padding: '12px 16px',
              borderLeft: '4px solid #FF7300',
            }}>
              <p style={{ color: '#fff', margin: 0 }}>{insight}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Actividad reciente */}
      <section className="activity-dark">
        <h2>Actividad Reciente</h2>
        <div className="activity-card-dark">
          <ul>
            {(actividad.length > 0 ? actividad : actividadDefault).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;
