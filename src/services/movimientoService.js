import apiClient from './api';

export const createMovimiento = (movimientoData) => {
    return apiClient.post('/movimientos', movimientoData);
};

export const getMovimientosByActivoId = (activoId) => {
    return apiClient.get(`/movimientos/activo/${activoId}`);
};