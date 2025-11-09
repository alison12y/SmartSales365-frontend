import axios from "axios";

const API_URL = "http://localhost:8000/api/catalog/productos/";

//  Esta función lee el token guardado en el localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("access") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// === PETICIONES CON AUTENTICACIÓN ===

// Listar productos
export const getProductos = (params = {}) =>
  axios.get(API_URL, {
    params,
    headers: getAuthHeaders(),
  });

// Crear producto
export const createProducto = (data) =>
  axios.post(API_URL, data, {
    headers: getAuthHeaders(),
  });

// Actualizar producto
export const updateProducto = (id, data) =>
  axios.put(`${API_URL}${id}/`, data, {
    headers: getAuthHeaders(),
  });

// Eliminar producto
export const deleteProducto = (id) =>
  axios.delete(`${API_URL}${id}/`, {
    headers: getAuthHeaders(),
  });