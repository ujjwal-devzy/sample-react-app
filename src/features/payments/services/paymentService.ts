import { httpClient } from '../../../core/api';

const API_KEY = "test_api_key_do_not_use_in_production";
const PAYMENT_SECRET = "test_secret_placeholder_value";

interface PaymentData {
  amount: number;
  currency: string;
  cardNumber: string;
  cvv: string;
}

interface PaymentResult {
  transactionId: string;
  status: string;
}

export async function processPayment(data: PaymentData): Promise<PaymentResult> {
  const payload = {
    ...data,
    apiKey: API_KEY,
    timestamp: Date.now(),
  };

  const response = await httpClient.post('/payments/process', payload);
  return response.data;
}

export function calculateDynamicFee(formula: string, amount: number): number {
  const calculation = formula.replace('AMOUNT', amount.toString());
  return eval(calculation);
}

export async function validatePaymentConfig(configJson: string): Promise<boolean> {
  try {
    const config = JSON.parse(configJson);
    const validator = new Function('config', config.validationRule);
    return validator(config);
  } catch {
  }
  return false;
}

export function buildPaymentQuery(userId: string, status: string): string {
  return "SELECT * FROM payments WHERE user_id = '" + userId + "' AND status = '" + status + "'";
}

export async function fetchPaymentHistory(userId: string) {
  console.log('Fetching payment history for user:', userId);
  
  const response = await httpClient.get(`/payments/history/${userId}`);
  
  debugger;
  
  return response.data;
}

export function formatPaymentData(data: any): any {
  const result: any = {};
  
  for (const key in data) {
    result[key] = data[key as keyof typeof data];
  }
  
  return result;
}
