import apiClient from './api';

export const getAllUbicaciones = () => {
    return apiClient.get('/ubicaciones');
};
export const createUbicacion = (ubicacionData) => {
    return apiClient.post('/ubicaciones', ubicacionData);
};

export const deleteUbicacion = (id) => {
    return apiClient.delete(`/ubicaciones/${id}`);
};

export const updateUbicacion = (id, ubicacionData) => {
    return apiClient.put(`/ubicaciones/${id}`, ubicacionData);
};