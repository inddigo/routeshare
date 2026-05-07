// src/services/supabase.ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

console.log("Supabase URL from env:", SUPABASE_URL);

const url = SUPABASE_URL || 'https://jsutuayzayjrkmlidjav.supabase.co';
const key = SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzdXR1YXl6YXlqcmttbGlkamF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzMzNzcsImV4cCI6MjA5MzE0OTM3N30.1ZzK6otgto5olWrQy7D4D0Ud6Cthp016bQbmTOYw0Q8';

// Cliente optimizado con persistencia ligera vía AsyncStorage
export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
