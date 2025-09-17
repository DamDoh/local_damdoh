/**
 * Base configuration and utility functions for API requests
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiError extends Error {
  status?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}

interface ApiResponse<T> {
  data: T;
  pagination?: {
    total: number;
    page: number;
    pages: number;
  };
}

// Utility to handle API errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = new Error('API request failed');
    error.status = response.status;
    const data = await response.json().catch(() => null);
    if (data?.error) {
      error.message = data.error;
    }
    throw error;
  }
  return response.json();
}

// Get the stored auth token
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// Create headers with authentication
function createHeaders(headers: HeadersInit = {}): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
}

// Base API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers = createHeaders(options.headers);
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  return handleResponse<T>(response);
}

export const api = {
  get: <T>(endpoint: string, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'GET',
    }),

  post: <T>(endpoint: string, data: any, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: any, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data: any, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, options: RequestInit = {}) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'DELETE',
    }),
};