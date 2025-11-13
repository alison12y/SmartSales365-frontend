import { adminApi } from './adminService'; // Importamos la instancia 'mágica' de Axios

/**
 * Obtiene la lista de clientes (paginada y con búsqueda).
 * El backend (Django) hace el filtrado y la paginación.
 * @param {object} params - Opciones como { page: 1, search: 'juan' }
 */
export const getClientes = (params) => {
  // Esta es la URL que creamos en apps/customers/urls.py
  return adminApi.get('/customers/clientes/', { params }); 
};

/**
 * Obtiene TODOS los clientes (para los reportes).
 */
export const getAllClientes = () => {
  return adminApi.get('/customers/clientes/', { params: { page_size: 1000 } }); 
};

/**
 * Actualiza un perfil de cliente (para "rellenar los datos").
 * @param {number} id - ID del cliente
 * @param {object} data - Datos del formulario (ci_nit, telefono, etc.)
 */
export const updateCliente = (id, data) => {
  return adminApi.put(`/customers/clientes/${id}/`, data);
};

/**
 * Elimina un perfil de cliente.
 * @param {number} id - ID del cliente
 */
export const deleteCliente = (id) => {
  return adminApi.delete(`/customers/clientes/${id}/`);
};