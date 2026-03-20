import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // 1. Buscamos el token en el almacenamiento local del navegador
    const token = localStorage.getItem('token');

    // 2. Si NO hay token, redirigimos al usuario a la página de login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 3. Si SÍ hay token, permitimos el acceso a las páginas hijas (el dashboard, activos, etc.)
    return <Outlet />;
};

export default ProtectedRoute;