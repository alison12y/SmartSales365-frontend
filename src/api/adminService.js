import axios from "axios";
// 1. Importamos la función de logout
import { logout } from "./auth"; 

// 2. ¡AQUÍ ESTÁ LA CORRECCIÓN!
// La URL base debe ser la raíz de la API, igual que en auth.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// 3. Exportamos 'adminApi' para que 'clientes.js' pueda importarlo.
export const adminApi = axios.create({
  baseURL: API_BASE_URL,
});

// --- 4. Interceptor de PETICIÓN (Request) ---
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- 5. Interceptor de RESPUESTA (Response) ---
// (Lógica de auto-refresco de token)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

adminApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return adminApi(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem("refresh");
      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }
      try {
        // Usamos axios.post simple para evitar bucles.
        // La URL ahora se construye correctamente: http://127.0.0.1:8000/api/auth/refresh/
        const rs = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken
        });
        const newAccessToken = rs.data.access;
        localStorage.setItem("access", newAccessToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        processQueue(null, newAccessToken);
        return adminApi(originalRequest);
      } catch (_error) {
        processQueue(_error, null);
        logout(); 
        return Promise.reject(_error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);


// --- 6. Funciones de la API exportadas ---
export const getUsers = (params) => adminApi.get("/auth/users/", { params });
export const getUserById = (id) => adminApi.get(`/auth/users/${id}/`);
export const createUser = (userData) => adminApi.post("/auth/users/", userData);
export const updateUser = (id, userData) => adminApi.put(`/auth/users/${id}/`, userData);
export const deleteUser = (id) => adminApi.delete(`/auth/users/${id}/`);

export const getRoles = (params) => adminApi.get("/auth/roles/", { params });
export const createRole = (roleData) => adminApi.post("/auth/roles/", roleData);
export const updateRole = (id, roleData) => adminApi.put(`/auth/roles/${id}/`, roleData);
export const deleteRole = (id) => adminApi.delete(`/auth/roles/${id}/`);
export const getAllPermissions = () => adminApi.get("/auth/roles/all_permissions/");

export const getBitacoras = (params) => adminApi.get("/security/bitacoras/", { params });
export const getBitacoraDetalles = (params) => adminApi.get("/security/detalles/", { params });
// Obtener una bitácora (sesión) por ID
export const getBitacoraById = (id) => adminApi.get(`/security/bitacoras/${id}/`);