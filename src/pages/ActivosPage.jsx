import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    TextField, InputAdornment, Box, Button, Typography, IconButton, Chip, Tooltip, Link,
    Paper, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, TablePagination,
    Checkbox, CircularProgress, Select, MenuItem, FormControl, InputLabel,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import SecurityIcon from '@mui/icons-material/Security';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import PrintIcon from '@mui/icons-material/Print';
import LinkIcon from '@mui/icons-material/Link';
import { useTranslation } from 'react-i18next';

// Services
import { getAllActivos, createActivo, updateActivo, deleteActivo, getActivosRelacionados } from '../services/activoService';
import { createMovimiento } from '../services/movimientoService';

// Components
import ActivoModal from '../components/ActivoModal';
import MovimientoModal from '../components/MovimientoModal';
import ReporteModal from '../components/ReporteModal';
import RelatedAssetsModal from '../components/RelatedAssetsModal';

// Context
import { useNotification } from "../context/NotificationContext.jsx";

const ActivosPage = () => {
    const { t, i18n} = useTranslation();
    const { showNotification } = useNotification();
    const [activos, setActivos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isActivoModalOpen, setIsActivoModalOpen] = useState(false);
    const [currentActivo, setCurrentActivo] = useState(null);
    const [isMovimientoModalOpen, setIsMovimientoModalOpen] = useState(false);
    const [isReporteModalOpen, setIsReporteModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState(null);

    // ✅ Estados para filtros por columna
    const [columnFilters, setColumnFilters] = useState({
        pais: '',
        marca: '',
        categoria: '',
        estado: '',
        usuario: '',
        garantia: ''
    });

    // ✅ Estados para el modal de relacionados
    const [isRelatedModalOpen, setIsRelatedModalOpen] = useState(false);
    const [loadingRelated, setLoadingRelated] = useState(false);
    const [relatedAssetsList, setRelatedAssetsList] = useState([]);
    const [currentActivoForRelated, setCurrentActivoForRelated] = useState(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [selected, setSelected] = useState([]);

    const [isBajaDialogOpen, setIsBajaDialogOpen] = useState(false);
    const [activoParaBaja, setActivoParaBaja] = useState(null);
    const [motivoBaja, setMotivoBaja] = useState('');
    const [motivoError, setMotivoError] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    const procesarActivos = (rawData) => {
        if (!Array.isArray(rawData)) {
            return [];
        }

        const validActivos = rawData.filter(activo => {
            if (!activo.idEquipo) {
                return false;
            }
            return true;
        });

        const seen = new Set();
        const uniqueActivos = validActivos.filter(activo => {
            if (seen.has(activo.idEquipo)) {
                return false;
            }
            seen.add(activo.idEquipo);
            return true;
        });
        return uniqueActivos;
    };

    const fetchActivos = async () => {
        try {
            setLoading(true);
            const response = await getAllActivos();
            setActivos(procesarActivos(response.data));
        } catch (error) {
            showNotification(t('asset_page.notifications.load_error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivos();
    }, [t]);

    useEffect(() => {
        const preFiltro = location.state?.preFiltro;
        if (preFiltro === 'backup') setActiveFilter('Computadores Backup');
    }, [location.state]);

    const uniqueValues = useMemo(() => {
        return {
            paises: [...new Set(activos.map(a => a.pais).filter(Boolean))].sort(),
            marcas: [...new Set(activos.map(a => a.marca).filter(Boolean))].sort(),
            categorias: [...new Set(activos.map(a => a.nombreCategoria).filter(Boolean))].sort(),
            estados: [...new Set(activos.map(a => a.nombreEstado).filter(Boolean))].sort(),
            usuarios: [...new Set(activos.map(a => a.nombreUsuarioActual).filter(Boolean))].sort()
        };
    }, [activos]);

    // ✅ Función para manejar cambios en filtros de columna
    const handleColumnFilterChange = (column, value) => {
        setColumnFilters(prev => ({
            ...prev,
            [column]: value
        }));
        setPage(0);
    };

    // ✅ Función para abrir el modal y cargar relacionados
    const handleOpenRelatedModal = async (activo) => {
        if (!activo || !activo.idEquipo) return;

        setCurrentActivoForRelated(activo);
        setIsRelatedModalOpen(true);
        setLoadingRelated(true);
        setRelatedAssetsList([]);

        try {
            const response = await getActivosRelacionados(activo.idEquipo);
            setRelatedAssetsList(response.data || []);
        } catch (error) {
            showNotification(t('asset_page.notifications.load_related_error'), 'error');
        } finally {
            setLoadingRelated(false);
        }
    };

    const handleCloseRelatedModal = () => {
        setIsRelatedModalOpen(false);
        setRelatedAssetsList([]);
        setCurrentActivoForRelated(null);
    };

    // ✅ Filtrado mejorado con filtros por columna
    const filteredActivos = useMemo(() => {
        let items = [...activos];

        // Filtro pre-establecido (Computadores Backup)
        if (activeFilter === 'Computadores Backup') {
            items = items.filter(activo =>
                (activo.nombreCategoria?.toLowerCase() === 'portatil' || activo.nombreCategoria?.toLowerCase() === 'computador') &&
                (activo.nombreEstado?.toLowerCase() === 'nuevo' || activo.nombreEstado?.toLowerCase() === 'en bodega')
            );
        }

        // Filtros por columna
        if (columnFilters.pais) {
            items = items.filter(activo => activo.pais === columnFilters.pais);
        }
        if (columnFilters.marca) {
            items = items.filter(activo => activo.marca === columnFilters.marca);
        }
        if (columnFilters.categoria) {
            items = items.filter(activo => activo.nombreCategoria === columnFilters.categoria);
        }
        if (columnFilters.estado) {
            items = items.filter(activo => activo.nombreEstado === columnFilters.estado);
        }
        if (columnFilters.usuario) {
            items = items.filter(activo => activo.nombreUsuarioActual === columnFilters.usuario);
        }
        if (columnFilters.garantia) {
            const hoy = new Date();
            items = items.filter(activo => {
                if (!activo.fechaGarantia) return columnFilters.garantia === 'sin_garantia';
                const dias = Math.ceil((new Date(activo.fechaGarantia) - hoy) / (1000 * 60 * 60 * 24));
                if (columnFilters.garantia === 'vigente') return dias > 30;
                if (columnFilters.garantia === 'por_vencer') return dias >= 0 && dias <= 30;
                if (columnFilters.garantia === 'vencida') return dias < 0;
                if (columnFilters.garantia === 'sin_garantia') return !activo.fechaGarantia;
                return true;
            });
        }

        // Filtro global de búsqueda
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            items = items.filter(activo => {
                // Buscar en valores crudos de la BD
                const matchRaw = Object.values(activo).some(value =>
                    value && String(value).toLowerCase().includes(lowercasedFilter)
                );

                // Buscar en valores traducidos
                const estadoTraducido = t(`asset_states.${activo.nombreEstado?.toUpperCase().replace(/ /g, '_')}`, { defaultValue: '' }).toLowerCase();
                const categoriaTraducida = t(`categories.${activo.nombreCategoria?.toUpperCase().replace(/ /g, '_')}`, { defaultValue: '' }).toLowerCase();
                const matchTranslated =
                    estadoTraducido.includes(lowercasedFilter) ||
                    categoriaTraducida.includes(lowercasedFilter);

                return matchRaw || matchTranslated;
            });
        }

        return items;
    }, [searchTerm, activos, activeFilter, columnFilters, t]);

    const activosSeleccionados = useMemo(() =>
            activos.filter(activo => selected.includes(activo.idEquipo)),
        [selected, activos]
    );

    const handleBulkPrint = () => {
        const apiUrl = import.meta.env.VITE_API_URL;
        const printWindow = window.open('', '_blank', 'height=800,width=600');

    const POR_FILA = 12;
    const filasHTML = [];
        for (let i = 0; i < activosSeleccionados.length; i += POR_FILA) {
            const fila = activosSeleccionados.slice(i, i + POR_FILA);
            filasHTML.push(`
            <div class="fila">
                ${fila.map(activo => `
                    <div class="etiqueta">
                        <img class="qr-img" src="${apiUrl}/qr/${activo.idEquipo}" alt="QR"/>
                        <div class="label">${activo.etiquetaInventario || activo.idEquipo}</div>
                    </div>
                `).join('')}
            </div>
        `);
        }
        const paginasHTML = `<div class="contenido">${filasHTML.join('')}</div>`;

        printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Imprimir Etiquetas</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @page { size: letter; margin: 8mm; }
                body { font-family: Arial, sans-serif; }
                .contenido { width: 100%; }
                .fila {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: nowrap;
                    gap: 1mm;
                    margin-bottom: 1mm;
                    page-break-inside: avoid;
                    break-inside: avoid;
                }
                .etiqueta {
                    width: 1.8cm;
                    height: 2cm;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border: 0.5px solid #000;
                    padding: 1px;
                    flex-shrink: 0;
                }
                .qr-img {
                    width: 1.5cm;
                    height: 1.5cm;
                    object-fit: contain;
                    display: block;
                }
                .label {
                    font-size: 5px;
                    text-align: center;
                    overflow: hidden;
                    white-space: nowrap;
                    width: 100%;
                    margin-top: 1px;
                }
            </style>
        </head>
        <body>
            ${paginasHTML}
            <script>
                const imgs = document.querySelectorAll('.qr-img');
                let loaded = 0;
                let printed = false;

                function tryPrint() {
                    if (printed) return;
                    printed = true;
                    window.print();
                    window.close();
                }

                if (imgs.length === 0) {
                    tryPrint();
                } else {
                    imgs.forEach(img => {
                        if (img.complete) {
                            loaded++;
                            if (loaded === imgs.length) tryPrint();
                        } else {
                            img.onload = img.onerror = () => {
                                loaded++;
                                if (loaded === imgs.length) tryPrint();
                            };
                        }
                    });
                }
                setTimeout(tryPrint, 10000);
            </script>
        </body>
        </html>
    `);
        printWindow.document.close();
    };
    const obtenerPropsGarantia = (fechaGarantia) => {
        if (!fechaGarantia) return { label: t('asset_page.warranty.no_warranty'), color: 'default', icon: <SecurityIcon />, variant: 'outlined' };
        const diasRestantes = Math.ceil((new Date(fechaGarantia) - new Date()) / (1000 * 60 * 60 * 24));
        if (diasRestantes < 0) return { label: t('asset_page.warranty.expired'), color: 'error', icon: <ErrorIcon />, variant: 'filled', tooltip: t('asset_page.warranty.expired_days_ago', { days: Math.abs(diasRestantes) }) };
        if (diasRestantes <= 30) return { label: t('asset_page.warranty.days_remaining', { days: diasRestantes }), color: 'warning', icon: <WarningIcon />, variant: 'filled', tooltip: t('asset_page.warranty.days_remaining_tooltip', { days: diasRestantes }) };
        return { label: t('asset_page.warranty.valid'), color: 'success', icon: <CheckCircleIcon />, variant: 'outlined', tooltip: t('asset_page.warranty.days_remaining_tooltip', { days: diasRestantes }) };
    };

    // ✅ Limpiar TODOS los filtros
    const handleClearFilters = () => {
        setActiveFilter(null);
        setSearchTerm('');
        setColumnFilters({
            pais: '',
            marca: '',
            categoria: '',
            estado: '',
            usuario: '',
            garantia: ''
        });
        navigate('/activos', { replace: true });
    };

    const handleOpenModal = (activo = null) => { setCurrentActivo(activo); setIsActivoModalOpen(true); };
    const handleCloseModal = () => { setIsActivoModalOpen(false); setCurrentActivo(null); };
    const handleOpenMovimientoModal = (activo) => { setCurrentActivo(activo); setIsMovimientoModalOpen(true); };
    const handleCloseMovimientoModal = () => { setIsMovimientoModalOpen(false); setCurrentActivo(null); };

    const handleSaveActivo = async (data, id) => {
        try {
            if (id) {
                await updateActivo(id, data);
                showNotification(t('asset_page.notifications.asset_updated_success'), 'success');
            } else {
                await createActivo(data);
                showNotification(t('asset_page.notifications.asset_created_success'), 'success');
            }
            await fetchActivos();
        } catch (error) {
            const errorKey = id ? 'asset_page.notifications.asset_updated_error' : 'asset_page.notifications.asset_created_error';
            showNotification(t(errorKey), 'error');
        } finally {
            handleCloseModal();
        }
    };

    const handleSaveMovimiento = async (movimientoData) => {
        try {
            await createMovimiento(movimientoData);
            await fetchActivos();
            showNotification(t('asset_page.notifications.movement_success'), 'success');
        } catch (error) {
            const msg = error.response?.data?.message || t('asset_page.notifications.movement_error');
            showNotification(msg, 'error');
        } finally {
            handleCloseMovimientoModal();
        }
    };

    const handleOpenBajaDialog = (activo) => {
        setActivoParaBaja(activo);
        setMotivoBaja('');
        setMotivoError(false);
        setIsBajaDialogOpen(true);
    };

    const handleConfirmBaja = async () => {
        if (!motivoBaja.trim()) {
            setMotivoError(true);
            return;
        }
        try {
            await deleteActivo(activoParaBaja.idEquipo, motivoBaja);
            showNotification(t('asset_page.notifications.asset_deleted_success'), 'success');
            fetchActivos();
        } catch (error) {
            const msg = error.response?.data?.message || t('asset_page.notifications.asset_deleted_error');
            showNotification(msg, 'error');
        } finally {
            setIsBajaDialogOpen(false);
            setActivoParaBaja(null);
            setMotivoBaja('');
        }
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = filteredActivos.map((n) => n.idEquipo);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleRowClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];
        if (selectedIndex === -1) newSelected = newSelected.concat(selected, id);
        else if (selectedIndex === 0) newSelected = newSelected.concat(selected.slice(1));
        else if (selectedIndex === selected.length - 1) newSelected = newSelected.concat(selected.slice(0, -1));
        else if (selectedIndex > 0) newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
        setSelected(newSelected);
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredActivos.length) : 0;

    // ✅ Verificar si hay filtros activos
    const hasActiveFilters = activeFilter || searchTerm || Object.values(columnFilters).some(v => v !== '');

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">{t('asset_page.title')}</Typography>
                <Box>
                    {activosSeleccionados.length > 0 && (
                        <Button variant="contained" color="secondary" startIcon={<PrintIcon />} onClick={handleBulkPrint} sx={{ mr: 2 }}>
                            {t('asset_page.print_labels_button', { count: activosSeleccionados.length })}
                        </Button>
                    )}
                    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => setIsReporteModalOpen(true)} sx={{ mr: 2 }}>
                        {t('asset_page.generate_report_button')}
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
                        {t('asset_page.add_button')}
                    </Button>
                </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
                <TextField fullWidth variant="outlined" placeholder={t('asset_page.search_placeholder')} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>), }} />
            </Box>

            {/* ✅ Filtros por columna */}
            <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                        value={columnFilters.pais}
                        onChange={(e) => handleColumnFilterChange('pais', e.target.value)}
                        displayEmpty
                    >
                        <MenuItem value="">{t('asset_page.all_countries')}</MenuItem>

                        {uniqueValues.paises.map(pais => (
                            <MenuItem key={pais} value={pais}>{pais}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                        value={columnFilters.marca}
                        onChange={(e) => handleColumnFilterChange('marca', e.target.value)}
                        displayEmpty
                    >
                        <MenuItem value="">{t('asset_page.all_brands')}</MenuItem>
                        {uniqueValues.marcas.map(marca => (
                            <MenuItem key={marca} value={marca}>{marca}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                        value={columnFilters.categoria}
                        onChange={(e) => handleColumnFilterChange('categoria', e.target.value)}
                        displayEmpty
                    >
                        <MenuItem value="">{t('asset_page.all_categories')}</MenuItem>
                        {uniqueValues.categorias.map(cat => (
                            <MenuItem key={cat} value={cat}>
                                {t(`categories.${cat.toUpperCase().replace(/ /g, '_')}`, { defaultValue: cat })}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                        value={columnFilters.estado}
                        onChange={(e) => handleColumnFilterChange('estado', e.target.value)}
                        displayEmpty
                    >
                        <MenuItem value="">{t('asset_page.all_states')}</MenuItem>
                        {uniqueValues.estados.map(estado => (
                            <MenuItem key={estado} value={estado}>
                                {t(`asset_states.${estado.toUpperCase().replace(/ /g, '_')}`, { defaultValue: estado })}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                        value={columnFilters.usuario}
                        onChange={(e) => handleColumnFilterChange('usuario', e.target.value)}
                        displayEmpty
                    >
                        <MenuItem value="">{t('asset_page.all_users')}</MenuItem>
                        {uniqueValues.usuarios.map(user => (
                            <MenuItem key={user} value={user}>{user}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <Select
                        value={columnFilters.garantia}
                        onChange={(e) => handleColumnFilterChange('garantia', e.target.value)}
                        displayEmpty
                    >
                        <MenuItem value="">{t('asset_page.warranty_legend.all_warranties')}</MenuItem>
                        <MenuItem value="vigente">{t('asset_page.warranty_legend.valid')}</MenuItem>
                        <MenuItem value="por_vencer">{t('asset_page.warranty_legend.expiring')}</MenuItem>
                        <MenuItem value="vencida">{t('asset_page.warranty_legend.expired')}</MenuItem>
                        <MenuItem value="sin_garantia">{t('asset_page.warranty_legend.no_warranty')}</MenuItem>
                    </Select>
                </FormControl>

                {hasActiveFilters && (
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<FilterAltOffIcon />}
                        onClick={handleClearFilters}
                    >
                        {t('asset_page.clear_filters')}
                    </Button>
                )}
            </Box>

            {activeFilter && (
                <Box sx={{ mb: 2 }}>
                    <Chip icon={<FilterAltOffIcon />} label={t('asset_page.active_filter', { filter: activeFilter })} onDelete={handleClearFilters} color="primary" />
                </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium', mr: 1 }}>{t('asset_page.warranty_legend.title')}</Typography>
                <Chip icon={<CheckCircleIcon />} label={t('asset_page.warranty_legend.valid')} color="success" variant="outlined" size="small" />
                <Chip icon={<WarningIcon />} label={t('asset_page.warranty_legend.expiring')} color="warning" variant="outlined" size="small" />
                <Chip icon={<ErrorIcon />} label={t('asset_page.warranty_legend.expired')} color="error" variant="outlined" size="small" />
                <Chip icon={<SecurityIcon />} label={t('asset_page.warranty_legend.no_warranty')} color="default" variant="outlined" size="small" />
            </Box>

            {loading ? <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress/></Box> : (
                <Paper sx={{ width: '100%', mb: 2 }}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox color="primary" indeterminate={selected.length > 0 && selected.length < filteredActivos.length} checked={filteredActivos.length > 0 && selected.length === filteredActivos.length} onChange={handleSelectAllClick} />
                                    </TableCell>

                                    <TableCell>{t('asset_page.table_headers.label')}</TableCell>
                                    <TableCell>{t('asset_page.modal.country_label')}</TableCell>
                                    <TableCell>{t('common.brand')}</TableCell>
                                    <TableCell>{t('common.model')}</TableCell>
                                    <TableCell>{t('common.serial_number')}</TableCell>
                                    <TableCell>{t('common.category')}</TableCell>
                                    <TableCell>{t('common.status')}</TableCell>
                                    <TableCell>{t('asset_page.table_headers.warranty')}</TableCell>
                                    <TableCell>{t('common.user')}</TableCell>
                                    <TableCell align="center">{t('common.related')}</TableCell>
                                    <TableCell>{t('common.actions')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredActivos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, tableIndex) => {
                                    const isItemSelected = isSelected(row.idEquipo);
                                    const uniqueKey = `activo-${row.idEquipo}-${tableIndex}-${page}`;

                                    return (
                                        <TableRow
                                            hover
                                            role="checkbox"
                                            aria-checked={isItemSelected}
                                            tabIndex={-1}
                                            key={uniqueKey}
                                            selected={isItemSelected}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox color="primary" checked={isItemSelected} onClick={(event) => handleRowClick(event, row.idEquipo)} />
                                            </TableCell>
                                            <TableCell>
                                                <Link component={RouterLink} to={`/activos/${row.idEquipo}`}>
                                                    {row.etiquetaInventario || t('asset_page.table_data.no_label')}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {row.pais ? (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <img
                                                            loading="lazy"
                                                            width="20"
                                                            src={`https://flagcdn.com/w20/${row.pais.toLowerCase()}.png`}
                                                            alt=""
                                                        />
                                                        {row.pais}
                                                    </Box>
                                                ) : '-'}
                                            </TableCell>
                                            <TableCell>{row.marca || '-'}</TableCell>
                                            <TableCell>{row.modelo || '-'}</TableCell>
                                            <TableCell>{row.numeroDeSerie || '-'}</TableCell>
                                            <TableCell>
                                                {row.nombreCategoria
                                                    ? (i18n.language === 'en' && row.nombreCategoriaEn
                                                        ? row.nombreCategoriaEn
                                                        : row.nombreCategoria)
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>{row.nombreEstado ? t(`asset_states.${row.nombreEstado.toUpperCase().replace(/ /g, '_')}`, { defaultValue: row.nombreEstado }) : '-'}</TableCell>
                                            <TableCell>{
                                                (() => {
                                                    const props = obtenerPropsGarantia(row.fechaGarantia);
                                                    const chip = <Chip {...props} size="small" />;
                                                    return props.tooltip ? <Tooltip title={props.tooltip}>{chip}</Tooltip> : chip;
                                                })()
                                            }</TableCell>
                                            <TableCell>{row.nombreUsuarioActual || t('asset_page.table_data.unassigned')}</TableCell>

                                            {/* ✅ CELDA DE RELACIONADOS MEJORADA - CARGA BAJO DEMANDA */}
                                            <TableCell align="center">
                                                <Tooltip title={t('asset_page.tooltips.show_related')}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleOpenRelatedModal(row)}
                                                        color="primary"
                                                    >
                                                        <LinkIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>

                                            <TableCell>
                                                <Box sx={{ display: 'flex' }}>
                                                    <Tooltip title={t('asset_page.tooltips.edit_asset')}>
                                                        <IconButton onClick={() => handleOpenModal(row)} size="small" color="primary">
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={t('asset_page.tooltips.register_movement')}>
                                                        <IconButton onClick={() => handleOpenMovimientoModal(row)} size="small" color="secondary">
                                                            <SyncAltIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={t('asset_page.tooltips.deactivate_asset')}>
                                                        <IconButton color="error" onClick={() => handleOpenBajaDialog(row)} size="small">
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {emptyRows > 0 && (<TableRow style={{ height: 33 * emptyRows }}><TableCell colSpan={12} /></TableRow>)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[10, 20, 50]}
                        component="div"
                        count={filteredActivos.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage={t('common.rows_per_page')}
                        labelDisplayedRows={({ from, to, count }) => t('common.pagination_info', { from, to, count })}
                    />
                </Paper>
            )}

            <ActivoModal open={isActivoModalOpen} onClose={handleCloseModal} onSave={handleSaveActivo} activo={currentActivo} />

            {currentActivo && (<MovimientoModal open={isMovimientoModalOpen} onClose={handleCloseMovimientoModal} onSave={handleSaveMovimiento} activo={currentActivo} />)}
            <ReporteModal open={isReporteModalOpen} onClose={() => setIsReporteModalOpen(false)} />

            {/* ✅ MODAL DE ACTIVOS RELACIONADOS */}
            <RelatedAssetsModal
                open={isRelatedModalOpen}
                onClose={handleCloseRelatedModal}
                loading={loadingRelated}
                assets={relatedAssetsList}
                parentAssetName={currentActivoForRelated?.etiquetaInventario}
            />

    <Dialog open={isBajaDialogOpen} onClose={() => setIsBajaDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dar de baja activo</DialogTitle>
        <DialogContent dividers>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Estás dando de baja: <strong>{activoParaBaja?.etiquetaInventario}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Esta acción marca el activo como <strong>Retirado</strong>. El historial se conserva.
                </Typography>
            </Box>
            <FormControl fullWidth required sx={{ mt: 1 }}>
                <InputLabel>{t('asset_page.baja_dialog.reason_label')}</InputLabel>
                <Select
                    value={motivoBaja}
                    label={t('asset_page.baja_dialog.reason_label')}
                    onChange={(e) => { setMotivoBaja(e.target.value); setMotivoError(false); }}
                    error={motivoError}
                >
                    <MenuItem value="Dañado irreparable">Dañado irreparable</MenuItem>
                    <MenuItem value="Robo">Robo</MenuItem>
                    <MenuItem value="Venta">Venta</MenuItem>
                    <MenuItem value="Obsoleto">Obsoleto</MenuItem>
                    <MenuItem value="Donación">Donación</MenuItem>
                    <MenuItem value="Otro">Otro</MenuItem>
                </Select>
                {motivoError && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                        {t('asset_page.baja_dialog.reason_required')}
                    </Typography>
                )}
            </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
            <Button onClick={() => setIsBajaDialogOpen(false)}>
                {t('common.cancel')}
            </Button>
            <Button onClick={handleConfirmBaja} variant="contained" color="error">
                {t('asset_page.baja_dialog.confirm_button')}
            </Button>
        </DialogActions>
    </Dialog>
        </Box>
    );
};

export default ActivosPage;