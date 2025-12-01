/**
 * HTTP Client
 * Centralized HTTP client with interceptors, retry logic, and error handling
 */

import { API_CONFIG, ERROR_CODES, STORAGE_KEYS } from '../constants';
import type { ApiResponse, ApiError, ApiErrorResponse } from '../types';
import { getFromStorage, setInStorage, removeFromStorage } from '../utils/storage';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface RequestConfig extends Omit<RequestInit, 'body'> {
  url: string;
  params?: Record<string, unknown>;
  data?: unknown;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  skipAuth?: boolean;
}

export interface RequestInterceptor {
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  onRequestError?: (error: Error) => Promise<never>;
}

export interface ResponseInterceptor {
  onResponse?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
  onResponseError?: (error: ApiError) => Promise<never>;
}

// ============================================
// HTTP CLIENT CLASS
// ============================================

class HttpClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultRetries: number;
  private defaultRetryDelay: number;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(config: {
    baseUrl: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  }) {
    this.baseUrl = config.baseUrl;
    this.defaultTimeout = config.timeout || API_CONFIG.timeout;
    this.defaultRetries = config.retries || API_CONFIG.retryAttempts;
    this.defaultRetryDelay = config.retryDelay || API_CONFIG.retryDelay;
  }

  // ============================================
  // INTERCEPTORS
  // ============================================

  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index !== -1) {
        this.requestInterceptors.splice(index, 1);
      }
    };
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index !== -1) {
        this.responseInterceptors.splice(index, 1);
      }
    };
  }

  // ============================================
  // REQUEST METHODS
  // ============================================

  async get<T>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  async post<T>(url: string, data?: unknown, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', data });
  }

  async put<T>(url: string, data?: unknown, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', data });
  }

  async patch<T>(url: string, data?: unknown, config?: Omit<RequestConfig, 'url' | 'method' | 'data'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', data });
  }

  async delete<T>(url: string, config?: Omit<RequestConfig, 'url' | 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }

  // ============================================
  // CORE REQUEST METHOD
  // ============================================

  async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    // Apply request interceptors
    let finalConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      if (interceptor.onRequest) {
        try {
          finalConfig = await interceptor.onRequest(finalConfig);
        } catch (error) {
          if (interceptor.onRequestError) {
            await interceptor.onRequestError(error as Error);
          }
          throw error;
        }
      }
    }

    const {
      url,
      params,
      data,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      skipAuth = false,
      ...fetchConfig
    } = finalConfig;

    // Build URL with query params
    const fullUrl = this.buildUrl(url, params);

    // Build headers
    const headers = new Headers(fetchConfig.headers);
    
    if (!headers.has('Content-Type') && data) {
      headers.set('Content-Type', 'application/json');
    }

    // Add auth token if not skipped
    if (!skipAuth) {
      const token = getFromStorage<string>(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // Build request body
    let body: BodyInit | undefined;
    if (data) {
      if (data instanceof FormData || data instanceof Blob) {
        body = data;
        headers.delete('Content-Type'); // Let browser set it
      } else {
        body = JSON.stringify(data);
      }
    }

    // Execute request with retry logic
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= retries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(fullUrl, {
          ...fetchConfig,
          headers,
          body,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Parse response
        const result = await this.parseResponse<T>(response);

        // Apply response interceptors
        let finalResult = result;
        for (const interceptor of this.responseInterceptors) {
          if (interceptor.onResponse) {
            finalResult = await interceptor.onResponse(finalResult);
          }
        }

        return finalResult;
      } catch (error) {
        lastError = error as Error;
        
        // Check if we should retry
        if (!this.shouldRetry(error as Error, attempt, retries)) {
          break;
        }

        attempt++;
        await this.delay(retryDelay * Math.pow(2, attempt - 1));
      }
    }

    // Handle final error
    const apiError = this.normalizeError(lastError!);
    
    for (const interceptor of this.responseInterceptors) {
      if (interceptor.onResponseError) {
        await interceptor.onResponseError(apiError);
      }
    }

    throw apiError;
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private buildUrl(path: string, params?: Record<string, unknown>): string {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    
    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    }

    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  private async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('Content-Type');
    
    let data: unknown;
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else if (contentType?.includes('text/')) {
      data = await response.text();
    } else {
      data = await response.blob();
    }

    if (!response.ok) {
      const errorResponse = data as ApiErrorResponse;
      throw {
        code: errorResponse?.error?.code || `HTTP_${response.status}`,
        message: errorResponse?.error?.message || response.statusText,
        details: errorResponse?.error?.details,
      } as ApiError;
    }

    // Handle different response formats
    if (this.isApiResponse(data)) {
      return data as ApiResponse<T>;
    }

    return {
      success: true,
      data: data as T,
      timestamp: new Date().toISOString(),
    };
  }

  private isApiResponse(data: unknown): boolean {
    return (
      typeof data === 'object' &&
      data !== null &&
      'success' in data &&
      'data' in data
    );
  }

  private shouldRetry(error: Error, attempt: number, maxRetries: number): boolean {
    if (attempt >= maxRetries) return false;
    
    // Don't retry on auth errors
    if ('code' in error) {
      const code = (error as ApiError).code;
      if (code?.startsWith('AUTH')) return false;
      if (code === ERROR_CODES.VALIDATION_FAILED) return false;
    }

    // Retry on network errors and 5xx errors
    if (error.name === 'AbortError') return false;
    if (error.message.includes('NetworkError')) return true;
    if ('code' in error && (error as ApiError).code?.startsWith('HTTP_5')) return true;

    return false;
  }

  private normalizeError(error: Error | unknown): ApiError {
    if (this.isApiError(error)) {
      return error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          code: ERROR_CODES.TIMEOUT_ERROR,
          message: 'Request timed out',
        };
      }

      return {
        code: ERROR_CODES.NETWORK_ERROR,
        message: error.message || 'Network error occurred',
      };
    }

    return {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
    };
  }

  private isApiError(error: unknown): error is ApiError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================
// CREATE DEFAULT CLIENT
// ============================================

export const httpClient = new HttpClient({
  baseUrl: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  retries: API_CONFIG.retryAttempts,
  retryDelay: API_CONFIG.retryDelay,
});

// ============================================
// ADD DEFAULT INTERCEPTORS
// ============================================

// Token refresh interceptor
httpClient.addResponseInterceptor({
  onResponseError: async (error) => {
    if (error.code === ERROR_CODES.AUTH_TOKEN_EXPIRED) {
      const refreshToken = getFromStorage<string>(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (refreshToken) {
        try {
          const response = await httpClient.post<{ accessToken: string; refreshToken: string }>(
            '/auth/refresh',
            { refreshToken },
            { skipAuth: true }
          );

          setInStorage(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken);
          setInStorage(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);

          // Note: In a real app, you'd retry the original request here
        } catch {
          // Clear tokens on refresh failure
          removeFromStorage(STORAGE_KEYS.ACCESS_TOKEN);
          removeFromStorage(STORAGE_KEYS.REFRESH_TOKEN);
          removeFromStorage(STORAGE_KEYS.USER);
          
          // Redirect to login
          window.location.href = '/login';
        }
      }
    }

    throw error;
  },
});

// ============================================
// CONVENIENCE EXPORTS
// ============================================

export const api = {
  get: httpClient.get.bind(httpClient),
  post: httpClient.post.bind(httpClient),
  put: httpClient.put.bind(httpClient),
  patch: httpClient.patch.bind(httpClient),
  delete: httpClient.delete.bind(httpClient),
  request: httpClient.request.bind(httpClient),
};

export { HttpClient };

