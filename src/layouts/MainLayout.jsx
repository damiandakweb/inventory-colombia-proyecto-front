import React, { useState } from 'react';
import { Box, IconButton, AppBar, Toolbar, CssBaseline, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from '../components/Sidebar'; // Asegúrate de que la ruta a tu Sidebar sea correcta

const drawerWidth = 280; // El ancho de tu sidebar

const MainLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            {/* Barra superior que solo aparece en móviles */}
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    display: { sm: 'none' }, // Oculta en pantallas grandes (sm y superiores)
                    bgcolor: '#1e293b'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Inventario Colombia
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* El Sidebar ahora es un componente controlado */}
            <Sidebar
                drawerWidth={drawerWidth}
                mobileOpen={mobileOpen}
                handleDrawerToggle={handleDrawerToggle}
            />

            {/* Contenido Principal de cada página */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: { xs: '64px', sm: 0 } // Margen superior en móvil para que no quede debajo del AppBar
                }}
            >
                <Outlet /> {/* Aquí es donde React Router renderizará tus páginas */}
            </Box>
        </Box>
    );
};

export default MainLayout;
