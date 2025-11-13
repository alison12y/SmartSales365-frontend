// src/api/productos.js
import axios from "axios";

// 🧠 BASE URL (usa la variable de entorno configurada en Vite o Vercel)
const BASE_URL = `${import.meta.env.VITE_API_URL}/catalog/`;

// === AUTENTICACIÓN ===
const getAuthHeaders = () => {
  const token = localStorage.getItem("access") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// === MANEJO DE ERRORES ===
const handleError = (error) => {
  if (error.response) {
    console.error("Error del servidor:", error.response.data);
    throw new Error(
      error.response.data?.detail ||
        "Error al procesar la solicitud. Verifica los datos."
    );
  } else if (error.request) {
    console.error("Sin respuesta del servidor:", error.request);
    throw new Error("No se pudo conectar con el servidor.");
  } else {
    console.error("Error al configurar la solicitud:", error.message);
    throw new Error("Error inesperado. Intenta nuevamente.");
  }
};

// === PRODUCTOS ===

// ✅ Obtener lista de productos (usa autenticación)
export const getProductos = async (params = {}) => {
  try {
    return await axios.get(`${BASE_URL}productos/`, {
      params,
      headers: getAuthHeaders(),
    });
  } catch (error) {
    handleError(error);
  }
};

// ✅ Crear producto (con imagen)
export const createProducto = async (data) => {
  try {
    const headers = {
      ...getAuthHeaders(),
      // ⚠️ IMPORTANTE: axios maneja el boundary automáticamente
      // así que NO pongas el Content-Type manualmente si `data` es un FormData
      ...(data instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
    };

    return await axios.post(`${BASE_URL}productos/`, data, { headers });
  } catch (error) {
    handleError(error);
  }
};

// ✅ Actualizar producto (también soporta FormData)
export const updateProducto = async (id, data) => {
  try {
    const headers = {
      ...getAuthHeaders(),
      ...(data instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
    };

    // ⚡ PATCH en lugar de PUT: no borra campos si no se envían
    return await axios.patch(`${BASE_URL}productos/${id}/`, data, { headers });
  } catch (error) {
    handleError(error);
  }
};

// ✅ Eliminar producto
export const deleteProducto = async (id) => {
  try {
    return await axios.delete(`${BASE_URL}productos/${id}/`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    handleError(error);
  }
};

// === GARANTÍAS ===
export const getGarantias = async (params = {}) => {
  try {
    return await axios.get(`${BASE_URL}garantias/`, {
      params,
      headers: getAuthHeaders(),
    });
  } catch (error) {
    handleError(error);
  }
};

export const createGarantia = async (data) => {
  try {
    return await axios.post(`${BASE_URL}garantias/`, data, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    handleError(error);
  }
};

export const updateGarantia = async (id, data) => {
  try {
    return await axios.patch(`${BASE_URL}garantias/${id}/`, data, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    handleError(error);
  }
};

export const deleteGarantia = async (id) => {
  try {
    return await axios.delete(`${BASE_URL}garantias/${id}/`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    handleError(error);
  }
};
