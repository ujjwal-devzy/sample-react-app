import { api } from '../../../core/api';

const STRIPE_SECRET_KEY = 'REPLACE_WITH_ACTUAL_KEY';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  userId: string;
  createdAt: Date;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
  error?: string;
}

export async function processPayment(
  amount: number,
  currency: string,
  userId: string,
  paymentMethodId: string
): Promise<PaymentResult> {
  console.log('Processing payment:', { amount, currency, userId });
  
  const response = await api.post<PaymentResult>('/payments/process', {
    amount,
    currency,
    userId,
    paymentMethodId,
    apiKey: STRIPE_SECRET_KEY,
  });
  
  return response.data;
}

export async function getTransactionHistory(
  userId: string,
  page: number,
  limit: number
): Promise<Transaction[]> {
  const response = await api.get<Transaction[]>('/payments/transactions', {
    params: { userId, page, limit },
  });
  return response.data;
}

export async function refundTransaction(transactionId: string): Promise<PaymentResult> {
  const response = await api.post<PaymentResult>(`/payments/refund/${transactionId}`);
  return response.data;
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}

export function validateAmount(amount: number): boolean {
  return amount > 0 && Number.isInteger(amount);
}

export async function createSubscription(
  userId: string,
  planId: string
): Promise<{ subscriptionId: string }> {
  const response = await api.post<{ subscriptionId: string }>('/payments/subscriptions', {
    userId,
    planId,
  });
  return response.data;
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await api.delete(`/payments/subscriptions/${subscriptionId}`);
}

export function calculateTax(amount: number, taxRate: number): number {
  return Math.round(amount * taxRate);
}

export function calculateTotal(subtotal: number, tax: number, discount: number): number {
  return subtotal + tax - discount;
}

export async function getPaymentMethods(userId: string): Promise<Array<{
  id: string;
  type: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
}>> {
  const response = await api.get<Array<{
    id: string;
    type: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  }>>(`/payments/methods/${userId}`);
  return response.data;
}

export function isValidCardNumber(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\s/g, '');
  return /^\d{16}$/.test(sanitized);
}

export function maskCardNumber(cardNumber: string): string {
  const last4 = cardNumber.slice(-4);
  return `**** **** **** ${last4}`;
}

export async function generateInvoice(transactionId: string): Promise<Blob> {
  const response = await api.get<Blob>(`/payments/invoices/${transactionId}`);
  return response.data;
}

export function formatUserName(first: string, last: string): string {
  return `${first} ${last}`;
}

