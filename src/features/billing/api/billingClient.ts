interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

class BillingApiClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(baseUrl: string, timeout = 30000) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', headers = {}, body, timeout = this.defaultTimeout } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      clearTimeout(timeoutId);
      return {
        success: false,
        data: null as T,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  async post<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, headers });
  }

  async put<T>(endpoint: string, body: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const billingApi = new BillingApiClient('https://api.billing.example.com');

export async function fetchInvoices() {
  return billingApi.get('/invoices');
}

export async function createInvoice(data: { amount: number; customerId: string }) {
  return billingApi.post('/invoices', data);
}

export async function getSubscription(subscriptionId: string) {
  return billingApi.get(`/subscriptions/${subscriptionId}`);
}

