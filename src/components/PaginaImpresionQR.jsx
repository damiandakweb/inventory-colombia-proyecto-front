import React from 'react';
import { Box, Typography } from '@mui/material';
import EtiquetaQRPequena from './EtiquetaQRPequena';
import { useTranslation } from 'react-i18next';


const PaginaImpresionQR = React.forwardRef(({ activos }, ref) => {
    const { t } = useTranslation();
    if (!activos || activos.length === 0) {
        return (
            <div ref={ref}>
                <Typography>{t('print_qr_page.no_assets_selected')}</Typography>
            </div>
        );
    }

    return (
        <div ref={ref}>
            <Box
                className="qr-grid"
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, 1.3cm)', // ✅ 12 QRs por fila
                    gridAutoRows: '1.3cm',
                    gap: '0.1cm',
                    padding: '0.5cm',
                    width: '100%',
                    boxSizing: 'border-box'
                }}
            >
                {activos.map((activo) => (
                    <EtiquetaQRPequena key={activo.idEquipo} activo={activo} />
                ))}
            </Box>

            <style type="text/css">
                {`
          @media print {
            @page {
              size: 8.5in 11in; /* ✅ Carta exacta */
              margin: 5mm;      /* ✅ Márgenes reducidos */
            }
            .qr-grid {
              display: grid !important;
              grid-template-columns: repeat(12, 1.3cm) !important;
              grid-auto-rows: 1.3cm !important;
              gap: 0.1cm !important;
            }
            .qr-item {
              width: 1.2cm !important;
              height: 1.2cm !important;
              padding: 0.05cm !important;
              box-sizing: border-box !important;
            }
            img.qr-img {
              width: 100% !important;
              height: 100% !important;
              display: block !important;
              object-fit: contain !important;
            }
          }
        `}
            </style>
        </div>
    );
});

PaginaImpresionQR.displayName = 'PaginaImpresionQR';
export default PaginaImpresionQR;