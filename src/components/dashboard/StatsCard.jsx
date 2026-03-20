import React from 'react';
import { Paper, Box, Typography, Avatar } from '@mui/material';

export const StatsCard = ({ title, value, icon, color, change, suffix = '' }) => {
    const changeColor = change > 0 ? 'success.main' : 'error.main';
    return (
        <Paper elevation={3} sx={{ p: 2.5, borderRadius: '12px', height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: color, mb: 0.5, fontSize: '2rem', lineHeight: 1.2 }}>{value}{suffix}</Typography>
                    <Typography color="text.secondary" sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 500 }}>{title}</Typography>
                </Box>
                <Avatar sx={{ width: 48, height: 48, bgcolor: color, color: 'white' }}>{icon}</Avatar>
            </Box>
            {change !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 'auto' }}>
                    <Typography sx={{ color: changeColor, fontSize: '1rem' }}>{change > 0 ? '↗️' : '↘️'}</Typography>
                    <Typography variant="subtitle2" sx={{ color: changeColor, fontWeight: 'bold', fontSize: '0.75rem' }}>
                        {Math.abs(change)}%
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};