// src/api/catalogo.js
import axios from "axios";

const BASE_URL = "http://localhost:8000/api/catalog/";

// === AUTENTICACIÓN ===
const getAuthHeaders = () => {
  const token = localStorage.getItem("access") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// === PRODUCTOS ===
export const getProductos = (params = {}) =>
  axios.get(`${BASE_URL}productos/`, {
    params,
    headers: getAuthHeaders(),
  });

export const createProducto = (data) =>
  axios.post(`${BASE_URL}productos/`, data, {
    headers: getAuthHeaders(),
  });

export const updateProducto = (id, data) =>
  axios.put(`${BASE_URL}productos/${id}/`, data, {
    headers: getAuthHeaders(),
  });

export const deleteProducto = (id) =>
  axios.delete(`${BASE_URL}productos/${id}/`, {
    headers: getAuthHeaders(),
  });

// === GARANTÍAS ===
export const getGarantias = (params = {}) =>
  axios.get(`${BASE_URL}garantias/`, {
    params,
    headers: getAuthHeaders(),
  });

export const createGarantia = (data) =>
  axios.post(`${BASE_URL}garantias/`, data, {
    headers: getAuthHeaders(),
  });

export const updateGarantia = (id, data) =>
  axios.put(`${BASE_URL}garantias/${id}/`, data, {
    headers: getAuthHeaders(),
  });

export const deleteGarantia = (id) =>
  axios.delete(`${BASE_URL}garantias/${id}/`, {
    headers: getAuthHeaders(),
  });