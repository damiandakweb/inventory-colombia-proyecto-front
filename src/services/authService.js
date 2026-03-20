import apiClient from './api'; // Importamos el cliente de Axios configurado

export const login = (email, password) => {
    // Llama al endpoint específico de login de tu backend
    return apiClient.post('/auth/login', {
        email: email,
        password: password
    });
};