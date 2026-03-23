const isDev = import.meta.env.DEV;

const logger = {
    log: (...args) => isDev && console.log(...args),
    error: (...args) => isDev && console.error(...args),
    warn: (...args) => isDev && console.warn(...args),
};

export default logger;