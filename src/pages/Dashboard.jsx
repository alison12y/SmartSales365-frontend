import React from 'react';
import "../styles/AdminLayout.css";
import {
  FaChartLine,
  FaUsers,
  FaBox,
  FaFileAlt,
} from "react-icons/fa";

function Dashboard() {

  return (
    <>
      <section className="cards-section-dark">
        <div className="card-dark">
          <FaChartLine className="card-icon" />
          <h3>Total Ventas</h3>
          <p>120</p>
          <span>+12% vs anterior</span>
        </div>

        <div className="card-dark">
          <FaUsers className="card-icon" />
          <h3>Clientes Activos</h3>
          <p>45</p>
          <span>+5% este mes</span>
        </div>

        <div className="card-dark">
          <FaBox className="card-icon" />
          <h3>Productos</h3>
          <p>32</p>
          <span>Inventario actualizado</span>
        </div>

        <div className="card-dark">
          <FaFileAlt className="card-icon" />
          <h3>Ingresos Mensuales</h3>
          <p>Bs. 45,230</p>
          <span>+8% respecto al mes anterior</span>
        </div>
      </section>

      <section className="activity-dark">
        <h2>Actividad Reciente</h2>
        <div className="activity-card-dark">
          <ul>
            <li> Nueva venta registrada (ID #1052)</li>
            <li> Cliente “Juan Pérez” añadido</li>
            <li> Producto “Café Orgánico” actualizado</li>
          </ul>
        </div>
      </section>
    </>
  );
}

export default Dashboard;