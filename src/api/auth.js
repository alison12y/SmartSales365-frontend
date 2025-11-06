/* export async function loginAdmin(email, password) {
  // Simulación temporal de login
  if (email === "admin@smartsales.com" && password === "12345") {
    return { success: true, token: "fake-jwt-token" };
  } else {
    return { success: false, message: "Credenciales incorrectas" };
  }

  // 🔹 Cuando tengas backend Django REST, usarás:
  /*
  import axios from "axios";
  const response = await axios.post("http://localhost:8000/api/login/", {
    email,
    password,
  });
  return response.data;
  */
//} 

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function loginAdmin(username, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/token/`, {
      username,
      password,
    });

    // Guarda el token en localStorage (opcional)
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