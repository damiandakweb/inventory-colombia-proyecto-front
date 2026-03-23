import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const PrivateLayout = () => {
    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    marginLeft: '280px', // Deja espacio para el sidebar
                    p: 3,
                }}
            >
                <Outlet /> {/* Aquí se renderiza cada página */}
            </Box>
        </Box>
    );
};

export default PrivateLayout;