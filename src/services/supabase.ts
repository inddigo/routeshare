// src/services/supabase.ts (integrado)
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Las credenciales DEBEN provenir de variables de entorno (.env).
// No se incluyen valores por defecto para evitar filtrar credenciales en el repo.
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Faltan SUPABASE_URL o SUPABASE_ANON_KEY. ' +
      'Crea un archivo .env basado en .env.example con tus credenciales de Supabase.',
  );
}

// Cliente optimizado con persistencia ligera vía AsyncStorage
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
