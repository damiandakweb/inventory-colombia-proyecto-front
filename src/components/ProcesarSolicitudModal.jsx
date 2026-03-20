import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
    Box, Select, MenuItem, InputLabel, FormControl, Typography, Divider, CircularProgress, FormHelperText
} from '@mui/material';
import { getActivosDisponiblesByCategoria, getActivoByUsuarioAndCategoria } from '../services/activoService';
import { getAllUbicaciones } from '../services/ubicacionService';
import { useTranslation } from 'react-i18next';

const ProcesarSolicitudModal = ({ open, onClose, onSave, solicitud }) => {
    const { t } = useTranslation();
    const initialState = { idActivoViejo: '', idActivoNuevo: '', idUbicacion: '', observacion: '' };

    const [formData, setFormData] = useState(initialState);
    const [activosDelUsuario, setActivosDelUsuario] = useState([]);
    const [activosDisponibles, setActivosDisponibles] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    // 👇 PASO 1: Determinar el tipo de solicitud
    const isNewRequest = solicitud?.tipoSolicitud === 'Solicitud de Equipo Nuevo';

    useEffect(() => {
        if (open && solicitud) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    // 👇 PASO 2: Carga de datos condicional
                    const fetchPromises = [
                        getActivosDisponiblesByCategoria(solicitud.idCategoria),
                        getAllUbicaciones()
                    ];

                    // Solo busca los activos del usuario si NO es una solicitud nueva
                    if (!isNewRequest) {
                        fetchPromises.push(getActivoByUsuarioAndCategoria(solicitud.idUsuario, solicitud.idCategoria));
                    }

                    const responses = await Promise.all(fetchPromises);

                    setActivosDisponibles(responses[0].data);
                    setUbicaciones(responses[1].data);

                    // Si hubo una tercera llamada, actualiza los activos del usuario
                    if (responses.length > 2) {
                        setActivosDelUsuario(responses[2].data);
                    } else {
                        setActivosDelUsuario([]); // Asegúrate de que esté vacío para solicitudes nuevas
                    }

                } catch (error) {
                    console.error("Error cargando datos para procesar:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
            setFormData(initialState);
        }
    }, [open, solicitud, isNewRequest]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        // 👇 PASO 3: Lógica de guardado adaptable
        const dataFinal = {
            idActivoNuevo: formData.idActivoNuevo,
            // Si es una solicitud nueva, idActivoViejo es null. Si no, usa el valor del formulario
            idActivoViejo: isNewRequest ? null : formData.idActivoViejo,
            idUbicacion: formData.idUbicacion,
            observacion: formData.observacion,
            idUsuario: solicitud.idUsuario // Envía también el id del usuario
        };
        onSave(dataFinal, solicitud.idSolicitud);
    };

    const isFormValid = formData.idActivoNuevo && formData.idUbicacion && (!isNewRequest ? formData.idActivoViejo : true);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{t('process_request_modal.title', { id: solicitud?.idSolicitud })}</DialogTitle>
            <DialogContent dividers>
                {/* ... El box de información no cambia ... */}

                {loading ? <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress /></Box> : (
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>

                        {/* 👇 PASO 4: Renderizado condicional del componente */}
                        {!isNewRequest && activosDelUsuario.length > 0 && (
                            <FormControl fullWidth required>
                                <InputLabel>{t('process_request_modal.return_asset_label')}</InputLabel>
                                <Select name="idActivoViejo" value={formData.idActivoViejo} onChange={handleChange} label={t('process_request_modal.return_asset_label')}>
                                    {activosDelUsuario.map((a) => <MenuItem key={a.idEquipo} value={a.idEquipo}>{`ID:${a.idEquipo} - ${a.etiquetaInventario}`}</MenuItem>)}
                                </Select>
                            </FormControl>
                        )}

                        {!isNewRequest && activosDelUsuario.length === 0 && (
                            <Typography color="text.secondary">{t('process_request_modal.user_has_no_asset_message')}</Typography>
                        )}

                        <FormControl fullWidth required>
                            <InputLabel>{isNewRequest ? t('process_request_modal.assign_asset_label') : t('process_request_modal.replace_asset_label')}</InputLabel>
                            <Select name="idActivoNuevo" value={formData.idActivoNuevo} onChange={handleChange} label={isNewRequest ? t('process_request_modal.assign_asset_label') : t('process_request_modal.replace_asset_label')}>
                                {activosDisponibles.map((a) => <MenuItem key={a.idEquipo} value={a.idEquipo}>{`ID:${a.idEquipo} - ${a.etiquetaInventario}`}</MenuItem>)}
                            </Select>
                            {activosDisponibles.length === 0 && <FormHelperText error>{t('process_request_modal.no_available_assets_error')}</FormHelperText>}
                        </FormControl>

                        <FormControl fullWidth required>
                            <InputLabel>{t('process_request_modal.destination_location_label')}</InputLabel>
                            <Select
                                name="idUbicacion"
                                value={formData.idUbicacion}
                                onChange={handleChange}
                                label={t('process_request_modal.destination_location_label')}
                            >
                                {ubicaciones.map((ubi) => (
                                    <MenuItem key={ubi.idUbicacion} value={ubi.idUbicacion}>
                                        {ubi.nombreUbicacion}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Campo de observaciones */}
                        <TextField
                            label={t('process_request_modal.observation_label')}
                            fullWidth
                            multiline
                            rows={3}
                            name="observacion"
                            value={formData.observacion}
                            onChange={handleChange}
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={onClose}>{t('common.cancel')}</Button>
                <Button onClick={handleSave} variant="contained" disabled={!isFormValid || loading}>{t('process_request_modal.complete_button')}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProcesarSolicitudModal;