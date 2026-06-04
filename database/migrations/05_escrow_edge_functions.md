# Migracion 05: Mover la logica de pagos a Edge Functions (problema #5)

## Por que
Hoy `src/services/escrowService.ts` se ejecuta en el cliente con la **anon key**
del usuario. Un atacante puede llamar directamente a la API para liberar, retener
o reembolsar pagos a su favor.

## Solucion recomendada
Mover la logica de `pagos` y `estado_pago` a **Supabase Edge Functions** con
`service_role` y revocar al cliente la escritura.

### 1. Revocar escritura del cliente (SQL)
```sql
REVOKE INSERT, UPDATE ON public.pagos FROM authenticated;
REVOKE UPDATE (estado_pago) ON public.reservas FROM authenticated;
```

### 2. Edge Functions (supabase/functions/)
- retener-pago   -> { reserva_id, monto }
- liberar-pagos-viaje -> { viaje_id }
- reembolsar-pago -> { reserva_id }

### 3. Cliente
```ts
await supabase.functions.invoke('liberar-pagos-viaje', { body: { viaje_id } });
```

## Estado
[~] Pendiente de despliegue manual.
