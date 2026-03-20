import apiClient from './api';

export const getAllCategorias = () => {
    return apiClient.get('/categorias');
};
export const createCategoria = (categoriaData) => {
    return apiClient.post('/categorias', categoriaData);
};

export const deleteCategoria = (id) => {
    return apiClient.delete(`/categorias/${id}`);
};

export const updateCategoria = (id, categoriaData) => {
    return apiClient.put(`/categorias/${id}`, categoriaData);
};