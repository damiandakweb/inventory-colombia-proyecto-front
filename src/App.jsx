import React from 'react';
import AppRouter from './router/AppRouter';
import { Button, Box, Typography, ButtonGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';

// El componente LanguageSwitcher no cambia, está perfecto.
const LanguageSwitcher = () => {
    const { t, i18n } = useTranslation();
    const changeLanguage = (lng) => i18n.changeLanguage(lng);

    return (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">{t('languages.change_language')}:</Typography>
            <ButtonGroup variant="outlined" size="small">
                <Button onClick={() => changeLanguage('es')} variant={i18n.language === 'es' ? 'contained' : 'outlined'}>
                    {t('languages.es')}
                </Button>
                <Button onClick={() => changeLanguage('en')} variant={i18n.language.startsWith('en') ? 'contained' : 'outlined'}>
                    {t('languages.en')}
                </Button>
            </ButtonGroup>
        </Box>
    );
};


function App() {
    // Ahora App es mucho más limpio. Ya no necesita el NotificationProvider.
    return (
        <div>
            <LanguageSwitcher />
            <AppRouter />
        </div>
    );
}

export default App;