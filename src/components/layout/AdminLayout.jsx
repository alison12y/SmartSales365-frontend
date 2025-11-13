import React, { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { logout } from '../../api/auth';
import logo from '/logo1..png';
import "../../styles/AdminLayout.css";
import {
  FaTachometerAlt, FaBox, FaUsers, FaChartLine, FaRobot, FaFileAlt,
  FaCogs, FaLock, FaEnvelope, FaChevronDown, FaChevronUp, FaPowerOff,
  FaUserEdit, FaUserCog, FaBook, FaClipboardList, FaBell, FaDatabase, FaChartBar,
  FaBars, FaStore
} from "react-icons/fa";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // 👈 nuevo estado

  const handleMenuToggle = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    navigate("/login");
  };

  const date = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="dashboard-dark-wrapper">
        {/* Sidebar */}
        <aside className={`sidebar-dark ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <img src={logo} alt="SmartSales365" className="sidebar-logo" />
            <h3 className="sidebar-title">SmartSales365</h3>
          </div>

          <nav className="menu">
            <ul>
              <li>
                <NavLink to="/dashboard" end>
                  <FaTachometerAlt /> Panel Principal
                </NavLink>
              </li>

              {/* Usuarios */}
              <li onClick={() => handleMenuToggle("usuarios")}>
                <span>
                  <FaUsers /> Usuarios y Roles
                  {openMenu === "usuarios" ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </li>
              {openMenu === "usuarios" && (
                <ul className="submenu">
                  <li><NavLink to="/dashboard/users"><FaUserEdit size={12} /> Gestionar Usuarios</NavLink></li>
                  <li><NavLink to="/dashboard/roles"><FaUserCog size={12} /> Roles y Permisos</NavLink></li>
                </ul>
              )}
              {/* Seguridad */}
              <li onClick={() => handleMenuToggle("seguridad")}>
                <span>
                  <FaLock /> Seguridad
                  {openMenu === "seguridad" ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </li>
              {openMenu === "seguridad" && (
                <ul className="submenu">
                  <li><NavLink to="/dashboard/security/audit"><FaBook size={12} /> Bitácora</NavLink></li>
                </ul>
              )}

              {/* Gestión Comercial */}
              <li onClick={() => handleMenuToggle("comercial")}>
                <span>
                  <FaBox /> Gestión Comercial
                  {openMenu === "comercial" ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </li>
              {openMenu === "comercial" && (
                <ul className="submenu">
                  <li><NavLink to="/dashboard/products"><FaClipboardList size={12} /> Productos</NavLink></li>
                  <li>
                    <a href="/dashboard/shop" target="_blank" rel="noopener noreferrer">
                      <FaStore size={12} /> Ver Tienda (Catálogo)
                    </a>
                  </li>
                  <li><NavLink to="/dashboard/customers"><FaUsers size={12} /> Clientes</NavLink></li>
                  <li><NavLink to="/dashboard/sales"><FaChartLine size={12} /> Ventas</NavLink></li>
                </ul>
              )}

              {/* Reportes */}
              <li onClick={() => handleMenuToggle("reportes")}>
                <span>
                  <FaFileAlt /> Reportes y Analítica
                  {openMenu === "reportes" ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </li>
              {openMenu === "reportes" && (
                <ul className="submenu">
                  <li><NavLink to="/dashboard/reports/financial"><FaChartBar size={12} /> Reportes Financieros</NavLink></li>
                  <li><NavLink to="/dashboard/reports/dynamic"><FaDatabase size={12} /> Reportes Dinámicos</NavLink></li>
                </ul>
              )}

              {/* IA */}
              <li onClick={() => handleMenuToggle("ia")}>
                <span>
                  <FaRobot /> Inteligencia Artificial
                  {openMenu === "ia" ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </li>
              {openMenu === "ia" && (
                <ul className="submenu">
                  <li><NavLink to="/dashboard/ia/predictions"><FaChartLine size={12} /> Predicción de Ventas</NavLink></li>
                  <li><NavLink to="/dashboard/ia/training"><FaCogs size={12} /> Entrenamiento IA</NavLink></li>
                </ul>
              )}





              {/* Comunicación */}
              <li onClick={() => handleMenuToggle("comunicacion")}>
                <span>
                  <FaEnvelope /> Comunicación
                  {openMenu === "comunicacion" ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </li>
              {openMenu === "comunicacion" && (
                <ul className="submenu">
                  <li><NavLink to="/dashboard/communication/notices"><FaBell size={12} /> Avisos</NavLink></li>
                  <li><NavLink to="/dashboard/communication/reminders"><FaEnvelope size={12} /> Recordatorios</NavLink></li>
                </ul>
              )}

              {/* Logout */}
              <li className="logout" onClick={handleLogout}>
                <span><FaPowerOff /> Cerrar Sesión</span>
              </li>
            </ul>
          </nav>
        </aside>

        <div className="main-content-wrapper-dark">
          {/* Header */}
          <header className="navbar-dark">
            {/* Botón hamburguesa móvil */}
            <button className="menu-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FaBars />
            </button>

            <h1>Panel de Administración</h1>
            <div className="navbar-info">
              <span>{date}</span>
              <button onClick={handleLogout} className="logout-btn-dark">
                <FaPowerOff /> Cerrar Sesión
              </button>
            </div>
          </header>

          {/* Contenido */}
          <main className="main-content-dark">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Modal de Logout */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>¿Seguro que deseas cerrar sesión?</h3>
            <div className="logout-actions">
              <button onClick={confirmLogout} className="btn-accept">Aceptar</button>
              <button onClick={() => setShowLogoutModal(false)} className="btn-cancel">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}