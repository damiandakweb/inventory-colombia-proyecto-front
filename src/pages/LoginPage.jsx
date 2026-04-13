import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, Divider } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { login } from '../services/authService.js';
import techInventoryImage from '../assets/Login.png';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { t } = useTranslation();

    // Login tradicional
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await login(email, password);
            const { token, usuario } = response.data;
            if (token && usuario) {
                localStorage.setItem('token', token);
                localStorage.setItem('usuario', JSON.stringify(usuario));
                navigate('/dashboard');
            } else {
                setError('Respuesta inesperada del servidor.');
            }
        } catch (err) {
            console.error('Error en el login:', err);
            setError(err.response?.data?.error || 'Usuario o contraseña incorrectos.');
        }
    };

    // Login con Google
    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/google`,
                { token: credentialResponse.credential }
            );
            const { token, usuario } = response.data;
            if (token && usuario) {
                localStorage.setItem('token', token);
                localStorage.setItem('usuario', JSON.stringify(usuario));
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Error en Google login:', err);
            setError(err.response?.data?.error || 'Acceso denegado.');
        }
    };

    const handleGoogleError = () => {
        setError('Error al iniciar sesión con Google. Intenta de nuevo.');
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
                {/* Language Switcher */}
                <Box sx={{ position: 'absolute', top: { xs: 16, sm: 24 }, right: { xs: 16, sm: 24 }, zIndex: 1000 }}>
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
                            sx={{ width: '100%', maxWidth: '400px', height: 'auto', objectFit: 'contain' }}
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

                        {/* Formulario tradicional */}
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
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
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

                        {/* Divisor */}
                        <Divider sx={{ width: '100%', my: 2 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', px: 1 }}>
                                {t('login_page.or') || 'o continúa con'}
                            </Typography>
                        </Divider>

                        {/* Botón Google */}
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 1 }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                useOneTap={false}
                                theme="outline"
                                size="large"
                                width="380"
                                text="signin_with"
                                shape="rectangular"
                                locale={t('login_page.google_locale') || 'es'}
                            />
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </GoogleOAuthProvider>
    );
};

export default LoginPage;