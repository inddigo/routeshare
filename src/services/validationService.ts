// src/services/validationService.ts
import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';


/**
 * Valida un RUT chileno usando el algoritmo módulo 11.
 * Acepta formatos: 12345678-9, 12.345.678-9, 123456789
 */
export const validateRut = (rut: string): boolean => {
  // Limpiar puntos y espacios
  const cleaned = rut.replace(/\./g, '').replace(/\s/g, '').toUpperCase();

  // Separar cuerpo y dígito verificador
  let body: string;
  let dv: string;

  if (cleaned.includes('-')) {
    const parts = cleaned.split('-');
    if (parts.length !== 2) return false;
    body = parts[0];
    dv = parts[1];
  } else {
    // Sin guión: último carácter es el DV
    body = cleaned.slice(0, -1);
    dv = cleaned.slice(-1);
  }

  // Validar que el cuerpo sea numérico y tenga largo razonable
  if (!/^\d{7,8}$/.test(body)) return false;
  if (!/^[\dK]$/.test(dv)) return false;

  // Algoritmo módulo 11: se recorre el cuerpo de derecha a izquierda
  // multiplicando por la serie 2,3,4,5,6,7 (cíclica).
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  const expectedDv = remainder === 11 ? '0' : remainder === 10 ? 'K' : remainder.toString();

  return dv === expectedDv;
};

/**
 * Valida formato de celular chileno: 9 dígitos comenzando con 9.
 * Formato esperado: 9XXXXXXXX
 */
export const validateCelular = (celular: string): boolean => {
  const cleaned = celular.replace(/\s/g, '').replace(/\+56/g, '');
  return /^9\d{8}$/.test(cleaned);
};

/**
 * Valida la fortaleza de la contraseña.
 * Requisitos: mínimo 8 caracteres, al menos 1 mayúscula, al menos 1 número.
 */
export const validatePasswordStrength = (
  password: string,
): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return {
      valid: false,
      message: 'La contraseña debe tener al menos 8 caracteres.',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'La contraseña debe contener al menos una letra mayúscula.',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'La contraseña debe contener al menos un número.',
    };
  }

  return { valid: true, message: '' };
};

/**
 * Valida que el correo sea institucional PUCV.
 * Acepta: @pucv.cl o @mail.pucv.cl
 */
export const validatePUCVEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9._%+-]+@(?:mail\.)?pucv\.cl$/.test(email);
};

/**
 * Genera un PIN numérico aleatorio de 4 dígitos (1000-9999).
 * Usa crypto.getRandomValues cuando está disponible (más resistente a
 * predicción); cae a Math.random si el runtime no lo expone.
 */
export const generatePin = (): string => {
  const cryptoObj = (globalThis as any)?.crypto;
  let value: number;
  if (cryptoObj?.getRandomValues) {
    const arr = new Uint32Array(1);
    cryptoObj.getRandomValues(arr);
    value = arr[0] % 9000;
  } else {
    value = Math.floor(Math.random() * 9000);
  }
  return (value + 1000).toString();
};

/**
 * Sube un archivo (imagen) a Supabase Storage
 */
export const uploadDocument = async (
  base64: string,
  fileName: string,
  mimeType: string = 'image/jpeg',
  bucket: string = 'driver_documents',
) => {
  try {
    if (!base64) {
      throw new Error('No se pudo leer el archivo seleccionado.');
    }

    const fileExt = mimeType.split('/')[1] || 'jpg';
    const contentType = mimeType || 'image/jpeg';
    const filePath = `${fileName}_${Date.now()}.${fileExt}`;

    // En React Native el upload de Supabase Storage no acepta FormData de forma
    // fiable (intenta llamar métodos del body que no existen -> "undefined is
    // not a function"). El camino confiable es decodificar el base64 que entrega
    // el image-picker a ArrayBuffer y subir esos bytes directamente (mismo
    // enfoque que el avatar en ProfileScreen).
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, decode(base64), {
        cacheControl: '3600',
        upsert: false,
        contentType,
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error('Error uploading document:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envía los datos del conductor y el vehículo para revisión
 */
export const submitDriverValidation = async (
  userId: string, 
  brand: string, 
  model: string, 
  plate: string, 
  licenseUrl: string, 
  documentUrl: string
) => {
  try {
    // 1. Insertar el vehículo (queda en verification_status 'PENDING')
    const { error: vehiculoError } = await supabase
      .from('Vehicle')
      .insert([
        {
          driver_id: userId,
          license_plate: plate,
          make_model: `${brand} ${model}`,
          registration_doc_url: documentUrl,
          capacity: 4,
        }
      ])
      .select()
      .single();

    if (vehiculoError) throw new Error(`Error insertando vehículo: ${vehiculoError.message}`);

    // 2. Marcar al usuario como conductor y guardar su licencia
    const { error: conductorError } = await supabase
      .from('User')
      .update({ role: 'DRIVER', license_url: licenseUrl })
      .eq('id', userId);

    if (conductorError) throw new Error(`Error actualizando conductor: ${conductorError.message}`);

    return { success: true };
  } catch (error: any) {
    console.error('Error submitting driver validation:', error);
    return { success: false, error: error.message };
  }
};
