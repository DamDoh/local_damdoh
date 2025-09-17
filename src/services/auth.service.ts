import { api, PaginationParams } from './api-client';
import { StakeholderRole } from '../models/stakeholder';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: StakeholderRole;
    phoneNumber?: string;
    location?: {
      coordinates: [number, number];
    };
  };
}

interface RegisterParams {
  email: string;
  password: string;
  name: string;
  role: StakeholderRole;
  phoneNumber?: string;
  location?: {
    coordinates: [number, number];
  };
}

interface LoginParams {
  email: string;
  password: string;
}

export const authService = {
  register: (data: RegisterParams) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: LoginParams) =>
    api.post<AuthResponse>('/auth/login', data),

  logout: () =>
    api.post<void>('/auth/logout', {}),

  refreshToken: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh-token', { refreshToken }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<void>('/auth/change-password', data),

  // Store tokens in localStorage
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => {
    localStorage.setItem('auth_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
  },

  // Remove tokens from localStorage
  clearTokens: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  },
};