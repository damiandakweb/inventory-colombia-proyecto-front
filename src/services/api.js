import axios from 'axios';

const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// Interceptor de Petición: Añade el token a cada llamada
apiClient.interceptors.request.use( (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, (error) => Promise.reject(error)
);

// Interceptor de Respuesta: Maneja errores de autenticación
apiClient.interceptors.response.use( (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403) && error.config.url !== '/auth/login') {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;