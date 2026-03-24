import React from 'react';
import { Box } from '@mui/material';
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Fallback SVG (pequeño) para cuando la imagen no cargue
const FALLBACK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='100%' height='100%' fill='white' stroke='black'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='12'>NO QR</text></svg>`
)}`;

const EtiquetaQRPequena = ({ activo }) => {
    if (!activo) return null;

    return (
        <Box
            className="qr-item"
            sx={{
                width: '1.2cm',
                height: '1.2cm',
                padding: '0.05cm',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxSizing: 'border-box',
                border: '0.5px solid #000',
                backgroundColor: 'white',
                flexShrink: 0,
                flexGrow: 0
            }}
        >
            <img
                className="qr-img"
                src={`${API_BASE_URL}/qr/${activo.idEquipo}`}
                alt={`QR para ${activo.etiquetaInventario}`}
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                onError={(e) => {
                    // no ocultar el elemento: mostrar fallback en su lugar
                    console.error(`Error cargando QR para activo ${activo.idEquipo}`);
                    e.target.onerror = null;
                    e.target.src = FALLBACK_SVG;
                }}
            />
        </Box>
    );
};

export default EtiquetaQRPequena;
