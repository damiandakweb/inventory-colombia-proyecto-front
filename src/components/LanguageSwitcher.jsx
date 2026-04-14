import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Box, Typography, ButtonGroup } from '@mui/material';

const LanguageSwitcher = () => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: { xs: 0, sm: 2 }
        }}>
            <Typography variant="caption" sx={{
                display: { xs: 'none', md: 'block' },
                color: { sm: 'inherit' }
            }}>
                {t('languages.change_language')}:
            </Typography>
            <ButtonGroup variant="outlined" size="small">
                <Button
                    onClick={() => changeLanguage('es')}
                    variant={i18n.language === 'es' ? 'contained' : 'outlined'}
                    sx={{
                        color: { xs: 'white', sm: 'inherit' },
                        borderColor: { xs: 'rgba(255,255,255,0.5)', sm: 'inherit' },
                        '&.MuiButton-contained': {
                            bgcolor: { xs: 'rgba(255,255,255,0.2)', sm: 'primary.main' },
                            color: 'white'
                        }
                    }}
                >
                    ES
                </Button>
                <Button
                    onClick={() => changeLanguage('en')}
                    variant={i18n.language.startsWith('en') ? 'contained' : 'outlined'}
                    sx={{
                        color: { xs: 'white', sm: 'inherit' },
                        borderColor: { xs: 'rgba(255,255,255,0.5)', sm: 'inherit' },
                        '&.MuiButton-contained': {
                            bgcolor: { xs: 'rgba(255,255,255,0.2)', sm: 'primary.main' },
                            color: 'white'
                        }
                    }}
                >
                    EN
                </Button>
            </ButtonGroup>
        </Box>
    );
};

export default LanguageSwitcher;