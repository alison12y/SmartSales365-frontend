import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// Creamos una instancia de Axios para reutilizar
const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

// --- Función de LOGIN (la que ya tenías, ¡está perfecta!) ---
export async function loginAdmin(username, password) {
  try {
    const response = await apiClient.post(`/auth/token/`, {
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

// --- ¡NUEVA FUNCIÓN AÑADIDA! ---
// Función de REGISTRO (se conecta a tu UserRegistrationSerializer)
export async function registerUser(userData) {
  try {
    // userData incluye { username, email, password, password2, ci_nit, ... }
    const response = await apiClient.post(`/auth/register/`, userData);
    
    return {
        success: true,
        data: response.data 
    };

  } catch (error) {
     const errors = error.response?.data || { general: "Error de conexión al registrar." };
     return { success: false, errors: errors };
  }
}

// --- ¡NUEVA FUNCIÓN AÑADIDA! ---
// Función de LOGOUT
export function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
}