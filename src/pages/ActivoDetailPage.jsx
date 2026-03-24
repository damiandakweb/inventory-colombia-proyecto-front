import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Paper, Grid, CircularProgress, Link, Breadcrumbs, Button, Divider, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PrintIcon from '@mui/icons-material/Print';
import { useTranslation } from 'react-i18next';
import { getActivoById } from '../services/activoService';
import { getMovimientosByActivoId } from '../services/movimientoService';

const ActivoDetailPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [activo, setActivo] = useState(null);
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);

    const handlePrint = () => {
        if (!activo) return;
        const printWindow = window.open('', '_blank');
        const qrUrl = `${import.meta.env.VITE_API_URL}/qr/${activo.idEquipo}`;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${t('asset_page.print_labels_title')}-${activo.etiquetaInventario || activo.idEquipo}</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @page { size: letter; margin: 0; }
                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    font-family: Arial, sans-serif;
                }
                .etiqueta {
                    text-align: center;
                    padding: 16px;
                    border: 1px dashed #000;
                    width: 300px;
                }
                .titulo {
                    font-size: 1.2rem;
                    font-weight: bold;
                    margin-bottom: 4px;
                }
                .subtitulo {
                    font-size: 0.9rem;
                    color: #555;
                    margin-bottom: 8px;
                }
                .qr-img {
                    width: 180px;
                    height: 180px;
                    display: block;
                    margin: 0 auto;
                }
                .info {
                    font-size: 0.75rem;
                    margin-top: 8px;
                }
                hr { margin: 8px 0; }
            </style>
            </head>
            <body>
                <div class="etiqueta">
                    <div class="titulo">${activo.etiquetaInventario || 'Activo'}</div>
                    <div class="subtitulo">${activo.marca || ''} ${activo.modelo || ''}</div>
                    <hr>
                    <div class="qr-container">
                        <img id="qr-img" src="${qrUrl}" alt="Código QR" class="qr-img" />
                        <div class="info">ID: ${activo.idEquipo} | S/N: ${activo.numeroDeSerie || 'N/A'}</div>
                    </div>
                </div>
                <script>
                    const img = document.getElementById('qr-img');
                    let printed = false;

                    function doPrint() {
                        if (printed) return;
                        printed = true;
                        window.print();
                        window.close();
                    }

                    img.onload = () => setTimeout(doPrint, 300);
                    img.onerror = () => {
                        img.alt = 'QR no disponible';
                        setTimeout(doPrint, 300);
                    };

                    setTimeout(doPrint, 8000);
                <\/script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [activoRes, movimientosRes] = await Promise.all([
                    getActivoById(id),
                    getMovimientosByActivoId(id)
                ]);
                setActivo(activoRes.data);
                setMovimientos(movimientosRes.data);
            } catch (error) {
                // error manejado por GlobalExceptionHandler
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const columns = [
        { field: 'idMovimiento', headerName: t('asset_detail_page.movements_table_headers.movement_id'), width: 150 },
        { field: 'fechaMovimiento', headerName: t('asset_detail_page.movements_table_headers.date'), width: 150 },
        { field: 'tipoDeMovimiento', headerName: t('asset_detail_page.movements_table_headers.type'), width: 150 },
        { field: 'nombreUsuario', headerName: t('asset_detail_page.movements_table_headers.user'), width: 200 },
        { field: 'nombreUbicacion', headerName: t('asset_detail_page.movements_table_headers.location'), width: 150 },
        { field: 'observacion', headerName: t('asset_detail_page.movements_table_headers.observation'), flex: 1 },
    ];

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    if (!activo) {
        return <Typography>{t('asset_detail_page.not_found')}</Typography>;
    }

    return (
        <Box>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} underline="hover" color="inherit" to="/activos">
                    {t('asset_detail_page.breadcrumb_assets')}
                </Link>
                <Typography color="text.primary">{t('asset_detail_page.breadcrumb_detail')}</Typography>
            </Breadcrumbs>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h4" gutterBottom>
                        {t('asset_detail_page.title', { label: activo.etiquetaInventario })}
                    </Typography>
                    <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
                        {t('asset_detail_page.print_button')}
                    </Button>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                        <Typography component="div">
                            <Box component="strong" sx={{ mr: 1 }}>{t('asset_page.modal.country_label')}:</Box>
                            {activo.pais ? (
                                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                                    <img loading="lazy" width="20" src={`https://flagcdn.com/w20/${activo.pais.toLowerCase()}.png`} alt="" />
                                    {activo.pais}
                                </Box>
                            ) : ' N/A'}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}><Typography><strong>{t('asset_detail_page.details_section.asset_id')}:</strong> {activo.idEquipo}</Typography></Grid>
                    <Grid item xs={6} sm={4}><Typography><strong>{t('asset_detail_page.details_section.category')}:</strong> {activo.nombreCategoria}</Typography></Grid>
                    <Grid item xs={6} sm={4}><Typography><strong>{t('asset_detail_page.details_section.status')}:</strong> {activo.nombreEstado}</Typography></Grid>
                    <Grid item xs={6} sm={4}><Typography><strong>{t('asset_detail_page.details_section.brand')}:</strong> {activo.marca}</Typography></Grid>
                    <Grid item xs={6} sm={4}><Typography><strong>{t('asset_detail_page.details_section.model')}:</strong> {activo.modelo}</Typography></Grid>
                    <Grid item xs={6} sm={4}><Typography><strong>{t('asset_detail_page.details_section.serial_number')}:</strong> {activo.numeroDeSerie}</Typography></Grid>
                    <Grid item xs={12} sm={6}><Typography><strong>{t('asset_detail_page.details_section.current_location')}:</strong> {activo.nombreUbicacionActual || t('asset_detail_page.details_section.not_registered')}</Typography></Grid>
                    <Grid item xs={12} sm={6}><Typography><strong>{t('asset_detail_page.details_section.assigned_to')}:</strong> {activo.nombreUsuarioActual || t('asset_detail_page.details_section.unassigned')}</Typography></Grid>
                </Grid>
            </Paper>

            <Typography variant="h5" gutterBottom>{t('asset_detail_page.movements_history_title')}</Typography>
            <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={movimientos}
                    columns={columns}
                    getRowId={(row) => row.idMovimiento}
                />
            </Box>
        </Box>
    );
};

export default ActivoDetailPage;