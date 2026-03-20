import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Grid, FormGroup,
    FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem,
    CircularProgress, Divider, Typography, IconButton, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PageviewIcon from '@mui/icons-material/Pageview';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import ArticleIcon from '@mui/icons-material/Article';
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import { getAllCategorias, getAllEstados } from '../services/activoService';
import { getAllUsers } from '../services/usuarioService';
import { generarReporteDinamico } from '../services/reporteService';
import { useNotification } from '../context/NotificationContext';
import { listaDePaises } from '../utils/paises';

const OPCIONES_COLUMNAS = [
    "ID Equipo", "Etiqueta Inventario", "Marca", "Modelo", "Numero de Serie", "Pais", "Categoria",
    "Estado", "Usuario Actual", "Fecha de Compra", "Fecha Fin Garantia"
];

const ReporteModal = ({ open, onClose }) => {
    const { t } = useTranslation();
    const { showNotification } = useNotification();

    const [selectedColumns, setSelectedColumns] = useState([]);
    const [filters, setFilters] = useState({ idCategoria: '', idEstado: '', idUsuarioActual: '', pais: '' });
    const [categorias, setCategorias] = useState([]);
    const [estados, setEstados] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingFilters, setLoadingFilters] = useState(true);
    const [reportData, setReportData] = useState(null);
    const [rawCsv, setRawCsv] = useState('');

    const allColumnsSelected = selectedColumns.length === OPCIONES_COLUMNAS.length;

    useEffect(() => {
        if (open) {
            setLoadingFilters(true);
            setReportData(null);
            setRawCsv('');
            setSelectedColumns([]);
            const fetchFilterData = async () => {
                try {
                    const [catRes, estRes, userRes] = await Promise.all([
                        getAllCategorias(), getAllEstados(), getAllUsers()
                    ]);
                    setCategorias(catRes.data);
                    setEstados(estRes.data);
                    setUsuarios(userRes.data);
                } catch (error) {
                    showNotification(t('notifications.error_loading_data'), 'error');
                } finally {
                    setLoadingFilters(false);
                }
            };
            fetchFilterData();
        }
    }, [open, t, showNotification]);

    const handleColumnChange = (event) => {
        const { name, checked } = event.target;
        setSelectedColumns(prev =>
            checked ? [...prev, name] : prev.filter(col => col !== name)
        );
    };

    const handleSelectAll = () => {
        if (allColumnsSelected) {
            setSelectedColumns([]);
        } else {
            setSelectedColumns(OPCIONES_COLUMNAS);
        }
    };

    const handleFilterChange = (event) => {
        setFilters({ ...filters, [event.target.name]: event.target.value });
    };

    const handlePreviewReport = async () => {
        if (selectedColumns.length === 0) {
            showNotification(t('report_modal.notifications.no_columns_selected'), 'warning');
            return;
        }
        setLoading(true);
        setReportData(null);
        try {
            const response = await generarReporteDinamico({ columnas: selectedColumns, filtros: filters });
            setRawCsv(response.data);
            const lines = response.data.trim().split('\n');
            const headers = lines[0].split(',');
            const rows = lines.slice(1).map(line => line.split(','));
            setReportData({ headers, rows });
        } catch (error) {
            showNotification(t('report_modal.notifications.preview_error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = () => {
        if (!rawCsv) return;
        const blob = new Blob([`\uFEFF${rawCsv}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'reporte_personalizado.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification(t('report_modal.notifications.download_success'), 'success');
    };

    const handleDownloadExcel = () => {
        if (!reportData) return;
        const worksheetData = [
            reportData.headers.map(h => t(`report_modal.columns.${h.replace(/\s+/g, '_')}`)),
            ...reportData.rows
        ];
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, t('report_modal.excel_sheet_name'));
        XLSX.writeFile(workbook, "reporte_personalizado.xlsx");
        showNotification(t('report_modal.notifications.excel_download_success'), 'success');
    };

    // ✅ CORRECCIÓN: La función handlePrintReport ha sido restaurada.
    const handlePrintReport = () => {
        if (!reportData) return;
        const printContent = document.getElementById('report-preview-table').innerHTML;
        const printWindow = window.open('', '_blank', 'height=600,width=800');
        printWindow.document.write(`<html><head><title>${t('report_modal.print_title')}</title>`);
        printWindow.document.write(`<style> body { font-family: sans-serif; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; } th { background-color: #f2f2f2; } @media print { @page { size: landscape; } } </style>`);
        printWindow.document.write(`</head><body><h1>${t('report_modal.print_title')}</h1><table>` + printContent + '</table></body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle>
                {t('report_modal.title')}
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {loadingFilters ? <CircularProgress sx={{ display: 'block', margin: 'auto' }} /> : (
                    <Box>
                        <Typography variant="h6" gutterBottom>{t('report_modal.step1_title')}</Typography>
                        <Grid container spacing={2} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>{t('report_modal.filter_by_category')}</InputLabel>
                                    <Select name="idCategoria" value={filters.idCategoria} label={t('report_modal.filter_by_category')} onChange={handleFilterChange}>
                                        <MenuItem value=""><em>{t('report_modal.all_option')}</em></MenuItem>
                                        {categorias.map(cat => <MenuItem key={cat.idCategoria} value={cat.idCategoria}>{cat.nombreCategoria}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>{t('report_modal.filter_by_status')}</InputLabel>
                                    <Select name="idEstado" value={filters.idEstado} label={t('report_modal.filter_by_status')} onChange={handleFilterChange}>
                                        <MenuItem value=""><em>{t('report_modal.all_option')}</em></MenuItem>
                                        {estados.map(est => <MenuItem key={est.idEstado} value={est.idEstado}>{est.nombreEstado}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>{t('report_modal.filter_by_user')}</InputLabel>
                                    <Select name="idUsuarioActual" value={filters.idUsuarioActual} label={t('report_modal.filter_by_user')} onChange={handleFilterChange}>
                                        <MenuItem value=""><em>{t('report_modal.all_option')}</em></MenuItem>
                                        {usuarios.map(user => <MenuItem key={user.idUsuario} value={user.idUsuario}>{user.nombre}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>{t('report_modal.filter_by_country')}</InputLabel>
                                    <Select name="pais" value={filters.pais} label={t('report_modal.filter_by_country')} onChange={handleFilterChange}>
                                        <MenuItem value=""><em>{t('report_modal.all_option')}</em></MenuItem>
                                        {listaDePaises.map(pais => (
                                            <MenuItem key={pais.code} value={pais.code}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <img loading="lazy" width="20" src={`https://flagcdn.com/w20/${pais.code.toLowerCase()}.png`} alt=""/>
                                                    {pais.name}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>{t('report_modal.step2_title')}</Typography>
                            <Button onClick={handleSelectAll} size="small">
                                {allColumnsSelected ? t('report_modal.deselect_all') : t('report_modal.select_all')}
                            </Button>
                        </Box>
                        <FormGroup sx={{ mb: 4 }}>
                            <Grid container spacing={1}>
                                {OPCIONES_COLUMNAS.map(columna => (
                                    <Grid item xs={12} sm={6} md={3} key={columna}>
                                        <FormControlLabel
                                            control={<Checkbox checked={selectedColumns.includes(columna)} onChange={handleColumnChange} name={columna} />}
                                            label={t(`report_modal.columns.${columna.replace(/\s+/g, '_')}`)}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </FormGroup>

                        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2}}><CircularProgress /></Box>}
                        {reportData && !loading && (
                            <>
                                <Divider sx={{ my: 3 }} />
                                <Typography variant="h6" gutterBottom>{t('report_modal.step3_title')}</Typography>
                                <TableContainer id="report-preview-table" component={Paper} sx={{ maxHeight: 300, border: '1px solid #ddd' }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                {reportData.headers.map(header => <TableCell key={header} sx={{ fontWeight: 'bold' }}>{t(`report_modal.columns.${header.replace(/\s+/g, '_')}`)}</TableCell>)}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {reportData.rows.map((row, index) => (
                                                <TableRow key={index}>
                                                    {row.map((cell, cellIndex) => <TableCell key={cellIndex}>{cell}</TableCell>)}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('common.cancel')}</Button>
                {reportData && (
                    <>
                        <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrintReport}>{t('report_modal.print_button')}</Button>
                        <Button variant="contained" color="success" startIcon={<ArticleIcon />} onClick={handleDownloadExcel}>{t('report_modal.download_excel_button')}</Button>
                        <Button variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={handleDownloadReport}>{t('report_modal.download_csv_button')}</Button>
                    </>
                )}
                <Button
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PageviewIcon />}
                    onClick={handlePreviewReport}
                    disabled={loading || selectedColumns.length === 0}
                >
                    {loading ? t('report_modal.generating_button') : t('report_modal.preview_button')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReporteModal;