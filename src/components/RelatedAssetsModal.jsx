import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    List, ListItem, ListItemText, Typography, CircularProgress, Box, Chip
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const RelatedAssetsModal = ({ open, onClose, loading, assets, parentAssetName, onAssetClick }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleAssetClick = (asset) => {
        if (asset && asset.idEquipo) {
            navigate(`/activos/${asset.idEquipo}`);
            onClose();
        }
        if (onAssetClick) {
            onAssetClick(asset);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '4px',
                }
            }}
        >
            <DialogTitle sx={{
                fontSize: '1.1rem',
                fontWeight: 500,
                color: '#333',
                borderBottom: '1px solid #e0e0e0',
                py: 2,
            }}>
                {t('related_assets_modal.title', { name: parentAssetName || t('common.this_asset') })}
            </DialogTitle>

            <DialogContent sx={{
                py: 2,
            }}>
                {loading ? (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '150px',
                    }}>
                        <CircularProgress size={40} />
                    </Box>
                ) : (
                    <>
                        {assets && assets.length > 0 ? (
                            <List sx={{ p: 0 }}>
                                {assets.map((asset, index) => (
                                    <ListItem
                                        key={asset.idEquipo}
                                        onClick={() => handleAssetClick(asset)}
                                        sx={{
                                            py: 1.5,
                                            px: 0,
                                            borderBottom: '1px solid #f0f0f0',
                                            '&:last-child': {
                                                borderBottom: 'none',
                                            },
                                            '&:hover': {
                                                backgroundColor: '#fafafa',
                                                cursor: 'pointer',
                                            },
                                        }}
                                    >
                                        <Chip
                                            label={index + 1}
                                            sx={{
                                                width: '32px',
                                                height: '32px',
                                                backgroundColor: '#333',
                                                color: 'white',
                                                fontWeight: 600,
                                                mr: 2,
                                                '& .MuiChip-label': {
                                                    padding: 0,
                                                },
                                            }}
                                        />
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 500,
                                                        color: '#333',
                                                        fontSize: '0.95rem',
                                                    }}
                                                >
                                                    {asset.etiquetaInventario || t('asset_page.table_data.no_label')}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: '#666',
                                                        fontSize: '0.8rem',
                                                        mt: 0.5,
                                                        display: 'block',
                                                    }}
                                                >
                                                    {asset.marca && `${asset.marca}`}
                                                    {asset.marca && asset.modelo && ' • '}
                                                    {asset.modelo && `${asset.modelo}`}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography
                                variant="body2"
                                sx={{
                                    my: 3,
                                    textAlign: 'center',
                                    color: '#999',
                                }}
                            >
                                {t('related_assets_modal.no_related_assets')}
                            </Typography>
                        )}
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{
                py: 1.5,
                px: 2,
                borderTop: '1px solid #e0e0e0',
            }}>
                <Button
                    onClick={onClose}
                    sx={{
                        color: '#0066cc',
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        '&:hover': {
                            backgroundColor: '#f0f0f0',
                        },
                    }}
                >
                    {t('common.cancel')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RelatedAssetsModal;