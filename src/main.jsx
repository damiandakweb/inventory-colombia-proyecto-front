import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import i18n from './i18n.js';
import { I18nextProvider } from 'react-i18next';
import { NotificationProvider } from './context/NotificationContext.jsx'; // 1. Importa el NotificationProvider aquí

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Suspense fallback={<div>Cargando...</div>}>
            <I18nextProvider i18n={i18n}>
                {/* 2. Envuelve TODO con el NotificationProvider aquí */}
                <NotificationProvider>
                    <App />
                </NotificationProvider>
            </I18nextProvider>
        </Suspense>
    </React.StrictMode>,
);