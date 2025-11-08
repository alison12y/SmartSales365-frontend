import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// Creamos una instancia de Axios AUTENTICADA
const adminApi = axios.create({
    baseURL: API_BASE_URL,
});

// --- ¡INTERCEPTOR! ---
// Esto inyecta el token en CADA petición de 'adminApi'
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Manejar el error de la petición
    return Promise.reject(error);
  }
);

// --- Funciones para el CRUD de USUARIOS ---
export const getUsers = () => adminApi.get("/auth/users/");
export const getUserById = (id) => adminApi.get(`/auth/users/${id}/`);
export const createUser = (userData) => adminApi.post("/auth/users/", userData);
export const updateUser = (id, userData) => adminApi.put(`/auth/users/${id}/`, userData);
export const deleteUser = (id) => adminApi.delete(`/auth/users/${id}/`);

// --- Funciones para el CRUD de ROLES ---
export const getRoles = () => adminApi.get("/auth/roles/");
export const createRole = (roleData) => adminApi.post("/auth/roles/", roleData);
export const updateRole = (id, roleData) => adminApi.put(`/auth/roles/${id}/`, roleData);
export const deleteRole = (id) => adminApi.delete(`/auth/roles/${id}/`);

// Función para obtener la lista de todos los permisos
export const getAllPermissions = () => adminApi.get("/auth/roles/all_permissions/");