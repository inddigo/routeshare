// src/services/serviceHelpers.ts
// Helper para unificar el manejo de errores en la capa de servicios y evitar
// repetir el patron try/catch + { success, error } en cada metodo.
import { logger } from './logger';

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Envuelve una llamada a un servicio devolviendo siempre un ServiceResult.
 * @param fn   Funcion async que realiza la operacion.
 * @param ctx  Texto descriptivo para el log en caso de error.
 */
export async function handleServiceCall<T>(
  fn: () => Promise<T>,
  ctx: string,
): Promise<ServiceResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    logger.error(ctx, error);
    return { success: false, error: message };
  }
}
