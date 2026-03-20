import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://10.13.20.16/api',
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
        // Si el error es 401 o 403 Y NO es la página de login, cerramos sesión.
        if (error.response && (error.response.status === 401 || error.response.status === 403) && error.config.url !== '/auth/login') {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;