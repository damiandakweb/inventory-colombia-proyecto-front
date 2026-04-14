import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, Typography, IconButton, Tooltip, TextField, InputAdornment, Link, Chip, Card, CardContent, Stack, useMediaQuery, useTheme } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { getAllUsers, createUser, updateUser, deleteUser } from '../services/usuarioService';
import UsuarioModal from '../components/UsuarioModal';
import { useNotification } from "../context/NotificationContext.jsx";

const getRolColor = (rol) => {
    switch (rol?.toUpperCase()) {
        case 'ADMIN': return 'info';
        case 'ALMACENISTA': return 'warning';
        default: return 'default';
    }
};

const UsuariosPage = () => {
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await getAllUsers();
            setUsuarios(response.data);
        } catch (error) {
            showNotification(t('users_page.notifications.load_error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return usuarios;
        const lowercasedFilter = searchTerm.toLowerCase();
        return usuarios.filter(user =>
            user.nombre.toLowerCase().includes(lowercasedFilter) ||
            user.email.toLowerCase().includes(lowercasedFilter) ||
            user.rol.toLowerCase().includes(lowercasedFilter)
        );
    }, [searchTerm, usuarios]);

    const handleOpenModal = (user = null) => { setCurrentUser(user); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setCurrentUser(null); };

    const handleSaveUser = async (data, id) => {
        try {
            if (id) {
                await updateUser(id, data);
                showNotification(t('users_page.notifications.updated_success'), 'success');
            } else {
                await createUser(data);
                showNotification(t('users_page.notifications.created_success'), 'success');
            }
            fetchUsers();
        } catch (error) {
            const serverError = error.response?.data?.message || t('users_page.notifications.save_error');
            showNotification(serverError, 'error');
        } finally {
            handleCloseModal();
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm(t('users_page.confirmations.delete'))) {
            try {
                await deleteUser(id);
                fetchUsers();
                showNotification(t('users_page.notifications.deleted_success'), 'warning');
            } catch (error) {
                showNotification(t('users_page.notifications.delete_error'), 'error');
            }
        }
    };

    const columns = [
        { field: 'idUsuario', headerName: t('users_page.table_headers.id'), width: 90 },
        {
            field: 'nombre',
            headerName: t('users_page.table_headers.full_name'),
            flex: 1,
            renderCell: (params) => (
                <Link component={RouterLink} to={`/usuarios/${params.row.idUsuario}`} underline="hover">
                    {params.value}
                </Link>
            )
        },
        { field: 'email', headerName: t('users_page.table_headers.email'), flex: 1 },
        { field: 'rol', headerName: t('users_page.table_headers.role'), width: 150 },
        {
            field: 'actions',
            headerName: t('users_page.table_headers.actions'),
            width: 150,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <Tooltip title={t('users_page.tooltips.edit_user')}>
                        <IconButton onClick={() => handleOpenModal(params.row)} color="primary">
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t('users_page.tooltips.delete_user')}>
                        <IconButton onClick={() => handleDeleteUser(params.row.idUsuario)} color="error">
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ p: { xs: 1, sm: 0 }, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" sx={{ fontSize: { xs: '1.4rem', sm: '2rem' } }}>
                    {t('users_page.title')}
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()} size={isMobile ? 'small' : 'medium'}>
                    {t('users_page.add_button')}
                </Button>
            </Box>

            <TextField
                fullWidth
                variant="outlined"
                placeholder={t('users_page.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                    startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
                }}
            />

            {/* ✅ Vista móvil — Cards */}
            {isMobile ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {loading ? (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                            Cargando...
                        </Typography>
                    ) : filteredUsers.map(user => (
                        <Card key={user.idUsuario} elevation={0} sx={{ border: '0.5px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <CardContent sx={{ p: '12px 16px !important' }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Link component={RouterLink} to={`/usuarios/${user.idUsuario}`} underline="hover" sx={{ fontWeight: 500, fontSize: '0.95rem' }}>
                                            {user.nombre}
                                        </Link>
                                        <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: '0.8rem', mt: 0.3 }}>
                                            {user.email}
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" alignItems="center" gap={1} sx={{ ml: 1 }}>
                                        <Chip
                                            label={t(`roles.${user.rol}`, { defaultValue: user.rol })}
                                            size="small"
                                            color={getRolColor(user.rol)}
                                            variant="outlined"
                                            sx={{ fontSize: '0.7rem', height: 22 }}
                                        />
                                        <IconButton onClick={() => handleOpenModal(user)} color="primary" size="small">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteUser(user.idUsuario)} color="error" size="small">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            ) : (
                /* ✅ Vista desktop — DataGrid original */
                <Box sx={{ height: '80vh' }}>
                    <DataGrid
                        rows={filteredUsers}
                        columns={columns}
                        getRowId={(row) => row.idUsuario}
                        loading={loading}
                        initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
                        pageSizeOptions={[10, 20, 50]}
                        checkboxSelection
                        disableRowSelectionOnClick
                    />
                </Box>
            )}

            <UsuarioModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveUser}
                user={currentUser}
            />
        </Box>
    );
};

export default UsuariosPage;