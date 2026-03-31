import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box,
    Grid, FormControl, InputLabel, Select, MenuItem, Typography, Chip, Autocomplete,
    FormHelperText, Divider, IconButton, CircularProgress, Card, CardContent, Paper
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LinkIcon from '@mui/icons-material/Link';

// Servicios
import { getAllCategorias, getAllEstados, getAllActivos, enlazarActivo, desenlazarActivo, getActivosRelacionados } from '../services/activoService';
import { getAllUsers } from "../services/usuarioService.js";
import { useNotification } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import { listaDePaises } from '../utils/paises';

const ActivoModal = ({ open, onClose, onSave, activo }) => {
    const { t, i18n } = useTranslation();
    const { showNotification } = useNotification();

    // --- ESTADOS ---
    const initialState = {
        numeroDeSerie: '', etiquetaInventario: '', marca: '', modelo: '',
        idCategoria: '', idEstado: '', idUsuarioActual: '', fechaCompra: '',
        fechaGarantia: '', pais: '', activosRelacionados: []
    };
    const [formData, setFormData] = useState(initialState);
    const [selectedUser, setSelectedUser] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [estados, setEstados] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [todosLosActivos, setTodosLosActivos] = useState([]); // Para Autocomplete
    const [activoParaEnlazar, setActivoParaEnlazar] = useState(null);
    const [enlazando, setEnlazando] = useState(false);
    const [loadingRelated, setLoadingRelated] = useState(false);
    const [loadingInitialData, setLoadingInitialData] = useState(false); // Para carga inicial

    // --- FUNCIONES DE FECHA ---
    const formatearFecha = (fechaString) => {
        if (!fechaString) return '';
        // Intenta crear la fecha asumiendo formato YYYY-MM-DD
        const parts = fechaString.split('-');
        if (parts.length !== 3) return fechaString; // Devuelve original si no es formato esperado
        // Usar UTC para evitar problemas de zona horaria al crear solo con año, mes, día
        const correctedDate = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
        const language = i18n.language;
        return correctedDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }); // Especificar UTC
    };

    const calcularDiasGarantia = (fechaGarantia) => {
        if (!fechaGarantia) return null;
        const hoy = new Date();
        // Asume fechaGarantia es YYYY-MM-DD
        const parts = fechaGarantia.split('-');
        if (parts.length !== 3) return null;
        const fechaGarantiaObj = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
        hoy.setUTCHours(0, 0, 0, 0); // Comparar en UTC
        return Math.ceil((fechaGarantiaObj - hoy) / (1000 * 60 * 60 * 24));
    };

    const obtenerColorGarantia = (diasRestantes) => {
        if (diasRestantes === null) return 'default';
        if (diasRestantes < 0) return 'error';
        if (diasRestantes <= 30) return 'warning';
        return 'success';
    };

    const obtenerTextoGarantia = (diasRestantes) => {
        if (diasRestantes === null) return t('asset_page.warranty.no_warranty');
        if (diasRestantes < 0) return t('asset_page.warranty.expired');
        // Asegurarse que t() reciba el número correcto
        if (diasRestantes <= 30) return t('asset_page.warranty.days_remaining', { days: diasRestantes });
        return t('asset_page.warranty.valid');
    };

    const diasGarantia = calcularDiasGarantia(formData.fechaGarantia);

    // --- EFECTO PARA CARGAR DATOS (REESTRUCTURADO) ---
    useEffect(() => {
        if (!open) {
            // Limpia todo al cerrar
            setFormData(initialState);
            setSelectedUser(null);
            setActivoParaEnlazar(null);
            setCategorias([]);
            setEstados([]);
            setUsuarios([]);
            setTodosLosActivos([]);
            setLoadingInitialData(false); // Asegurar que el loading se quite
            setLoadingRelated(false);
            return;
        }

        let isMounted = true;
        setLoadingInitialData(true);
        setLoadingRelated(false);

        const fetchInitialData = async () => {
            try {
                // 1. Cargamos datos generales
                // Usamos getAllActivos solo para el autocomplete de enlazar
                const [catRes, estRes, userRes, allActivosRes] = await Promise.all([
                    getAllCategorias(), getAllEstados(), getAllUsers(), getAllActivos()
                ]);

                if (!isMounted) return;

                setCategorias(catRes.data || []);
                setEstados(estRes.data || []);
                setUsuarios(userRes.data || []);
                setTodosLosActivos(allActivosRes.data || []); // Para el Autocomplete

                // 2. Preparamos estado inicial del formulario
                let initialFormState = initialState;
                let initialSelectedUser = null;

                if (activo && activo.idEquipo) { // Modo Edición
                    initialFormState = {
                        numeroDeSerie: activo.numeroDeSerie || '',
                        etiquetaInventario: activo.etiquetaInventario || '',
                        marca: activo.marca || '',
                        modelo: activo.modelo || '',
                        idCategoria: activo.idCategoria || '',
                        idEstado: activo.idEstado || '',
                        idUsuarioActual: activo.idUsuarioActual || '',
                        fechaCompra: activo.fechaCompra ? activo.fechaCompra.split('T')[0] : '',
                        fechaGarantia: activo.fechaGarantia ? activo.fechaGarantia.split('T')[0] : '',
                        pais: activo.pais || '',
                        activosRelacionados: [] // Empezamos vacío
                    };
                    if (activo.idUsuarioActual) {
                        initialSelectedUser = userRes.data?.find(u => u.idUsuario === activo.idUsuarioActual) || null;
                    }
                } else { // Modo Creación
                }

                // 3. Establecemos estado inicial del formulario y usuario
                setFormData(initialFormState);
                setSelectedUser(initialSelectedUser);
                setLoadingInitialData(false); // Terminamos carga inicial

                // 4. SI es modo edición, AHORA cargamos los relacionados
                if (activo && activo.idEquipo) {
                    setLoadingRelated(true);
                    try {
                        const relatedRes = await getActivosRelacionados(activo.idEquipo);
                        if (!isMounted) return;
                        const uniqueRelated = eliminarDuplicados(relatedRes.data || [], 'idEquipo');
                        setFormData(prev => ({ ...prev, activosRelacionados: uniqueRelated }));
                    } catch (relatedError) {
                        if (isMounted) showNotification(t('asset_page.notifications.load_related_error'), 'error');
                    } finally {
                        if (isMounted) setLoadingRelated(false);
                    }
                }

            } catch (error) {
                if (isMounted) {
                    showNotification(t('notifications.error_loading_data'), 'error');
                    setLoadingInitialData(false);
                }
            }
        };

        fetchInitialData();

        return () => {
            isMounted = false; // Función de limpieza
        };

    }, [activo, open]); // Quitar dependencias no usadas directamente aquí


    // --- MANEJADORES DE EVENTOS ---
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleUserChange = (event, newValue) => {
        setSelectedUser(newValue);
        setFormData({ ...formData, idUsuarioActual: newValue ? newValue.idUsuario : '' });
    };

    const eliminarDuplicados = (array, key = 'idEquipo') => {
        if (!Array.isArray(array)) return []; // Asegurar que sea un array
        const seen = new Set();
        return array.filter(item => {
            // Asegurarse de que el item y la key existen
            const keyValue = item && item[key];
            if (keyValue === undefined || keyValue === null || seen.has(keyValue)) return false;
            seen.add(keyValue);
            return true;
        });
    };

    const handleEnlazar = async () => {
        if (!activoParaEnlazar || !activo || !activo.idEquipo) return; // Añadir chequeo de activo.idEquipo
        // Re-chequear la lista actual en formData antes de añadir
        const yaEnlazado = formData.activosRelacionados?.some(rel => rel && rel.idEquipo === activoParaEnlazar.idEquipo);
        if (yaEnlazado) {
            showNotification(t('asset_page.modal.already_linked'), 'warning');
            return;
        }

        setEnlazando(true);
        try {
            await enlazarActivo(activo.idEquipo, activoParaEnlazar.idEquipo);
            // Volver a fetchear los relacionados para asegurar consistencia O añadir localmente
            const relatedToAdd = todosLosActivos.find(a => a.idEquipo === activoParaEnlazar.idEquipo);
            if (relatedToAdd) {
                setFormData(prev => ({
                    ...prev,
                    activosRelacionados: eliminarDuplicados([...(prev.activosRelacionados || []), relatedToAdd])
                }));
            } else {
                // Si no lo encontramos en la lista completa (raro), recargamos
                const relatedRes = await getActivosRelacionados(activo.idEquipo);
                setFormData(prev => ({ ...prev, activosRelacionados: eliminarDuplicados(relatedRes.data || []) }));
            }
            setActivoParaEnlazar(null); // Limpiamos el buscador
            showNotification(t('asset_page.modal.link_success'), 'success');
        } catch (error) {
            showNotification(t('asset_page.modal.link_error', { error: error.message || 'Error desconocido' }), 'error');
        } finally {
            setEnlazando(false);
        }
    };

    const handleDesenlazar = async (relacionadoId) => {
        if (!activo || !activo.idEquipo || !relacionadoId) return;

        // Mostrar confirmación (opcional pero recomendado)
        // if (!window.confirm(t('asset_page.modal.confirm_unlink'))) return;

        // No necesitamos poner 'enlazando' a true aquí, es una operación separada
        try {
            await desenlazarActivo(activo.idEquipo, relacionadoId);
            // Actualizamos la lista localmente
            setFormData(prev => ({
                ...prev,
                activosRelacionados: (prev.activosRelacionados || []).filter(a => a && a.idEquipo !== relacionadoId)
            }));
            showNotification(t('asset_page.modal.unlink_success'), 'success');
        } catch (error) {
            showNotification(t('asset_page.modal.unlink_error', { error: error.message || 'Error desconocido' }), 'error');
        }
    };

    const handleSave = () => {
        const dataToSend = { ...formData };
        // No enviamos la lista de relacionados al guardar el activo principal
        // El backend maneja las relaciones por separado (enlazar/desenlazar)
        delete dataToSend.activosRelacionados;
        onSave(dataToSend, activo ? activo.idEquipo : null);
    };

    // --- LÓGICA DE VALIDACIÓN ---
    const validation = {
        isEtiquetaInventarioInvalid: !formData.etiquetaInventario,
        isFechaCompraInvalid: !formData.fechaCompra,
        // Añadir más validaciones si son necesarias (ej. categoría, estado)
        isCategoriaInvalid: !formData.idCategoria,
        isEstadoInvalid: !formData.idEstado,
    };
    // Revisa todas las validaciones
    const isFormInvalid = Object.values(validation).some(isInvalid => isInvalid);

    // --- JSX ---
    return (
        <Dialog open={!!open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {activo ? t('asset_page.modal.edit_title') : t('asset_page.modal.create_title')}
                </Typography>
            </DialogTitle>
            <DialogContent>
                {/* Indicador de carga inicial */}
                {loadingInitialData ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', gap: 1 }}>
                        <CircularProgress />
                        <Typography>{t('common.loading')}...</Typography>
                    </Box>
                ) : (
                    <Box sx={{ pt: 2 }}>
                        {/* SECCIÓN 1: USUARIO ASIGNADO */}
                        <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                    {t('asset_page.modal.assigned_user')}
                                </Typography>
                            </Box>
                            <Autocomplete
                                options={usuarios}
                                getOptionLabel={(option) => option.nombre || ''}
                                value={selectedUser}
                                onChange={handleUserChange}
                                isOptionEqualToValue={(option, value) => option && value && option.idUsuario === value.idUsuario}
                                renderInput={(params) => (
                                    <TextField {...params} label={t('asset_page.modal.assigned_user')} margin="dense" size="medium" />
                                )}
                                noOptionsText={t('asset_page.modal.no_users_found')}
                            />
                        </Paper>

                        {/* SECCIÓN 2: INFORMACIÓN BÁSICA DEL ACTIVO */}
                        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                    {t('asset_page.modal.basic_info_title') || 'Información Básica'}
                                </Typography>
                            </Box>
                            <Grid container spacing={3}>
                                {/* País */}
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth margin="dense" required>
                                        <InputLabel id="pais-select-label">{t('asset_page.modal.country_label')}</InputLabel>
                                        <Select
                                            labelId="pais-select-label" name="pais" value={formData.pais || ''}
                                            label={t('asset_page.modal.country_label')} onChange={handleChange}
                                        >
                                            <MenuItem value=""><em>{t('asset_page.modal.select_country')}</em></MenuItem>
                                            {listaDePaises.map((pais) => (
                                                <MenuItem key={pais.code} value={pais.code}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <img loading="lazy" width="20" src={`https://flagcdn.com/w20/${pais.code.toLowerCase()}.png`} alt="" />
                                                        {pais.name} ({pais.code})
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                {/* Etiqueta Inventario */}
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        margin="dense" label={t('asset_page.modal.inventory_label')} name="etiquetaInventario"
                                        value={formData.etiquetaInventario || ''} onChange={handleChange} fullWidth required size="medium"
                                        error={validation.isEtiquetaInventarioInvalid}
                                        helperText={validation.isEtiquetaInventarioInvalid ? t('asset_page.modal.required_field') : ''}
                                    />
                                </Grid>
                                {/* Número de Serie */}
                                <Grid item xs={12} sm={6}>
                                    <TextField margin="dense" label={t('common.serial_number')} name="numeroDeSerie" value={formData.numeroDeSerie || ''} onChange={handleChange} fullWidth size="medium" />
                                </Grid>
                                {/* Marca */}
                                <Grid item xs={12} sm={6}>
                                    <TextField margin="dense" label={t('common.brand')} name="marca" value={formData.marca || ''} onChange={handleChange} fullWidth size="medium" />
                                </Grid>
                                {/* Modelo */}
                                <Grid item xs={12} sm={6}>
                                    <TextField margin="dense" label={t('common.model')} name="modelo" value={formData.modelo || ''} onChange={handleChange} fullWidth size="medium" />
                                </Grid>
                                {/* Categoría */}
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth margin="dense" size="medium" required error={validation.isCategoriaInvalid}>
                                        <InputLabel id="categoria-label">{t('common.category')}</InputLabel>
                                        <Select labelId="categoria-label" name="idCategoria" value={formData.idCategoria || ''} label={t('common.category')} onChange={handleChange} >
                                            <MenuItem value="" disabled><em>Selecciona una categoría</em></MenuItem>
                                            {categorias.map((cat) => (
                                                <MenuItem key={cat.idCategoria} value={cat.idCategoria}>
                                                    {i18n.language === 'en' && cat.nombreEn ? cat.nombreEn : cat.nombreCategoria}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {validation.isCategoriaInvalid && <FormHelperText>{t('asset_page.modal.required_field')}</FormHelperText>}
                                    </FormControl>
                                </Grid>
                                {/* Estado */}
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth margin="dense" size="medium" required error={validation.isEstadoInvalid}>
                                        <InputLabel id="estado-label">{t('common.status')}</InputLabel>
                                        <Select labelId="estado-label" name="idEstado" value={formData.idEstado || ''} label={t('common.status')} onChange={handleChange} >
                                            <MenuItem value="" disabled><em>Selecciona un estado</em></MenuItem>
                                            {estados.map((est) => (
                                                <MenuItem key={est.idEstado} value={est.idEstado}>
                                                    {t(`asset_states.${est.nombreEstado?.toUpperCase().replace(/ /g, '_')}`, { defaultValue: est.nombreEstado })}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {validation.isEstadoInvalid && <FormHelperText>{t('asset_page.modal.required_field')}</FormHelperText>}
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* SECCIÓN 3: FECHAS Y GARANTÍA */}
                        <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: 'info.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <CalendarTodayIcon sx={{ mr: 1, color: 'info.main' }} />
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                    {t('asset_page.modal.date_section_title')}
                                </Typography>
                            </Box>
                            <Grid container spacing={3}>
                                {/* Fecha Compra */}
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        margin="dense" label={t('asset_page.modal.purchase_date')} type="date" fullWidth
                                        InputLabelProps={{ shrink: true }} name="fechaCompra" value={formData.fechaCompra || ''}
                                        onChange={handleChange} required size="medium" error={validation.isFechaCompraInvalid}
                                        helperText={validation.isFechaCompraInvalid ? t('asset_page.modal.purchase_date_required') : ''}
                                    />
                                    {formData.fechaCompra && ( <Box sx={{ mt: 1 }}><Typography variant="body2" color="text.secondary"> {formatearFecha(formData.fechaCompra)} </Typography></Box> )}
                                </Grid>
                                {/* Fecha Garantía */}
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        margin="dense" label={t('asset_page.modal.warranty_date')} type="date" fullWidth
                                        InputLabelProps={{ shrink: true }} name="fechaGarantia" value={formData.fechaGarantia || ''}
                                        onChange={handleChange} size="medium"
                                    />
                                    {formData.fechaGarantia && (
                                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" color="text.secondary"> {formatearFecha(formData.fechaGarantia)} </Typography>
                                            <Chip label={obtenerTextoGarantia(diasGarantia)} color={obtenerColorGarantia(diasGarantia)} size="small" />
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* SECCIÓN 4: ACTIVOS RELACIONADOS (Solo en modo edición) */}
                        {activo && (
                            <Paper elevation={1} sx={{ p: 3, bgcolor: 'secondary.50' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <LinkIcon sx={{ mr: 1, color: 'secondary.main' }} />
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                        {t('asset_page.modal.related_assets_title')}
                                    </Typography>
                                </Box>
                                {/* Lista de ya relacionados */}
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                                        {t('asset_page.modal.linked_assets_subtitle') || 'Activos Enlazados'}
                                    </Typography>
                                    {loadingRelated ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2, gap: 1 }}>
                                            <CircularProgress size={24} color="secondary" />
                                            <Typography variant="body2" color="text.secondary">{t('common.loading')}...</Typography>
                                        </Box>
                                    ) : formData.activosRelacionados && formData.activosRelacionados.length > 0 ? (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {eliminarDuplicados(formData.activosRelacionados).map((rel) => { // No necesitamos index si usamos idEquipo
                                                // Chequeo extra por si 'rel' es null/undefined dentro del array
                                                if (!rel || !rel.idEquipo) return null;
                                                const label = `${rel.etiquetaInventario || t('asset_page.table_data.no_label')} (${rel.marca || ''} ${rel.modelo || ''})`;
                                                return (
                                                    <Chip key={`relacionado-${rel.idEquipo}`} label={label} onDelete={() => handleDesenlazar(rel.idEquipo)}
                                                          color="secondary" variant="outlined" size="medium" sx={{ fontWeight: 'medium' }} />
                                                );
                                            })}
                                        </Box>
                                    ) : (
                                        <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'center' }}>
                                            <Typography variant="body1" color="text.secondary">{t('asset_page.modal.no_linked_assets')}</Typography>
                                        </Box>
                                    )}
                                </Box>
                                {/* Buscador para añadir */}
                                <Box>
                                    <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                                        {t('asset_page.modal.add_linked_asset_subtitle') || 'Añadir Nuevo Enlace'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Autocomplete
                                            fullWidth size="medium"
                                            options={todosLosActivos.filter(a =>
                                                a && activo && a.idEquipo !== activo.idEquipo && // Asegurar que 'a' y 'activo' existen
                                                !(formData.activosRelacionados || []).some(rel => rel && a && rel.idEquipo === a.idEquipo) // Asegurar que 'rel' y 'a' existen
                                            )}
                                            getOptionLabel={(option) => `[${option.idEquipo || 'Sin ID'}] ${option.etiquetaInventario || 'Sin etiqueta'} - ${option.marca || ''} ${option.modelo || ''}`}
                                            value={activoParaEnlazar}
                                            onChange={(event, newValue) => setActivoParaEnlazar(newValue)}
                                            isOptionEqualToValue={(option, value) => option && value && option.idEquipo === value.idEquipo}
                                            renderInput={(params) => <TextField {...params} label={t('asset_page.modal.search_to_link')} />}
                                            noOptionsText={t('asset_page.modal.no_assets_to_link')}
                                            renderOption={(props, option) => ( // Quitar state si no se usa
                                                <li {...props} key={`autocomplete-option-${option.idEquipo}`}>
                                                    <Box>
                                                        <Typography variant="body2"><strong>{option.etiquetaInventario || t('asset_page.table_data.no_label')}</strong></Typography>
                                                        <Typography variant="caption" color="text.secondary">ID: {option.idEquipo} | {option.marca || ''} {option.modelo || ''}</Typography>
                                                    </Box>
                                                </li>
                                            )}
                                        />
                                        <Button
                                            variant="contained" color="secondary" onClick={handleEnlazar}
                                            disabled={!activoParaEnlazar || enlazando}
                                            startIcon={enlazando ? <CircularProgress size={20} /> : <AddCircleOutlineIcon />}
                                            sx={{ minWidth: 120, height: 56 }} >
                                            {enlazando ? t('common.loading') : t('asset_page.modal.common_link')}
                                        </Button>
                                    </Box>
                                </Box>
                            </Paper>
                        )}
                    </Box>
                )} {/* Fin del ternario loadingInitialData */}
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 2 }}>
                <Button onClick={onClose} size="large" sx={{ mr: 2 }}>{t('common.cancel')}</Button>
                <Button
                    onClick={handleSave} variant="contained"
                    disabled={isFormInvalid || loadingInitialData || loadingRelated || enlazando} // Deshabilitar mientras carga o enlaza
                    size="large" sx={{ minWidth: 120 }} >
                    {t('common.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ActivoModal;