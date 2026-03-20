import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getAllUbicaciones, createUbicacion, deleteUbicacion, updateUbicacion } from '../services/ubicacionService';
import { useNotification } from '../context/NotificationContext';
import UbicacionModal from '../components/UbicacionModal';
import { useTranslation } from 'react-i18next';

const UbicacionesPage = () => {
    const { t } = useTranslation();
    const [ubicaciones, setUbicaciones] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUbicacion, setCurrentUbicacion] = useState(null);
    const { showNotification } = useNotification();

    const fetchUbicaciones = async () => {
        try {
            const response = await getAllUbicaciones();
            setUbicaciones(response.data);
        } catch (error) {
            showNotification(t('locations_page.notifications.load_error'), 'error');
        }
    };

    useEffect(() => {
        fetchUbicaciones();
    }, []);

    const handleOpenModal = (ubicacion = null) => {
        setCurrentUbicacion(ubicacion);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUbicacion(null);
    };

    const handleSave = async (data, id) => {
        try {
            if (id) {
                await updateUbicacion(id, data);
                showNotification(t('locations_page.notifications.updated_success'), 'success');
            } else {
                await createUbicacion(data);
                showNotification(t('locations_page.notifications.created_success'), 'success');
            }
            fetchUbicaciones();
        } catch (error) {
            showNotification(t('locations_page.notifications.save_error'), 'error');
        } finally {
            handleCloseModal();
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('locations_page.confirmations.delete'))) {
            try {
                await deleteUbicacion(id);
                showNotification(t('locations_page.notifications.deleted_success'), 'warning');
                fetchUbicaciones();
            } catch (error) {
                showNotification(t('locations_page.notifications.delete_error'), 'error');
            }
        }
    };

    const columns = [
        { field: 'idUbicacion', headerName: t('locations_page.table_headers.id'), width: 90 },
        { field: 'nombreUbicacion', headerName: t('locations_page.table_headers.location_name'), flex: 1 },
        {
            field: 'actions',
            headerName: t('common.actions'),
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <Tooltip title={t('common.edit')}>
                        <IconButton color="primary" onClick={() => handleOpenModal(params.row)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.delete')}>
                        <IconButton color="error" onClick={() => handleDelete(params.row.idUbicacion)}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">{t('locations_page.title')}</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
                    {t('locations_page.add_button')}
                </Button>
            </Box>
            <Box sx={{ height: '70vh', width: '100%' }}>
                <DataGrid
                    rows={ubicaciones}
                    columns={columns}
                    getRowId={(row) => row.idUbicacion}
                    localeText={{
                        footerRowSelected: (count) => t('common.rows_selected', { count }),
                        footerTotalRows: t('common.total_rows'),
                        MuiTablePagination: {
                            labelRowsPerPage: t('common.rows_per_page'),
                            labelDisplayedRows: ({ from, to, count }) => t('common.pagination_info', { from, to, count }),
                        }
                    }}
                />
            </Box>
            <UbicacionModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                ubicacion={currentUbicacion}
            />
        </Box>
    );
};

export default UbicacionesPage;
