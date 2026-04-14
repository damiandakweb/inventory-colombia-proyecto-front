import React, { useState } from 'react';
import { Box, IconButton, AppBar, Toolbar, CssBaseline, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from '../components/Sidebar';
import LanguageSwitcher from '../components/LanguageSwitcher';

const drawerWidth = 280;

const MainLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    display: { sm: 'none' },
                    bgcolor: '#1e293b'
                }}
            >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                    </Box>
                    {/* ✅ Language switcher en el AppBar móvil */}
                    <Box sx={{ '& .MuiBox-root': { p: 0 } }}>
                        <LanguageSwitcher />
                    </Box>
                </Toolbar>
            </AppBar>

            <Sidebar
                drawerWidth={drawerWidth}
                mobileOpen={mobileOpen}
                handleDrawerToggle={handleDrawerToggle}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 1.5, sm: 3 },
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: { xs: '64px', sm: 0 },
                    overflowX: 'hidden' // ✅ Evita scroll horizontal
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout;