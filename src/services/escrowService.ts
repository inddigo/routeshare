// src/services/escrowService.ts
// Escrow sobre Wallet + Booking.payment_status mediante RPCs SECURITY DEFINER.
// El cliente NO puede escribir Wallet ni payment_status directamente
// (RLS/grants): todo movimiento de dinero pasa por los RPCs, que validan
// identidad con auth.uid() y usan el precio server-side del viaje.
// Ver database/migrations/08_escrow_rpcs.sql
import { supabase } from './supabase';

const COMISION_PORCENTAJE = 0.07; // 7% comisión

export const escrowService = {
  // Retener fondos del pasajero al crear la reserva (available -> escrow).
  retenerPago: async (reservaId: string) => {
    const { error } = await supabase.rpc('retener_pago', {
      p_reserva_id: reservaId,
    });
    if (error) throw new Error(`Error reteniendo pago: ${error.message}`);
  },

  // Liberar al conductor (menos comisión) todos los pagos retenidos del viaje.
  // Solo funciona con el viaje COMPLETED. Devuelve la cantidad liberada.
  liberarPagosViaje: async (viajeId: string) => {
    const { data, error } = await supabase.rpc('liberar_pagos_viaje', {
      p_viaje_id: viajeId,
    });
    if (error) throw new Error(`Error liberando pagos: ${error.message}`);
    return data;
  },

  // Reembolsar al pasajero (escrow -> available). Es no-op si no había retención.
  reembolsarPago: async (reservaId: string) => {
    const { error } = await supabase.rpc('reembolsar_pago', {
      p_reserva_id: reservaId,
    });
    if (error) throw new Error(`Error reembolsando pago: ${error.message}`);
  },

  // Obtener estado de pago de una reserva.
  getEstadoPago: async (reservaId: string) => {
    const { data, error } = await supabase
      .from('Booking')
      .select('payment_status')
      .eq('id', reservaId)
      .single();

    if (error) return null;
    return data.payment_status;
  },

  // Calcular monto neto para el conductor (monto - comisión). CLP es entero,
  // sin decimales, igual que el cálculo del RPC liberar_pagos_viaje.
  calcularMontoNeto: (monto: number): number => {
    return Math.round(monto * (1 - COMISION_PORCENTAJE));
  },
};
