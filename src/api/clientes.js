// src/api/clientes.js
import axios from "axios";

//  Usa la variable de entorno configurada en Vercel o local (.env)
const API_URL = `${import.meta.env.VITE_API_URL}/customers/`;

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