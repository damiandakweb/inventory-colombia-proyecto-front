import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
    Select, MenuItem, InputLabel, FormControl, Typography, Box, Chip
} from '@mui/material';
import { useTranslation } from 'react-i18next'; // ✅ 1. Importar hook
import { getAllUsers } from '../services/usuarioService';
import { getAllUbicaciones } from '../services/ubicacionService';

/**
 * Modal para registrar un nuevo movimiento para un activo específico.
 */
const MovimientoModal = ({ open, onClose, onSave, activo, solicitud, tipoMovimientoInicial = '' }) => {
    const { t } = useTranslation();
    const tiposDeMovimiento = ["ASIGNACION", "TRASLADO", "MANTENIMIENTO", "DEVOLUCION", "BAJA"];
    const initialState = {
        tipoDeMovimiento: '',
        idUsuario: '',
        idUbicacion: '',
        observacion: ''
    };

    const [formData, setFormData] = useState(initialState);
    const [usuarios, setUsuarios] = useState([]);
    const [ubicaciones, setUbicaciones] = useState([]);

    useEffect(() => {
        if (open) {
            const fetchDropdownData = async () => {
                try {
                    const [userRes, ubiRes] = await Promise.all([
                        getAllUsers(),
                        getAllUbicaciones()
                    ]);
                    setUsuarios(userRes.data);
                    setUbicaciones(ubiRes.data);
                } catch (error) {
                    console.error("Error cargando datos para el modal de movimiento:", error);
                }
            };
            fetchDropdownData();

            // Lógica para pre-llenar el formulario
            let initialData = { ...initialState };
            if (tipoMovimientoInicial) {
                initialData.tipoDeMovimiento = tipoMovimientoInicial;
            }
            if (solicitud) {
                initialData.idUsuario = solicitud.idUsuario;
            }
            setFormData(initialData);
        }
    }, [open, activo, solicitud, tipoMovimientoInicial]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        const fullData = { ...formData, idEquipo: activo.idEquipo };
        onSave(fullData);
    };

    const isFormValid = formData.tipoDeMovimiento && formData.idUsuario && formData.idUbicacion;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{t('movement_modal.title')}</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">{t('movement_modal.asset_to_modify')}</Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Chip label={`ID: ${activo?.idEquipo}`} size="small" />
                        <Chip label={t('movement_modal.label_chip', { label: activo?.etiquetaInventario })} size="small" />
                    </Box>
                </Box>

                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <FormControl fullWidth required>
                        <InputLabel>{t('movement_modal.movement_type_label')}</InputLabel>
                        <Select
                            name="tipoDeMovimiento"
                            value={formData.tipoDeMovimiento}
                            label={t('movement_modal.movement_type_label')}
                            onChange={handleChange}
                            disabled={!!tipoMovimientoInicial}
                        >
                            {tiposDeMovimiento.map((tipo) => (
                                <MenuItem key={tipo} value={tipo}>
                                    {t(`movement_types.${tipo}`)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth required>
                        <InputLabel>{t('movement_modal.assign_to_user_label')}</InputLabel>
                        <Select
                            name="idUsuario"
                            value={formData.idUsuario}
                            label={t('movement_modal.assign_to_user_label')}
                            onChange={handleChange}
                            // Si el modal viene de una solicitud, el usuario ya está definido y no se puede cambiar
                            disabled={!!solicitud}
                        >
                            {usuarios.map((user) => (
                                <MenuItem key={user.idUsuario} value={user.idUsuario}>
                                    {user.nombre}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth required>
                        <InputLabel>{t('movement_modal.new_location_label')}</InputLabel>
                        <Select
                            name="idUbicacion"
                            value={formData.idUbicacion}
                            label={t('movement_modal.new_location_label')}
                            onChange={handleChange}
                        >
                            {ubicaciones.map((ubi) => (
                                <MenuItem key={ubi.idUbicacion} value={ubi.idUbicacion}>
                                    {ubi.nombreUbicacion}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label={t('movement_modal.observation_label')}
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        name="observacion"
                        value={formData.observacion}
                        onChange={handleChange}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={onClose}>{t('common.cancel')}</Button>
                <Button onClick={handleSave} variant="contained" disabled={!isFormValid}>
                    {t('movement_modal.register_button')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MovimientoModal;