import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const UbicacionModal = ({ open, onClose, onSave, ubicacion }) => {
    const { t } = useTranslation();
    const [nombre, setNombre] = useState('');
    const isEditMode = !!ubicacion;

    useEffect(() => {
        if (open) {
            setNombre(ubicacion ? ubicacion.nombreUbicacion : '');
        }
    }, [open, ubicacion]);

    const handleSave = () => {
        if (nombre.trim() === '') return;
        onSave({ nombreUbicacion: nombre.trim() }, ubicacion ? ubicacion.idUbicacion : null);
    };

    const isInvalid = nombre.trim() === '';

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {isEditMode
                    ? t('locations_page.modal.edit_title')
                    : t('locations_page.modal.create_title')}
            </DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="nombreUbicacion"
                    label={t('locations_page.modal.name_label')}
                    type="text"
                    fullWidth
                    variant="standard"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    error={isInvalid}
                    helperText={isInvalid ? t('locations_page.modal.required_field') : ""}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('common.cancel')}</Button>
                <Button
                    onClick={handleSave}
                    disabled={isInvalid}
                    variant="contained"
                >
                    {t('common.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UbicacionModal;