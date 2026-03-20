import apiClient from './api';

export const getDashboardSummary = () => {
    return apiClient.get('/dashboard/summary');
};