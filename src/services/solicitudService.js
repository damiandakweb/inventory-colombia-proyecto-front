// ✅ SOLO importamos nuestro apiClient, que ya es una instancia de Axios
import apiClient from './api';

/**
 * Obtiene todas las solicitudes del backend.
 */
export const getAllSolicitudes = () => {
    return apiClient.get('/solicitudes');
};

/**
 * Llama al endpoint del backend para procesar una solicitud.
 * @param {number} solicitudId - El ID de la solicitud a procesar.
 * @param {object} movimientoData - Los datos del movimiento a crear.
 */
export const procesarSolicitud = (solicitudId, movimientoData) => {
    return apiClient.post(`/solicitudes/${solicitudId}/procesar`, movimientoData);
};

/**
 * Envía un activo a mantenimiento.
 * @param {number} solicitudId - El ID de la solicitud relacionada.
 * @param {number} activoId - El ID del activo específico a enviar.
 */
export const enviarAMantenimiento = (solicitudId, activoId) => {
    // Verificación para asegurar que el activoId se está pasando
    if (!activoId) {
        return Promise.reject(new Error("El ID del activo es obligatorio para enviar a mantenimiento."));
    }

    // ✅ CORRECCIÓN 1: La URL ya no necesita '/api' porque apiClient lo añade automáticamente.
    const url = `/solicitudes/${solicitudId}/mantenimiento?activoId=${activoId}`;

    // ✅ CORRECCIÓN 2: Usamos apiClient.post() para que la llamada tenga la URL base y el token correctos.
    return apiClient.post(url);
};

export const procesarDevolucion = (solicitudId, data) => {
    return apiClient.post(`/solicitudes/${solicitudId}/devolucion`, data);
};
export const getSolicitudesPendientesCount = () => {
    return apiClient.get('/solicitudes/pendientes/count');
};
export const rechazarSolicitud = (solicitudId, motivo = '') => {
    return apiClient.post(`/solicitudes/${solicitudId}/rechazar?motivo=${encodeURIComponent(motivo)}`);
};