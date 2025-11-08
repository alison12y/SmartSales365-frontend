import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard"; 
import RegisterPage from "../pages/RegisterPage";
import AdminLayout from "../components/layout/AdminLayout"; // <-- 1. Importar el Esqueleto

// Importar las páginas de Admin
import UserListPage from "../pages/admin/UserListPage";
import RoleListPage from "../pages/admin/RoleListPage";

// Tu PrivateRoute (¡está perfecta!)
function PrivateRoute({ children }) {
  const hasToken = !!localStorage.getItem("access");
  return hasToken ? children : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Rutas públicas (no usan el esqueleto) */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* --- ¡AQUÍ ESTÁ LA CORRECCIÓN! --- 
          Usamos AdminLayout como "padre" de todas las rutas /dashboard
      */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AdminLayout /> {/* <-- 2. Renderiza el Esqueleto */}
          </PrivateRoute>
        }
      >
        {/* 3. Estas rutas "hijas" se renderizan en el <Outlet /> */}
        <Route index element={<Dashboard />} /> {/* /dashboard */}
        <Route path="users" element={<UserListPage />} /> {/* /dashboard/users */}
        <Route path="roles" element={<RoleListPage />} /> {/* /dashboard/roles */}
        {/* ...aquí puedes añadir "products", "reports", etc. */}
      </Route>
      
      {/* Comodín */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}