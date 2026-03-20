import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';

// URL base de tu API. Asegúrate de que coincida con la de tu archivo api.js
const API_BASE_URL = 'http://10.58.66.76/api';//'http://10.58.66.76/api'; // O http://localhost:8080/api para pruebas locales

// Envuelve toda la definición del componente en React.forwardRef
const EtiquetaQR = React.forwardRef(({ activo }, ref) => {
    if (!activo) return null;

    return (
        // Asigna la 'ref' al elemento principal que se va a imprimir
        <Paper
            ref={ref}
            elevation={0}
            sx={{
                width: 300,
                p: 2,
                border: '1px dashed grey',
                backgroundColor: 'white',
                '@media print': {
                    border: '1px solid black',
                    boxShadow: 'none',
                    margin: 0,
                    padding: '16px'
                }
            }}
        >
            <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 'bold',
                        '@media print': {
                            fontSize: '1.2rem',
                            color: 'black !important'
                        }
                    }}
                >
                    {activo.etiquetaInventario || 'Activo de Inventario'}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        '@media print': {
                            color: 'black !important'
                        }
                    }}
                >
                    {activo.marca} {activo.modelo}
                </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                <img
                    src={`${API_BASE_URL}/qr/${activo.idEquipo}`}
                    alt={`Código QR para ${activo.etiquetaInventario}`}
                    style={{
                        width: '180px',
                        height: '180px',
                        display: 'block'
                    }}
                    onLoad={() => console.log('QR image loaded successfully')}
                    onError={() => console.error('Error loading QR image')}
                />
                <Typography
                    variant="caption"
                    sx={{
                        mt: 1,
                        '@media print': {
                            color: 'black !important'
                        }
                    }}
                >
                    ID: {activo.idEquipo} | S/N: {activo.numeroDeSerie}
                </Typography>
            </Box>
        </Paper>
    );
});

// Agregar displayName para debugging
EtiquetaQR.displayName = 'EtiquetaQR';

export default EtiquetaQR;