import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import logo from "../../public/logo1..png";

import {
  FaTachometerAlt,
  FaBox,
  FaUsers,
  FaChartLine,
  FaRobot,
  FaFileAlt,
  FaCogs,
  FaLock,
  FaEnvelope,
  FaChevronDown,
  FaChevronUp,
  FaPowerOff,
  FaUserEdit,
  FaUserCog,
  FaBook,
  FaClipboardList,
  FaBell,
  FaDatabase,
  FaChartBar,
} from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleMenuToggle = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  const date = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="dashboard-dark-wrapper">
      {/* Sidebar */}
      <aside className="sidebar-dark">
        <div className="sidebar-header">
          <img src={logo} alt="SmartSales365" className="sidebar-logo" />
          <h3 className="sidebar-title">SmartSales365</h3>
        </div>

        <nav className="menu">
          <ul>
            <li>
              <FaTachometerAlt /> Panel Principal
            </li>

            {/* Gestión Comercial */}
            <li onClick={() => handleMenuToggle("comercial")}>
              <FaBox /> Gestión Comercial
              {openMenu === "comercial" ? <FaChevronUp /> : <FaChevronDown />}
            </li>
            {openMenu === "comercial" && (
              <ul className="submenu">
                <li><FaClipboardList size={12} /> Productos</li>
                <li><FaUsers size={12} /> Clientes</li>
                <li><FaChartLine size={12} /> Ventas</li>
              </ul>
            )}

            {/* Reportes */}
            <li onClick={() => handleMenuToggle("reportes")}>
              <FaFileAlt /> Reportes y Analítica
              {openMenu === "reportes" ? <FaChevronUp /> : <FaChevronDown />}
            </li>
            {openMenu === "reportes" && (
              <ul className="submenu">
                <li><FaChartBar size={12} /> Reportes Financieros</li>
                <li><FaDatabase size={12} /> Reportes Dinámicos</li>
              </ul>
            )}

            {/* Inteligencia Artificial */}
            <li onClick={() => handleMenuToggle("ia")}>
              <FaRobot /> Inteligencia Artificial
              {openMenu === "ia" ? <FaChevronUp /> : <FaChevronDown />}
            </li>
            {openMenu === "ia" && (
              <ul className="submenu">
                <li><FaChartLine size={12} /> Predicción de Ventas</li>
                <li><FaCogs size={12} /> Entrenamiento IA</li>
                <li><FaDatabase size={12} /> Dashboard IA</li>
              </ul>
            )}

            {/* Usuarios */}
            <li onClick={() => handleMenuToggle("usuarios")}>
              <FaUsers /> Usuarios y Roles
              {openMenu === "usuarios" ? <FaChevronUp /> : <FaChevronDown />}
            </li>
            {openMenu === "usuarios" && (
              <ul className="submenu">
                <li><FaUserEdit size={12} /> Gestionar Usuarios</li>
                <li><FaUserCog size={12} /> Roles y Permisos</li>
                <li><FaBook size={12} /> Gestionar Bitácora</li>
              </ul>
            )}

            {/* Seguridad */}
            <li onClick={() => handleMenuToggle("seguridad")}>
              <FaLock /> Seguridad
              {openMenu === "seguridad" ? <FaChevronUp /> : <FaChevronDown />}
            </li>
            {openMenu === "seguridad" && (
              <ul className="submenu">
                <li><FaBook size={12} /> Bitácora</li>
                <li><FaLock size={12} /> Seguridad Informática</li>
              </ul>
            )}

            {/* Comunicación */}
            <li onClick={() => handleMenuToggle("comunicacion")}>
              <FaEnvelope /> Comunicación
              {openMenu === "comunicacion" ? <FaChevronUp /> : <FaChevronDown />}
            </li>
            {openMenu === "comunicacion" && (
              <ul className="submenu">
                <li><FaBell size={12} /> Avisos</li>
                <li><FaEnvelope size={12} /> Recordatorios</li>
              </ul>
            )}

            {/* Logout */}
            <li className="logout" onClick={handleLogout}>
              <FaPowerOff /> Cerrar Sesión
            </li>
          </ul>
        </nav>
      </aside>

      {/* Contenido */}
      <main className="main-content-dark">
        <header className="navbar-dark">
          <h1>Panel de Administración</h1>
          <div className="navbar-info">
            <span>{date}</span>
            <button onClick={handleLogout} className="logout-btn-dark">
              <FaPowerOff /> Cerrar Sesión
            </button>
          </div>
        </header>

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
              <li>🛒 Nueva venta registrada (ID #1052)</li>
              <li>👤 Cliente “Juan Pérez” añadido</li>
              <li>📦 Producto “Café Orgánico” actualizado</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Modal de cierre de sesión */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>¿Seguro que deseas cerrar sesión?</h3>
            <div className="logout-actions">
              <button onClick={confirmLogout} className="btn-accept">
                Aceptar
              </button>
              <button onClick={() => setShowLogoutModal(false)} className="btn-cancel">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
