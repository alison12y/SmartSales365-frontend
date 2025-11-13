// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";

// Páginas públicas
import Login from "../pages/Login";
import RegisterPage from "../pages/RegisterPage";

// Layout principal
import AdminLayout from "../components/layout/AdminLayout";

// Páginas privadas
import Dashboard from "../pages/Dashboard";
import UserListPage from "../pages/admin/UserListPage";
import RoleListPage from "../pages/admin/RoleListPage";
import BitacoraListPage from "../pages/admin/BitacoraListPage";
import DetalleBitacoraPage from "../pages/admin/DetalleBitacoraPage";
import ProductoListPage from "../pages/Produc/ProductoListPage";
import ClienteListPage from "../pages/admin/ClienteListPage";
import PromotionManagementPage from "../pages/admin/PromotionManagementPage";
import CatalogPage from "../pages/CatalogPage";
import CartPage from "../pages/CartPage";
import PromotionPage from "../pages/PromotionPage";
import NotificationListPage from "../pages/admin/NotificationListPage";
import ReminderListPage from "../pages/admin/ReminderListPage";
import RecommendedPage from "../pages/RecommendedPage";


// PrivateRoute para proteger rutas privadas
function PrivateRoute({ children }) {
  const hasToken = !!localStorage.getItem("access");
  return hasToken ? children : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas privadas con layout */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        {/* Rutas hijas */}
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserListPage />} />
        <Route path="roles" element={<RoleListPage />} />
        <Route path="security/audit" element={<BitacoraListPage />} />
        <Route path="security/audit/:id" element={<DetalleBitacoraPage />} />
        <Route path="products" element={<ProductoListPage />} />
        <Route path="promotions" element={<PromotionManagementPage />} />
        <Route path="customers" element={<ClienteListPage />} />
  <Route path="communication/notices" element={<NotificationListPage />} />
  <Route path="communication/reminders" element={<ReminderListPage />} />

        <Route path="shop" element={<CatalogPage />} /> {/* Catálogo */}
        <Route path="shop/recommended" element={<RecommendedPage />} />
        <Route path="cart" element={<CartPage />} />     {/* Carrito */}
      </Route>


      {/* Rutas públicas de promociones */}
      <Route path="promotions-view" element={<PromotionPage />} />

      {/* Rutas no encontradas */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
