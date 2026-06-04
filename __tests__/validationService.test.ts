import {
  validateRut,
  validateCelular,
  validatePasswordStrength,
  validatePUCVEmail,
  generatePin,
} from '../src/services/validationService';

describe('validationService', () => {
  describe('generatePin', () => {
    it('genera un PIN de 4 digitos', () => {
      for (let i = 0; i < 200; i++) {
        const pin = generatePin();
        expect(pin).toMatch(/^\d{4}$/);
        const n = parseInt(pin, 10);
        expect(n).toBeGreaterThanOrEqual(1000);
        expect(n).toBeLessThanOrEqual(9999);
      }
    });
  });

  describe('validatePUCVEmail', () => {
    it('acepta correos PUCV', () => {
      expect(validatePUCVEmail('juan.perez@pucv.cl')).toBe(true);
      expect(validatePUCVEmail('juan.perez@mail.pucv.cl')).toBe(true);
    });
    it('rechaza correos no institucionales', () => {
      expect(validatePUCVEmail('juan@gmail.com')).toBe(false);
      expect(validatePUCVEmail('juan@pucv.com')).toBe(false);
    });
  });

  describe('validateCelular', () => {
    it('acepta celulares chilenos validos', () => {
      expect(validateCelular('912345678')).toBe(true);
      expect(validateCelular('+56 9 1234 5678')).toBe(true);
    });
    it('rechaza formatos invalidos', () => {
      expect(validateCelular('12345678')).toBe(false);
      expect(validateCelular('812345678')).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('acepta una contrasena fuerte', () => {
      expect(validatePasswordStrength('Segura123').valid).toBe(true);
    });
    it('rechaza contrasenas debiles', () => {
      expect(validatePasswordStrength('corta1').valid).toBe(false);
      expect(validatePasswordStrength('sinmayuscula1').valid).toBe(false);
      expect(validatePasswordStrength('SinNumeros').valid).toBe(false);
    });
  });

  describe('validateRut', () => {
    it('acepta formatos validos', () => {
      expect(validateRut('12.345.678-9')).toBe(true);
      expect(validateRut('12345678-9')).toBe(true);
    });
    it('rechaza formatos invalidos', () => {
      expect(validateRut('abc')).toBe(false);
      expect(validateRut('123-4')).toBe(false);
    });
  });
});
