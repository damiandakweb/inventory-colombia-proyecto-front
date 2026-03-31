import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

const CategoriaModal = ({ open, onClose, onSave, categoria }) => {
    const { t } = useTranslation();
    const [nombre, setNombre] = useState('');
    const [nombreEn, setNombreEn] = useState('');
    const isEditMode = !!categoria;

    useEffect(() => {
        if (open) {
            setNombre(categoria ? categoria.nombreCategoria : '');
            setNombreEn(categoria ? categoria.nombreEn || '' : '');
        }
    }, [open, categoria]);

    const handleSave = () => {
        if (nombre.trim() === '') return;
        onSave({
            nombreCategoria: nombre.trim(),
            nombreEn: nombreEn.trim() || nombre.trim()
        }, categoria ? categoria.idCategoria : null);
    };

    const isInvalid = nombre.trim() === '';

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {isEditMode
                    ? t('categories_page.modal.edit_title')
                    : t('categories_page.modal.create_title')}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        autoFocus
                        label={t('categories_page.modal.name_label_es')}
                        type="text"
                        fullWidth
                        variant="standard"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        error={isInvalid}
                        helperText={isInvalid ? t('categories_page.modal.required_field') : ''}
                    />
                    <TextField
                        label={t('categories_page.modal.name_label_en')}
                        type="text"
                        fullWidth
                        variant="standard"
                        value={nombreEn}
                        onChange={(e) => setNombreEn(e.target.value)}
                        helperText={t('categories_page.modal.name_en_helper')}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('common.cancel')}</Button>
                <Button onClick={handleSave} disabled={isInvalid} variant="contained">
                    {t('common.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CategoriaModal;