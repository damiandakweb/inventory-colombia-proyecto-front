import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importa tus componentes
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import ActivosPage from '../pages/ActivosPage';
import SolicitudesPage from '../pages/SolicitudesPage';
import UsuariosPage from '../pages/UsuariosPage';
import UsuarioDetailPage from '../pages/UsuarioDeatilPage.jsx'; // ✅ Asegúrate de importar la página de detalle
import UbicacionesPage from '../pages/UbicacionesPage';
import CategoriasPage from '../pages/CategoriasPage';
import ActivoDetailPage from '../pages/ActivoDetailPage';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Ruta pública para el login */}
                <Route path="/login" element={<LoginPage />} />

                {/* Grupo de rutas protegidas que usarán el MainLayout */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/activos" element={<ActivosPage />} />
                        <Route path="/activos/:id" element={<ActivoDetailPage />} />
                        <Route path="/solicitudes" element={<SolicitudesPage />} />
                        <Route path="/usuarios" element={<UsuariosPage />} />

                        {/* ✅ --- LÍNEA AÑADIDA --- ✅ */}
                        <Route path="/usuarios/:id" element={<UsuarioDetailPage />} />

                        <Route path="/ubicaciones" element={<UbicacionesPage />} />
                        <Route path="/categorias" element={<CategoriasPage />} />
                    </Route>
                </Route>

                {/* Ruta para páginas no encontradas */}
                <Route path="*" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
