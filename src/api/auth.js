import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// Creamos una instancia de Axios para reutilizar
const publicApi = axios.create({
    baseURL: API_BASE_URL,
});

// --- Función de LOGIN (Tu código original, está perfecto) ---
export async function loginAdmin(username, password) {
  try {
    const response = await publicApi.post(`/auth/token/`, {
      username,
      password,
    });

    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);

    return {
      success: true,
      token: response.data.access,
    };
  } catch (error) {
    const message = error.response?.data?.detail || "Credenciales incorrectas o error de conexión";
    return { success: false, message };
  }
}

// --- Función de REGISTRO (Tu código original, está perfecto) ---
export async function registerUser(userData) {
  try {
    const response = await publicApi.post(`/auth/register/`, userData);
    
    return {
        success: true,
        data: response.data 
    };

  } catch (error) {
     const errors = error.response?.data || { general: "Error de conexión al registrar." };
     return { success: false, errors: errors };
  }
}

// --- Función de LOGOUT (¡MEJORADA!) ---
export function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    
    // MEJORA: Redirige al login.
    // Usamos window.location porque esta función se llama desde
    // fuera de un componente React (desde adminService.js).
    window.location.href = '/login'; 
}