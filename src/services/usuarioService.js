// src/services/usuarioService.js
import apiClient from './api'; // 👈 Importa el mismo cliente configurado

export const getAllUsers = () => {
    return apiClient.get('/usuarios');
};

export const updateUser = (id, userData) => {
    // El 'userData' no debería incluir el password ni el rol
    return apiClient.put(`/usuarios/${id}`, userData);
};

export const createUser = (userData) => {
    return apiClient.post('/usuarios', userData);
};

export const deleteUser = (id) => {
    return apiClient.delete(`/usuarios/${id}`);
};

export const getUsuarioById = (id) => {
    return apiClient.get(`/usuarios/${id}`);
};