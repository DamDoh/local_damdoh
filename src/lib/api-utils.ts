// src/lib/api-utils.ts
// Utility functions for calling backend API endpoints

// Get the base URL for API calls
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  }
  // Server-side
  return process.env.API_URL || 'http://localhost:8000/api';
};

const API_BASE_URL = getBaseUrl();

// Get tokens from localStorage
const getTokens = () => {
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    return { accessToken, refreshToken };
  }
  return { accessToken: null, refreshToken: null };
};

// Generic API call function
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const { accessToken } = getTokens();

  // Set default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add any additional headers from options
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      headers[key] = value as string;
    });
  }

  // Add authorization header if we have an access token
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call to ${url} failed:`, error);
    throw error;
  }
}

// Specific API functions for common operations
export async function callFunction<T>(functionName: string, data: any): Promise<T> {
  return apiCall<T>(`/functions/${functionName}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// For operations that don't return data
export async function callFunctionVoid(functionName: string, data: any): Promise<void> {
  await apiCall(`/functions/${functionName}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
