// src/components/MantenimientoModal.jsx

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, Box, CircularProgress, FormHelperText } from '@mui/material';
import { getActivoByUsuarioAndCategoria } from '../services/activoService';
import { useTranslation } from 'react-i18next';

const MantenimientoModal = ({ open, onClose, onConfirm, solicitud }) => {
    const { t } = useTranslation();
    const [activosDelUsuario, setActivosDelUsuario] = useState([]);
    const [selectedActivoId, setSelectedActivoId] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && solicitud) {
            setLoading(true);
            setSelectedActivoId(''); // Resetea la selección
            getActivoByUsuarioAndCategoria(solicitud.idUsuario, solicitud.idCategoria)
                .then(response => {
                    setActivosDelUsuario(response.data);
                })
                .catch(err => console.error("Error fetching user assets", err))
                .finally(() => setLoading(false));
        }
    }, [open, solicitud]);

    const handleConfirm = () => {
        onConfirm(solicitud.idSolicitud, selectedActivoId);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>{t('maintenance_modal.title')}</DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>{t('maintenance_modal.asset_to_send_label')}</InputLabel>
                        <Select
                            value={selectedActivoId}
                            label={t('maintenance_modal.asset_to_send_label')}
                            onChange={(e) => setSelectedActivoId(e.target.value)}
                        >
                            {activosDelUsuario.map(activo => (
                                <MenuItem key={activo.idEquipo} value={activo.idEquipo}>
                                    {`ID: ${activo.idEquipo} - ${activo.etiquetaInventario}`}
                                </MenuItem>
                            ))}
                        </Select>
                        {activosDelUsuario.length === 0 && <FormHelperText error>{t('return_modal.no_assets_error')}</FormHelperText>}
                    </FormControl>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('common.cancel')}</Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={!selectedActivoId || loading}
                >
                    {t('maintenance_modal.confirm_button')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MantenimientoModal;