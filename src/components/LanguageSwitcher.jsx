import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Box, Typography, ButtonGroup } from '@mui/material';

/**
 * Un componente reutilizable que muestra botones para cambiar entre
 * español e inglés.
 */
const LanguageSwitcher = () => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {t('languages.change_language')}:
            </Typography>
            <ButtonGroup variant="outlined" size="small" aria-label="Language selector">
                <Button
                    onClick={() => changeLanguage('es')}
                    variant={i18n.language === 'es' ? 'contained' : 'outlined'}
                >
                    {t('languages.es')}
                </Button>
                <Button
                    onClick={() => changeLanguage('en')}
                    variant={i18n.language.startsWith('en') ? 'contained' : 'outlined'}
                >
                    {t('languages.en')}
                </Button>
            </ButtonGroup>
        </Box>
    );
};

export default LanguageSwitcher;