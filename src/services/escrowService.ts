// src/services/escrowService.ts
// Servicio de pagos Escrow SIMULADO (sin pasarela real)
import { supabase } from './supabase';

const COMISION_PORCENTAJE = 0.07; // 7% comisión

export const escrowService = {
  // Retener fondos al confirmar reserva
  retenerPago: async (reservaId: string, monto: number) => {
    const { data, error } = await supabase
      .from('pagos')
      .insert([{
        reserva_id: reservaId,
        monto,
        estado: 'retenido',
        comision_porcentaje: COMISION_PORCENTAJE,
      }])
      .select()
      .single();

    if (error) throw new Error(`Error reteniendo pago: ${error.message}`);

    // Actualizar estado_pago en la reserva
    await supabase
      .from('reservas')
      .update({ estado_pago: 'retenido' })
      .eq('id', reservaId);

    return data;
  },

  // Liberar fondos al conductor tras confirmar llegada
  liberarPago: async (pagoId: string) => {
    const { data, error } = await supabase
      .from('pagos')
      .update({
        estado: 'liberado',
        fecha_liberacion: new Date().toISOString(),
      })
      .eq('id', pagoId)
      .select()
      .single();

    if (error) throw new Error(`Error liberando pago: ${error.message}`);

    // Actualizar estado_pago en la reserva
    if (data?.reserva_id) {
      await supabase
        .from('reservas')
        .update({ estado_pago: 'liberado' })
        .eq('id', data.reserva_id);
    }

    return data;
  },

  // Liberar todos los pagos de un viaje al finalizarlo
  liberarPagosViaje: async (viajeId: string) => {
    // Obtener todas las reservas confirmadas del viaje
    const { data: reservas, error: resError } = await supabase
      .from('reservas')
      .select('id')
      .eq('viaje_id', viajeId)
      .eq('estado', 'confirmada');

    if (resError) throw new Error(`Error obteniendo reservas: ${resError.message}`);

    if (!reservas || reservas.length === 0) return [];

    const reservaIds = reservas.map(r => r.id);

    // Actualizar todos los pagos retenidos a liberados
    const { data, error } = await supabase
      .from('pagos')
      .update({
        estado: 'liberado',
        fecha_liberacion: new Date().toISOString(),
      })
      .in('reserva_id', reservaIds)
      .eq('estado', 'retenido')
      .select();

    if (error) throw new Error(`Error liberando pagos: ${error.message}`);

    // Actualizar estado_pago en reservas
    await supabase
      .from('reservas')
      .update({ estado_pago: 'liberado' })
      .in('id', reservaIds)
      .eq('estado_pago', 'retenido');

    return data;
  },

  // Reembolsar fondos al pasajero
  reembolsarPago: async (reservaId: string) => {
    const { data, error } = await supabase
      .from('pagos')
      .update({
        estado: 'reembolsado',
        fecha_liberacion: new Date().toISOString(),
      })
      .eq('reserva_id', reservaId)
      .eq('estado', 'retenido')
      .select()
      .single();

    if (error) throw new Error(`Error reembolsando pago: ${error.message}`);

    await supabase
      .from('reservas')
      .update({ estado_pago: 'reembolsado', estado: 'cancelada' })
      .eq('id', reservaId);

    return data;
  },

  // Obtener estado de pago de una reserva
  getEstadoPago: async (reservaId: string) => {
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .eq('reserva_id', reservaId)
      .single();

    if (error) return null;
    return data;
  },

  // Calcular monto neto para el conductor (monto - comisión), redondeado a
  // 2 decimales para evitar arrastrar errores de punto flotante.
  calcularMontoNeto: (monto: number): number => {
    return Math.round(monto * (1 - COMISION_PORCENTAJE) * 100) / 100;
  },
};
