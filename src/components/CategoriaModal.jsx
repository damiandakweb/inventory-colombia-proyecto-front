import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const CategoriaModal = ({ open, onClose, onSave, categoria }) => {
    const { t } = useTranslation();
    const [nombre, setNombre] = useState('');
    const isEditMode = !!categoria;

    useEffect(() => {
        if (open) {
            setNombre(categoria ? categoria.nombreCategoria : '');
        }
    }, [open, categoria]);

    const handleSave = () => {
        if (nombre.trim() === '') return;

        onSave({ nombreCategoria: nombre.trim() }, categoria ? categoria.idCategoria : null);
    };

    // Lógica de validación: el nombre no puede estar vacío
    const isInvalid = nombre.trim() === '';

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                {isEditMode
                    ? t('categories_page.modal.edit_title')
                    : t('categories_page.modal.create_title')}
            </DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="nombreCategoria"
                    label={t('categories_page.modal.name_label')}
                    type="text"
                    fullWidth
                    variant="standard"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    // Añadimos el estado de error y texto de ayuda
                    error={isInvalid}
                    helperText={isInvalid ? t('categories_page.modal.required_field') : ""}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('common.cancel')}</Button>
                <Button
                    onClick={handleSave}
                    // Deshabilitamos el botón si el campo es inválido
                    disabled={isInvalid}
                >
                    {t('common.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CategoriaModal;