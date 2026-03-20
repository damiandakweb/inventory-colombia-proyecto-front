import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Button,
    CircularProgress,
    Link,
    Chip,
    Card,
    CardContent,
    Divider,
    Stack
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';
import ComputerIcon from '@mui/icons-material/Computer';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { getDashboardSummary } from '../services/dashboardService';
import StorageIcon from '@mui/icons-material/Storage';
import { useTranslation } from 'react-i18next';

// Colores más corporativos y profesionales
const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2', '#0288d1'];

const StatCard = ({ icon, title, value, color, bgColor }) => (
    <Card
        elevation={2}
        sx={{
            height: '100%',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                elevation: 4,
                borderColor: color,
                transform: 'translateY(-2px)',
            }
        }}
    >
        <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            mb: 1
                        }}
                    >
                        {value}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 500,
                            fontSize: '0.875rem'
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
                <Avatar
                    sx={{
                        bgcolor: bgColor,
                        width: 56,
                        height: 56,
                        border: `2px solid ${color}`,
                    }}
                >
                    {React.cloneElement(icon, { sx: { color: color, fontSize: 24 } })}
                </Avatar>
            </Stack>
        </CardContent>
    </Card>
);

const DashboardPage = () => {
    const { t } = useTranslation();
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getDashboardSummary();
            setSummaryData(response.data);
        } catch (error) {
            console.error("Error al cargar datos del dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading || !summaryData) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <CircularProgress size={50} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            {/* Header */}
            <Paper
                elevation={1}
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0'
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 600,
                                color: 'text.primary',
                                mb: 1
                            }}
                        >
                            {t('dashboard_page.header.title')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {t('dashboard_page.header.subtitle')}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<RefreshIcon />}
                        onClick={fetchData}
                        sx={{
                            backgroundColor: '#1976d2',
                            '&:hover': {
                                backgroundColor: '#1565c0',
                            },
                            borderRadius: '6px',
                            textTransform: 'none',
                            fontWeight: 500
                        }}
                    >
                        {t('dashboard_page.refresh_button')}
                    </Button>
                </Stack>
            </Paper>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3} component={RouterLink} to="/activos" sx={{ textDecoration: 'none' }}>
                    <StatCard icon={<ComputerIcon />} title={t('dashboard_page.stats.total_assets')} value={summaryData.totalActivos} color="#1976d2" bgColor="rgba(25, 118, 210, 0.1)" />
                </Grid>
                <Grid item xs={12} sm={6} md={3} component={RouterLink} to="/usuarios" sx={{ textDecoration: 'none' }}>
                    <StatCard icon={<PeopleIcon />} title={t('dashboard_page.stats.total_users')} value={summaryData.totalUsuarios} color="#2e7d32" bgColor="rgba(46, 125, 50, 0.1)" />
                </Grid>
                <Grid item xs={12} sm={6} md={3} component={RouterLink} to="/solicitudes" state={{ preFiltro: "pendientes" }} sx={{ textDecoration: 'none' }}>
                    <StatCard icon={<ListAltIcon />} title={t('dashboard_page.stats.pending_requests')} value={summaryData.solicitudesPendientes} color="#ed6c02" bgColor="rgba(237, 108, 2, 0.1)" />
                </Grid>
                <Grid item xs={12} sm={6} md={3} component={RouterLink} to="/activos" state={{ preFiltro: "backup" }} sx={{ textDecoration: 'none' }}>
                    <StatCard icon={<StorageIcon />} title={t('dashboard_page.stats.backup_computers')} value={summaryData.computadoresBackup} color="#2e7d32" bgColor="rgba(46, 125, 50, 0.1)" />
                </Grid>
            </Grid>

            {/* Charts and Activity */}
            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Paper
                        elevation={2}
                        sx={{
                            p: 3,
                            height: 480,
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            border: '1px solid #e0e0e0'
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                            <AssignmentIcon sx={{ color: '#1976d2' }} />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary'
                                }}
                            >
                                {t('dashboard_page.charts.assets_by_status')}
                            </Typography>
                        </Stack>
                        <Divider sx={{ mb: 3 }} />
                        <ResponsiveContainer width="100%" height="85%">
                            <PieChart>
                                <Pie
                                    data={summaryData.activosPorEstado}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={110}
                                    innerRadius={0}
                                    paddingAngle={2}
                                    stroke="#fff"
                                    strokeWidth={2}
                                >
                                    {summaryData.activosPorEstado.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <ChartTooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '6px',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Legend
                                    wrapperStyle={{
                                        paddingTop: '20px',
                                        fontSize: '14px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Paper
                        elevation={2}
                        sx={{
                            p: 3,
                            height: 480,
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            border: '1px solid #e0e0e0'
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                            <SyncAltIcon sx={{ color: '#1976d2' }} />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary'
                                }}
                            >
                                {t('dashboard_page.activity.title')}
                            </Typography>
                        </Stack>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ height: '85%', overflow: 'auto' }}>
                            <List sx={{ p: 0 }}>
                                {summaryData.ultimosMovimientos.map((mov, index) => (
                                    <ListItem
                                        key={mov.idMovimiento}
                                        sx={{
                                            mb: 1,
                                            borderRadius: '6px',
                                            backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'transparent',
                                            transition: 'background-color 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: '#f0f0f0',
                                            }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                sx={{
                                                    backgroundColor: COLORS[index % COLORS.length],
                                                    width: 40,
                                                    height: 40
                                                }}
                                            >
                                                <SyncAltIcon sx={{ color: 'white', fontSize: 18 }} />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                                                    {mov.tipoDeMovimiento}{' '}
                                                    <Link
                                                        component={RouterLink}
                                                        // 👇 CORRECCIÓN: Usa el nombre de propiedad que viene de tu API
                                                        // Lo más probable es que sea 'idEquipo'
                                                        to={`/activos/${mov.idEquipo}`}
                                                        sx={{
                                                            color: '#1976d2',
                                                            fontWeight: 600,
                                                            textDecoration: 'none',
                                                            '&:hover': {
                                                                textDecoration: 'underline',
                                                            }
                                                        }}
                                                    >
                                                        {mov.etiquetaActivo}
                                                    </Link>
                                                </Typography>
                                            }
                                            secondary={
                                                <Chip
                                                    label={`Por: ${mov.nombreUsuario}`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.7rem',
                                                        borderColor: '#e0e0e0',
                                                        color: 'text.secondary'
                                                    }}
                                                />
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;