export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  userId: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'crypto';
  last4: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}
