import apiClient from './api';

/**
 * Llama al endpoint del backend para generar un reporte dinámico en formato CSV.
 * @param {object} requestData - El objeto que contiene las listas de 'columnas' y 'filtros'.
 * ej: { columnas: ['ID Equipo', 'Categoria'], filtros: { idEstado: 1 } }
 * @returns {Promise} La promesa de la llamada a la API, que devolverá los datos del archivo CSV.
 */
export const generarReporteDinamico = (requestData) => {
    return apiClient.post('/reportes/dinamico', requestData, {
        // Le indicamos a Axios que esperamos una respuesta de tipo texto plano (el CSV)
        responseType: 'text',
    });
};
