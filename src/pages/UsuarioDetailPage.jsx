import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Link, Breadcrumbs, Divider, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { getUsuarioById } from '../services/usuarioService';
import { getActivosByUsuarioId } from '../services/activoService';

const UsuarioDetailPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const [usuario, setUsuario] = useState(null);
    const [activos, setActivos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [usuarioRes, activosRes] = await Promise.all([
                    getUsuarioById(id),
                    getActivosByUsuarioId(id)
                ]);
                setUsuario(usuarioRes.data);
                setActivos(activosRes.data);
            } catch (error) {
                console.error("Error al cargar los detalles del usuario:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const columns = [
        { field: 'idEquipo', headerName: t('user_detail_page.assets_table_headers.asset_id'), width: 130 },
        {
            field: 'etiquetaInventario',
            headerName: t('user_detail_page.assets_table_headers.label'),
            width: 200,
            renderCell: (params) => (
                <Link component={RouterLink} to={`/activos/${params.row.idEquipo}`} underline="hover">
                    {params.value}
                </Link>
            )
        },
        { field: 'nombreCategoria', headerName: t('user_detail_page.assets_table_headers.category'), width: 150 },
        { field: 'nombreEstado', headerName: t('user_detail_page.assets_table_headers.status'), flex: 1 },
    ];

    if (loading) return <CircularProgress />;
    if (!usuario) return <Typography>{t('user_detail_page.not_found')}</Typography>;

    return (
        <Box>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} underline="hover" color="inherit" to="/usuarios">
                    {t('user_detail_page.breadcrumb_users')}
                </Link>
                <Typography color="text.primary">{usuario.nombre}</Typography>
            </Breadcrumbs>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" gutterBottom>{usuario.nombre}</Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                    <Grid item xs={6}><Typography><strong>{t('user_detail_page.details_section.id')}:</strong> {usuario.idUsuario}</Typography></Grid>
                    <Grid item xs={6}><Typography><strong>{t('user_detail_page.details_section.role')}:</strong> {usuario.rol}</Typography></Grid>
                    <Grid item xs={12}><Typography><strong>{t('user_detail_page.details_section.email')}:</strong> {usuario.email}</Typography></Grid>
                </Grid>
            </Paper>
            <Typography variant="h5" gutterBottom>{t('user_detail_page.assigned_assets_title')}</Typography>
            <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={activos}
                    columns={columns}
                    getRowId={(row) => row.idEquipo}
                />
            </Box>
        </Box>
    );
};

export default UsuarioDetailPage;