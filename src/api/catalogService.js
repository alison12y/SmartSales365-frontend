// 1. ¡CAMBIO IMPORTANTE!
// Ya no importamos 'axios'. Importamos 'adminApi' que ya tiene el token.
import { adminApi } from './adminService';

/**
 * Obtiene la lista de productos (paginada y filtrada).
 * Esta función ahora usará el token del usuario logueado.
 * @param {object} params - Opciones como { page: 1, search: 'sony', categoria: 2 }
 */
export const getPublicProducts = (params) => {
  // 2. Usamos 'adminApi' en lugar de 'publicCatalogApi'
  return adminApi.get("/catalog/productos/", { params });
};

/**
 * Obtiene los detalles de un solo producto.
 * @param {number} id - ID del producto
 */
export const getPublicProductDetail = (id) => {
  // 3. Usamos 'adminApi'
  return adminApi.get(`/catalog/productos/${id}/`);
};

/**
 * Obtiene la lista de todas las categorías.
 */
export const getPublicCategories = () => {
  // 4. Usamos 'adminApi'
  return adminApi.get("/catalog/categorias/");
};