// Ruta: src/i18n.js
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18next
    // Carga las traducciones desde la carpeta /public/locales
    .use(Backend)
    // Detecta automáticamente el idioma del navegador del usuario
    .use(LanguageDetector)
    // Pasa la instancia de i18next a react-i18next
    .use(initReactI18next)
    .init({
        // Idioma por defecto si el idioma del navegador no está disponible
        fallbackLng: 'es',
        debug: true, // Ponlo en false para producción
        interpolation: {
            escapeValue: false, // React ya protege contra XSS
        },
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json', // <-- CORREGIDO
        },
    });

export default i18next;