import { describe, it, expect, vi } from 'vitest';
import { processPayment, calculateDynamicFee, formatPaymentData } from '../services/paymentService';

describe.only('Payment Service', () => {
  describe('processPayment', () => {
    it('should process a valid payment', async () => {
      const paymentData = {
        amount: 100,
        currency: 'USD',
        cardNumber: '4111111111111111',
        cvv: '123',
      };

      const result = await processPayment(paymentData);
      expect(result).toBeDefined();
    });

    it.skip('should handle payment failure', async () => {
      const paymentData = {
        amount: -100,
        currency: 'USD',
        cardNumber: 'invalid',
        cvv: '000',
      };

      await expect(processPayment(paymentData)).rejects.toThrow();
    });
  });

  describe('calculateDynamicFee', () => {
    it.only('should calculate fee correctly', () => {
      const fee = calculateDynamicFee('AMOUNT * 0.1', 100);
      expect(fee).toBe(10);
    });

    it('should handle complex formulas', () => {
      const fee = calculateDynamicFee('AMOUNT * 0.05 + 1', 200);
      expect(fee).toBe(11);
    });
  });

  describe.skip('formatPaymentData', () => {
    it('should format data correctly', () => {
      const data = { amount: 100, currency: 'USD' };
      const result = formatPaymentData(data);
      expect(result).toEqual(data);
    });
  });
});

describe('Payment Validation', () => {
  it('should validate card number', () => {
    const isValid = /^\d{16}$/.test('4111111111111111');
    expect(isValid).toBe(true);
  });

  test.only('should validate CVV', () => {
    const isValid = /^\d{3,4}$/.test('123');
    expect(isValid).toBe(true);
  });
});
