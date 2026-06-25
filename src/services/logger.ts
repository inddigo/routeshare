// src/services/logger.ts
// Logger con niveles. En producción (no __DEV__) se silencia para evitar
// filtrar datos sensibles en los logs del dispositivo.

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) console.log('[DEBUG]', ...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info('[INFO]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn('[WARN]', ...args);
  },
  // Los errores se registran siempre, pero sin volcar objetos sensibles completos.
  error: (message: string, error?: unknown) => {
    const detail = error instanceof Error ? error.message : error;
    console.error('[ERROR]', message, detail ?? '');
  },
};
