import { adminApi } from './adminService';

/**
 * Obtiene la lista de productos (paginada y filtrada).
 * @param {object} params - Opciones como { page: 1, search: 'sony', categoria: 2 }
 */
export const getPublicProducts = (params) => {
  return adminApi.get("/catalog/productos/", { params });
};

/**
 * Obtiene los detalles de un solo producto.
 * @param {number} id - ID del producto
 */
export const getPublicProductDetail = (id) => {
  return adminApi.get(`/catalog/productos/${id}/`);
};

/**
 * Obtiene la lista de todas las categorías.
 */
export const getPublicCategories = () => {
  return adminApi.get("/catalog/categorias/");
};

/**
 * Obtiene productos recomendados basados en un producto dado (Machine Learning).
 * @param {number} productId - ID del producto de referencia
 */
export const getRecommendedProducts = (productId) => {
  return adminApi.get(`/catalog/productos/${productId}/recomendados/`);
};

/**
 * Obtiene productos recomendados globales para el usuario (Machine Learning).
 */
export const getRecommendedProductsForUser = () => {
  return adminApi.get("/catalog/productos/recomendados-usuario/");
};
