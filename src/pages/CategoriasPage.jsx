import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; // ✅ IMPORTADO: Icono de editar
import { getAllCategorias, createCategoria, deleteCategoria, updateCategoria } from '../services/categoriaService.js'; // ✅ IMPORTADO: updateCategoria
import { useNotification } from '../context/NotificationContext';
import CategoriaModal from "../components/CategoriaModal.jsx";
import { useTranslation } from 'react-i18next';

const CategoriasPage = () => {
    const { t, i18n } = useTranslation();
    const [categorias, setcategorias] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategoria, setCurrentCategoria] = useState(null); // ✅ AÑADIDO: Estado para saber qué categoria editar
    const { showNotification } = useNotification();

    const fetchCategorias = async () => {
        try {
            const response = await getAllCategorias();
            setcategorias(response.data);
        } catch (error) {
            showNotification(t('categories_page.notifications.load_error'), 'error');
        }
    };

    useEffect(() => {
        fetchCategorias();
    }, []);

    // --- Lógica para manejar el modal ---
    const handleOpenModal = (categoria = null) => {
        setCurrentCategoria(categoria);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentCategoria(null);
    };

    const handleSave = async (data, id) => {
        try {
            if (id) {
                await updateCategoria(id, data);
                showNotification(t('categories_page.notifications.updated_success'), 'success');
            } else {
                await createCategoria(data);
                showNotification(t('categories_page.notifications.created_success'), 'success');
            }
            fetchCategorias();
        } catch (error) {
            showNotification(t('categories_page.notifications.save_error'), 'error');
        } finally {
            handleCloseModal();
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('categories_page.confirmations.delete'))) {
            try {
                await deleteCategoria(id);
                showNotification(t('categories_page.notifications.deleted_success'), 'warning');
                fetchCategorias();
            } catch (error) {
                showNotification(t('categories_page.notifications.delete_error'), 'error');
            }
        }
    };

    const columns = [
        { field: 'idCategoria', headerName: t('categories_page.table_headers.id'), width: 90 },
        {
            field: 'nombreCategoria',
            headerName: t('categories_page.table_headers.category_name'),
            flex: 1,
            renderCell: (params) => i18n.language === 'en' && params.row.nombreEn
                ? params.row.nombreEn
                : params.row.nombreCategoria
        },
        {
            field: 'actions', headerName: t('categories_page.table_headers.actions'), width: 120,
            renderCell: (params) => (
                <Box>
                    {/* ✅ AÑADIDO: Botón de Editar */}
                    <IconButton color="primary" onClick={() => handleOpenModal(params.row)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(params.row.idCategoria)}>
                        <DeleteIcon />
                    </IconButton>
                </Box>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">{t('categories_page.title')}</Typography>
                {/* ✅ ACTUALIZADO: El botón ahora usa handleOpenModal */}
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
                    {t('categories_page.title')}
                </Button>
            </Box>
            <Box sx={{ height: '70vh', width: '100%' }}>
                <DataGrid rows={categorias} columns={columns} getRowId={(row) => row.idCategoria} />
            </Box>
            {/* ✅ ACTUALIZADO: Pasamos la Categoria a editar al modal */}
            <CategoriaModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                categoria={currentCategoria}
            />
        </Box>
    );
};

export default CategoriasPage;