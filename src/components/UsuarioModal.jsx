import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

const UsuarioModal = ({ open, onClose, onSave, user }) => {
    const { t } = useTranslation();
    const initialState = { nombre: '', email: '', password: '', rol: 'USUARIO' };
    const [formData, setFormData] = useState(initialState);
    const isEditMode = !!user;

    useEffect(() => {
        if (open) {
            if (user) {
                setFormData({
                    nombre: user.nombre || '',
                    email: user.email || '',
                    password: '',
                    rol: user.rol || 'USUARIO',
                    idUsuario: user.idUsuario || ''
                });
            } else {
                setFormData(initialState);
            }
        }
    }, [user, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(formData, user ? user.idUsuario : null);
    };

    const getValidationErrors = () => {
        const errors = {};
        if (!formData.nombre.trim()) {
            errors.nombre = t('user_modal.validations.name_required');
        }
        if (!formData.email.trim()) {
            errors.email = t('user_modal.validations.email_required');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = t('user_modal.validations.email_invalid');
        }
        if (!isEditMode && !formData.password.trim()) {
            errors.password = t('user_modal.validations.password_required');
        }
        return errors;
    };

    const validationErrors = getValidationErrors();
    const isFormInvalid = Object.keys(validationErrors).length > 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isEditMode ? t('user_modal.edit_title') : t('user_modal.create_title')}</DialogTitle>
            <DialogContent>
                <Box component="form" sx={{ mt: 2 }}>
                    <TextField
                        label={t('user_modal.full_name_label')}
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        autoFocus
                        required
                        error={!!validationErrors.nombre}
                        helperText={validationErrors.nombre || ''}
                    />
                    <TextField
                        label={t('user_modal.email_label')}
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                        error={!!validationErrors.email}
                        helperText={validationErrors.email || ''}
                    />
                    {!isEditMode && (
                        <TextField
                            label={t('user_modal.password_label')}
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            required
                            error={!!validationErrors.password}
                            helperText={validationErrors.password || ''}
                        />
                    )}
                    <TextField
                        label={t('user_modal.role_label')}
                        name="rol"
                        value={formData.rol}
                        fullWidth
                        margin="normal"
                        disabled
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('common.cancel')}</Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={isFormInvalid}
                >
                    {t('common.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UsuarioModal;