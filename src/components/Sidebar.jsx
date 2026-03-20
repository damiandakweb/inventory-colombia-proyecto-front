import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, Divider, Drawer, Badge, Tooltip, IconButton } from '@mui/material';
import { Dashboard, Computer, ListAlt, People, Logout, LocationOn, Style as CategoryIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../services/useAuth';
import { getSolicitudesPendientesCount } from '../services/solicitudService';
import defaultAvatar from '../assets/avatar_default.png';
import { useTranslation } from 'react-i18next';

// ✅ El componente ahora recibe props del MainLayout
const Sidebar = ({ drawerWidth, mobileOpen, handleDrawerToggle }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [notificationCount, setNotificationCount] = React.useState(0);

    React.useEffect(() => {
        const fetchCount = async () => {
            if (user) {
                try {
                    const response = await getSolicitudesPendientesCount();
                    setNotificationCount(response.data);
                } catch (error) {
                    console.error("Error al obtener notificaciones:", error);
                }
            }
        };
        fetchCount();
        const intervalId = setInterval(fetchCount, 60000);
        return () => clearInterval(intervalId);
    }, [user]);

    // Dejamos solo la parte variable de la clave, que es única
    const menuItems = [
        { key: 'dashboard', icon: <Dashboard />, path: '/dashboard' },
        { key: 'assets', icon: <Computer />, path: '/activos' },
        { key: 'requests', icon: <ListAlt />, path: '/solicitudes' },
        { key: 'users', icon: <People />, path: '/usuarios' },
        { key: 'locations', icon: <LocationOn />, path: '/ubicaciones' },
        { key: 'categories', icon: <CategoryIcon />, path: '/categorias' },
    ];

    // ✅ Creamos una variable con el contenido del Sidebar para no repetirlo
    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header del Sidebar */}
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {t('sidebar.header')}
                </Typography>
            </Box>

            {/* Lista de Navegación */}
            <Box sx={{ flex: 1, py: 2 }}>
                <List sx={{ p: 0 }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        const translationKey = `sidebar.${item.key}`;
                        return (
                            <ListItem key={translationKey} disablePadding>
                                <ListItemButton component={Link} to={item.path} selected={isActive} sx={{ borderRadius: 1, mx: 1, mb: 0.5, '&.Mui-selected': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }, '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } }}>
                                    <ListItemIcon sx={{ color: 'white', minWidth: 36 }}>{item.icon}</ListItemIcon>
                                    <ListItemText primary={t(translationKey)} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            {/* Perfil de Usuario y Logout */}
            <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                        <Avatar src={defaultAvatar} sx={{ width: 40, height: 40 }} />
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                                {user ? user.nombre : 'sidebar.guest'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                {user ? t(`roles.${user.rol}`, user.rol) : t('sidebar.no_role')}
                            </Typography>
                        </Box>
                    </Box>
                    <Tooltip title={t('sidebar.pending_requests_tooltip')}>
                        <IconButton component={Link} to="/solicitudes" sx={{ color: 'white' }}>
                            <Badge badgeContent={notificationCount} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                </Box>
                <ListItemButton onClick={logout} sx={{ borderRadius: 1, '&:hover': { bgcolor: 'rgba(255,0,0,0.2)' } }}>
                    <ListItemIcon sx={{ color: 'white' }}><Logout /></ListItemIcon>
                    <ListItemText primary={t('sidebar.logout')} />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            aria-label="mailbox folders"
        >
            {/* Sidebar para móvil (temporal y flotante) */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#1e293b', color: 'white' },
                }}
            >
                {drawerContent}
            </Drawer>
            {/* Sidebar para escritorio (permanente y fijo) */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: '#1e293b', color: 'white' },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Sidebar;