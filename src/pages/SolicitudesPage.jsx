import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    Chip,
    CircularProgress,
    TextField,
    InputAdornment
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildIcon from '@mui/icons-material/Build';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { getAllSolicitudes, procesarSolicitud, enviarAMantenimiento, procesarDevolucion } from '../services/solicitudService';
import ProcesarSolicitudModal from '../components/ProcesarSolicitudModal';
import MantenimientoModal from '../components/MantenimientoModal';
import DevolucionModal from '../components/DevolucionModal';
import { useNotification } from '../context/NotificationContext';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';


const SolicitudesPage = () => {
    const { t } = useTranslation();
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState(null);
    const navigate = useNavigate();
    const [isProcesarModalOpen, setIsProcesarModalOpen] = useState(false);
    const [solicitudParaProcesar, setSolicitudParaProcesar] = useState(null);
    const [isMantenimientoModalOpen, setIsMantenimientoModalOpen] = useState(false);
    const [solicitudParaMantenimiento, setSolicitudParaMantenimiento] = useState(null);
    const [isDevolucionModalOpen, setIsDevolucionModalOpen] = useState(false);
    const [solicitudParaDevolucion, setSolicitudParaDevolucion] = useState(null);
    const { showNotification } = useNotification();

    const fetchSolicitudes = async () => {
        try {
            setLoading(true);
            const response = await getAllSolicitudes();
            setSolicitudes(response.data);
        } catch (error) {
            showNotification(t('requests_page.notifications.load_error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const location = useLocation();

    useEffect(() => {
        fetchSolicitudes();
    }, []);

    useEffect(() => {
        const preFiltro = location.state?.preFiltro;
        if (preFiltro === 'pendientes') {
            setActiveFilter(t('requests_page.active_filter'));
        }
    }, [location.state, t]);

    const filteredSolicitudes = useMemo(() => {
        let items = solicitudes;
        if (activeFilter) {
            items = items.filter(solicitud => solicitud.estadoSolicitud === 'Nuevo');
        }
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            items = items.filter(solicitud =>
                Object.values(solicitud).some(value =>
                    String(value).toLowerCase().includes(lowercasedFilter)
                )
            );
        }
        return items;
    }, [searchTerm, solicitudes, activeFilter]);

    const handleClearFilters = () => {
        setActiveFilter(null);
        setSearchTerm('');
        navigate('/solicitudes', { replace: true });
    };

    const handleOpenModal = (solicitud, modalType) => {
        if (modalType === 'procesar') {
            setSolicitudParaProcesar(solicitud);
            setIsProcesarModalOpen(true);
        } else if (modalType === 'mantenimiento') {
            setSolicitudParaMantenimiento(solicitud);
            setIsMantenimientoModalOpen(true);
        } else if (modalType === 'devolucion') {
            setSolicitudParaDevolucion(solicitud);
            setIsDevolucionModalOpen(true);
        }
    };

    const handleCloseAllModals = () => {
        setIsProcesarModalOpen(false);
        setSolicitudParaProcesar(null);
        setIsMantenimientoModalOpen(false);
        setSolicitudParaMantenimiento(null);
        setIsDevolucionModalOpen(false);
        setSolicitudParaDevolucion(null);
    };

    const handleConfirmAction = async (actionType, data) => {
        try {
            if (actionType === 'procesar') {
                await procesarSolicitud(solicitudParaProcesar.idSolicitud, data);
                showNotification(t('requests_page.notifications.processed_success'), 'success');
            } else if (actionType === 'mantenimiento') {
                await enviarAMantenimiento(solicitudParaMantenimiento.idSolicitud, data.activoId);
                showNotification(t('requests_page.notifications.maintenance_success'), 'success');
            } else if (actionType === 'devolucion') {
                await procesarDevolucion(solicitudParaDevolucion.idSolicitud, data);
                showNotification(t('requests_page.notifications.return_success'), 'success');
            }
            fetchSolicitudes();
        } catch (error) {
            const errorMessage = error.response?.data?.message || t('requests_page.notifications.action_error');
            showNotification(errorMessage, 'error');
        } finally {
            handleCloseAllModals();
        }
    };

    const columns = [
        { field: 'ticketId', headerName: t('requests_page.table_headers.ticket'), width: 160 },
        { field: 'fechaSolicitud', headerName: t('requests_page.table_headers.date'), width: 150 },
        { field: 'tipoSolicitud', headerName: t('requests_page.table_headers.type'), width: 180 },
        { field: 'nombreUsuario', headerName: t('requests_page.table_headers.user'), width: 200 },
        { field: 'nombreCategoria', headerName: t('requests_page.table_headers.category'), flex: 1, minWidth: 150 },
        {
            field: 'estadoSolicitud',
            headerName: t('requests_page.table_headers.status'),
            width: 130,
            renderCell: (params) => (
                <Chip
                    label={t(`requests_page.statuses.${params.value}`, { defaultValue: params.value })}
                    color={params.value === 'Nuevo' ? 'warning' : 'success'}
                    size="small"
                />
            )
        },
        {
            field: 'actions',
            headerName: t('requests_page.table_headers.actions'),
            width: 120,
            sortable: false,
            renderCell: (params) => {
                if (params.row.estadoSolicitud !== 'Nuevo') return null;
                const tipo = params.row.tipoSolicitud.toUpperCase();

                if (tipo.includes('CAMBIO') || tipo.includes('NUEVO')) {
                    return (
                        <Tooltip title={t('requests_page.tooltips.process')}>
                            <IconButton color="success" onClick={() => handleOpenModal(params.row, 'procesar')}>
                                <CheckCircleIcon />
                            </IconButton>
                        </Tooltip>
                    );
                }
                if (tipo.includes('MANTENIMIENTO')) {
                    return (
                        <Tooltip title={t('requests_page.tooltips.maintenance')}>
                            <IconButton sx={{ color: '#ed6c02' }} onClick={() => handleOpenModal(params.row, 'mantenimiento')}>
                                <BuildIcon />
                            </IconButton>
                        </Tooltip>
                    );
                }
                if (tipo.includes('DEVOLUCIÓN') || tipo.includes('DEVOLUCION')) {
                    return (
                        <Tooltip title={t('requests_page.tooltips.return')}>
                            <IconButton color="info" onClick={() => handleOpenModal(params.row, 'devolucion')}>
                                <KeyboardReturnIcon />
                            </IconButton>
                        </Tooltip>
                    );
                }
                return null;
            }
        },
    ];

    return (
        <Box sx={{ height: '85vh', width: '100%' }}>
            <Typography variant="h4" sx={{ mb: 2 }}>{t('requests_page.title')}</Typography>

            <TextField
                fullWidth
                variant="outlined"
                placeholder={t('requests_page.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                    startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
                }}
            />

            {activeFilter && (
                <Box sx={{ mb: 2 }}>
                    <Chip
                        icon={<FilterAltOffIcon />}
                        label={activeFilter}
                        onDelete={handleClearFilters}
                        color="primary"
                    />
                </Box>
            )}

            <DataGrid
                rows={filteredSolicitudes}
                columns={columns}
                getRowId={(row) => row.idSolicitud}
                loading={loading}
                initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
                pageSizeOptions={[10, 20, 50]}
            />

            {isProcesarModalOpen && ( <ProcesarSolicitudModal open={isProcesarModalOpen} onClose={handleCloseAllModals} onSave={(data) => handleConfirmAction('procesar', data)} solicitud={solicitudParaProcesar} /> )}
            {isMantenimientoModalOpen && ( <MantenimientoModal open={isMantenimientoModalOpen} onClose={handleCloseAllModals} onConfirm={(solicitudId, activoId) => handleConfirmAction('mantenimiento', { solicitudId, activoId })} solicitud={solicitudParaMantenimiento} /> )}
            {isDevolucionModalOpen && ( <DevolucionModal open={isDevolucionModalOpen} onClose={handleCloseAllModals} onConfirm={(data) => handleConfirmAction('devolucion', data)} solicitud={solicitudParaDevolucion} /> )}
        </Box>
    );
};

export default SolicitudesPage;