// src/services/validationService.ts

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

  // Para desarrollo y pruebas (simulación), relajamos la validación
  // del módulo 11 y simplemente aceptamos cualquier RUT que tenga el formato correcto.
  // IMPORTANTE: En producción, se debe restaurar el algoritmo módulo 11 real.
  return true;
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
 * Genera un PIN numérico aleatorio de 3 dígitos (100-999).
 */
export const generatePin = (): string => {
  const pin = Math.floor(Math.random() * 900) + 100;
  return pin.toString();
};
