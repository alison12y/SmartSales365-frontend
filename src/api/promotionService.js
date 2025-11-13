// src/api/promotionService.js
import axios from "axios";

// Nota: El backend tiene la ruta en /marketing/ o /sales/
// Prueba con /marketing/ primero
const BASE_URL = `${import.meta.env.VITE_API_URL}/marketing/`;

// === AUTENTICACIÓN ===
const getAuthHeaders = () => {
  const token = localStorage.getItem("access") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// === MANEJO DE ERRORES ===
const handleError = (error) => {
  if (error.response) {
    // Error del servidor (4xx, 5xx)
    const errorData = error.response.data;
    const errorMessage = 
      errorData?.detail || 
      errorData?.error ||
      errorData?.non_field_errors?.[0] ||
      JSON.stringify(errorData) ||
      `Error ${error.response.status}: ${error.response.statusText}`;
    console.error("Error del servidor:", errorData);
    throw new Error(errorMessage);
  } else if (error.request) {
    // Error de red
    console.error("Error de red:", error.request);
    throw new Error("No se pudo conectar con el servidor");
  } else {
    // Error desconocido
    console.error("Error desconocido:", error.message);
    throw new Error(error.message || "Error desconocido");
  }
};

// === PROMOCIONES ===

// GET - Obtener todas las promociones
export const getPromociones = async (params = {}) => {
  try {
    return await axios.get(`${BASE_URL}promociones/`, {
      params,
      headers: getAuthHeaders(),
    });
  } catch (error) {
    handleError(error);
  }
};

// GET - Obtener promociones activas
export const getPromocionesActivas = async () => {
  try {
    return await axios.get(`${BASE_URL}promociones/activas/`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    handleError(error);
  }
};

// GET - Obtener relación producto-promoción
export const getProductoPromociones = async (params = {}) => {
  try {
    return await axios.get(`${BASE_URL}producto-promocion/`, {
      params,
      headers: getAuthHeaders(),
    });
  } catch (error) {
    handleError(error);
  }
};

// POST - Crear promoción
export const createPromocion = async (data) => {
  try {
    return await axios.post(`${BASE_URL}promociones/`, data, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    handleError(error);
  }
};

// PATCH - Actualizar promoción
export const updatePromocion = async (id, data) => {
  try {
    return await axios.patch(`${BASE_URL}promociones/${id}/`, data, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    handleError(error);
  }
};

// DELETE - Eliminar promoción
export const deletePromocion = async (id) => {
  try {
    return await axios.delete(`${BASE_URL}promociones/${id}/`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    handleError(error);
  }
};

// POST - Asignar promoción a producto
export const assignPromocionToProducto = async (data) => {
  try {
    return await axios.post(`${BASE_URL}producto-promocion/`, data, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    handleError(error);
  }
};

// DELETE - Remover promoción de producto
export const removePromocionFromProducto = async (id) => {
  try {
    return await axios.delete(`${BASE_URL}producto-promocion/${id}/`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    handleError(error);
  }
};

// GET - Obtener promociones de un producto específico
export const getPromocionesDeProducto = async (productoId) => {
  try {
    return await axios.get(`${BASE_URL}producto-promocion/?producto=${productoId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    handleError(error);
  }
};

// GET - Obtener todos los producto-promocion
export const getAllProductoPromociones = async (params = {}) => {
  try {
    return await axios.get(`${BASE_URL}producto-promocion/`, {
      params,
      headers: getAuthHeaders(),
    });
  } catch (error) {
    handleError(error);
  }
};
