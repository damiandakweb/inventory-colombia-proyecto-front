import apiClient from './api';

/**
 * Obtiene todos los activos del backend.
 */
export const getAllActivos = () => {
    return apiClient.get('/activos');
};

/**
 * Obtiene un activo específico por su ID.
 * @param {number|string} id - El ID del activo a obtener.
 */
// 👇 CORRECCIÓN: Cambiamos el nombre de la función para que sea consistente.
export const getActivoById = (id) => {
    return apiClient.get(`/activos/${id}`);
};

/**
 * Crea un nuevo activo.
 * @param {object} activoData - Los datos del activo a crear.
 */
export const createActivo = (activoData) => {
    return apiClient.post('/activos', activoData);
};

/**
 * Actualiza un activo existente.
 * @param {number|string} id - El ID del activo a actualizar.
 * @param {object} activoData - Los nuevos datos del activo.
 */
export const updateActivo = (id, activoData) => {
    return apiClient.put(`/activos/${id}`, activoData);
};

/**
 * Elimina un activo.
 * @param {number|string} id - El ID del activo a eliminar.
 */
export const deleteActivo = (id) => {
    return apiClient.delete(`/activos/${id}`);
};

/**
 * Obtiene todas las categorías.
 */
export const getAllCategorias = () => {
    return apiClient.get('/categorias');
};

/**
 * Obtiene todos los estados.
 */
export const getAllEstados = () => {
    return apiClient.get('/estados');
};

export const getActivosByUsuarioId = (usuarioId) => {
    return apiClient.get(`/activos/usuario/${usuarioId}`);
};

/**
 * Obtiene los activos disponibles de una categoría específica.
 * @param {number} categoriaId - El ID de la categoría a buscar.
 */
export const getActivosDisponiblesByCategoria = (categoriaId) => {
    return apiClient.get(`/activos/disponibles?categoriaId=${categoriaId}`);
};

export const getActivoByUsuarioAndCategoria = (usuarioId, categoriaId) => {
    return apiClient.get(`/activos/usuario/${usuarioId}/categoria/${categoriaId}`);
};

export const enlazarActivo = (activoId, relacionadoId) => {
    return apiClient.post(`/activos/${activoId}/enlazar/${relacionadoId}`);
};

// --- ✅ FUNCIÓN ACTUALIZADA ---
export const desenlazarActivo = (activoId, relacionadoId) => {
    return apiClient.post(`/activos/${activoId}/desenlazar/${relacionadoId}`);
};

export const getActivosRelacionados = (activoId) => {
    return apiClient.get(`/activos/${activoId}/relacionados`);
};

