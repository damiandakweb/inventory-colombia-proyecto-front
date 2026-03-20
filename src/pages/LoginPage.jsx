import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';
import { useNavigate } from "react-router-dom";

// Importa tu servicio de autenticación
import { login } from '../services/authService.js';

// Asegúrate que la imagen exista en esta ruta
import techInventoryImage from '../assets/Login.png';

import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState(''); // Estado inicial vacío
    const [password, setPassword] = useState(''); // Estado inicial vacío
    const [error, setError] = useState('');
    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Limpia errores anteriores

        try {
            const response = await login(email, password);

            // Extraemos el token y el objeto de usuario de la respuesta en una sola línea.
            const { token, usuario } = response.data;

            // Verificamos que ambos datos existan antes de proceder.
            if (token && usuario) {
                // Guardamos el token para futuras peticiones
                localStorage.setItem('token', token);
                // Guardamos el objeto del usuario como un string JSON para usarlo en el sidebar
                localStorage.setItem('usuario', JSON.stringify(usuario));
                // Redirigimos al dashboard
                navigate('/dashboard');
            } else {
                // Si la respuesta no trae lo esperado, mostramos un error genérico
                setError('Respuesta inesperada del servidor.');
            }

        } catch (err) {
            console.error('Error en el login:', err);
            setError('Usuario o contraseña incorrectos. Por favor, inténtelo de nuevo.');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100vw',
                backgroundColor: '#f0f2f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                position: 'fixed',
                top: 0,
                left: 0,
            }}
        >
            {/* Language Switcher - Posicionado en la esquina superior derecha */}
            <Box
                sx={{
                    position: 'absolute',
                    top: { xs: 16, sm: 24 }, // Más cerca del borde en móvil
                    right: { xs: 16, sm: 24 },
                    zIndex: 1000, // Asegurar que esté por encima de otros elementos
                }}
            >
                <LanguageSwitcher />
            </Box>

            <Paper
                elevation={12}
                sx={{
                    width: { xs: '95%', sm: '80%', md: '760px' },
                    maxWidth: '900px',
                    minHeight: '600px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                }}
            >
                {/* Panel Izquierdo - Imagen */}
                <Box
                    sx={{
                        flex: '1',
                        backgroundColor: '#18456D',
                        display: { xs: 'none', sm: 'flex' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3,
                    }}
                >
                    <Box
                        component="img"
                        src={techInventoryImage}
                        alt="Inventario de Tecnología"
                        sx={{
                            width: '100%',
                            maxWidth: '400px',
                            height: 'auto',
                            objectFit: 'contain',
                        }}
                    />
                </Box>

                {/* Panel Derecho - Formulario */}
                <Box
                    sx={{
                        flex: '1',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: { xs: 3, sm: 4, md: 5 },
                        backgroundColor: 'white',
                        // Añadimos un padding-top extra en móvil para evitar que el contenido se superponga con el botón de idioma
                        pt: { xs: 6, sm: 4, md: 5 },
                    }}
                >
                    <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {t('login_page.title')}
                    </Typography>
                    <Typography component="p" variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                        {t('login_page.unicity_inventory')}
                    </Typography>

                    {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label={t('login_page.username_label')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label={t('login_page.password_label')}
                            type="password"
                            value={password}
                            id="password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3, mb: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 'bold',
                                    backgroundColor: '#34495E',
                                    '&:hover': { backgroundColor: '#2c3e50' }
                                }}
                            >
                                {t('login_page.login_button')}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default LoginPage;