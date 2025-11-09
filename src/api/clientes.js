import axios from "axios";

const API_URL = "http://localhost:8000/api/customers/";

// === LEE EL TOKEN JWT DEL LOCALSTORAGE ===
const getAuthHeaders = () => {
  const token = localStorage.getItem("access") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// === CRUD DE CLIENTES ===

// Listar clientes
export const getClientes = (params = {}) =>
  axios.get(API_URL, {
    params,
    headers: getAuthHeaders(),
  });

// Crear cliente
export const createCliente = (data) =>
  axios.post(API_URL, data, {
    headers: getAuthHeaders(),
  });

// Actualizar cliente
export const updateCliente = (id, data) =>
  axios.put(`${API_URL}${id}/`, data, {
    headers: getAuthHeaders(),
  });

// Eliminar cliente
export const deleteCliente = (id) =>
  axios.delete(`${API_URL}${id}/`, {
    headers: getAuthHeaders(),
  });