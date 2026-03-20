import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl,
    InputLabel, Select, MenuItem, Box, CircularProgress, FormHelperText, TextField
} from '@mui/material';
import { getActivoByUsuarioAndCategoria } from '../services/activoService';
import { useTranslation } from 'react-i18next';

const DevolucionModal = ({ open, onClose, onConfirm, solicitud }) => {
    const { t } = useTranslation();
    const [activosDelUsuario, setActivosDelUsuario] = useState([]);
    const [selectedActivoId, setSelectedActivoId] = useState('');
    const [observacion, setObservacion] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && solicitud) {
            setLoading(true);
            setSelectedActivoId(''); // Resetea la selección
            setObservacion('');

            getActivoByUsuarioAndCategoria(solicitud.idUsuario, solicitud.idCategoria)
                .then(response => {
                    setActivosDelUsuario(response.data);
                })
                .catch(err => console.error("Error fetching user assets", err))
                .finally(() => setLoading(false));
        }
    }, [open, solicitud]);

    const handleConfirm = () => {
        // Pasamos un objeto con los datos del formulario
        onConfirm({
            activoId: selectedActivoId,
            observacion: observacion
        });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>{t('return_modal.title')}</DialogTitle>
            <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: '16px !important' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <FormControl fullWidth>
                            <InputLabel>{t('return_modal.asset_to_return_label')}</InputLabel>
                            <Select
                                value={selectedActivoId}
                                label={t('return_modal.asset_to_return_label')}
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
                        <TextField
                            label={t('return_modal.observation_label')}
                            value={observacion}
                            onChange={(e) => setObservacion(e.target.value)}
                            multiline
                            rows={3}
                            fullWidth
                        />
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('common.cancel')}</Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={!selectedActivoId || loading}
                >
                    {t('return_modal.confirm_button')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DevolucionModal;
