import { useNavigate } from 'react-router-dom';

/**
 * Hook personalizado para manejar la información y el estado de autenticación del usuario.
 */
export const useAuth = () => {
    const navigate = useNavigate();

    // Leemos el objeto de usuario que guardamos en localStorage durante el login
    const storedUser = localStorage.getItem('usuario');

    // Si hay datos, los convertimos de texto a objeto. Si no, es null.
    const user = storedUser ? JSON.parse(storedUser) : null;

    // Función para cerrar sesión
    const logout = () => {
        // Borramos los datos de la sesión del navegador
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        // Redirigimos a la página de login
        navigate('/login');
    };

    // El hook devuelve el usuario y la función de logout para que otros componentes los usen
    return { user, logout };
};