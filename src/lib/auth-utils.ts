"use client";

import type { StakeholderRole } from './constants';

// Define the structure of our user object to match what the backend returns
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string; // Using string instead of specific type to match backend
  phoneNumber?: string;
  location?: {
    type: string;
    coordinates: number[];
  };
}

// Define the structure of our auth response
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// Define the structure of our login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Define the structure of our register request
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: string; // Using string instead of specific type to match backend
  phoneNumber?: string;
  location?: {
    coordinates: [number, number];
  };
}

// Define the structure of our password change request
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

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

// Store tokens in localStorage
const setTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
};

// Get tokens from localStorage
export const getTokens = () => {
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    return { accessToken, refreshToken };
  }
  return { accessToken: null, refreshToken: null };
};

// Clear tokens from localStorage
const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

// Get the current user from localStorage
export const getCurrentUser = (): AuthUser | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

// Set the current user in localStorage
const setCurrentUser = (user: AuthUser) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Clear the current user from localStorage
const clearCurrentUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

export const useAuth = () => {
  const user = getCurrentUser();
  const { accessToken, refreshToken } = getTokens();
  
  return {
    user,
    accessToken,
    refreshToken,
    loading: false,
    uid: user?.id || null
  };
};

export function getCurrentUserId(): string | null {
  const user = getCurrentUser();
  return user ? user.id : null;
}

export function isAdmin(userId: string | null): boolean {
  const user = getCurrentUser();
  return user?.role === 'ADMIN';
}

export async function logOut(): Promise<void> {
  try {
    clearTokens();
    clearCurrentUser();
    console.log("User logged out successfully via new auth-utils.");
  } catch (error) {
    console.error("Error logging out from new auth-utils: ", error);
    throw error;
  }
}

export async function logIn(email: string, password: string): Promise<AuthUser> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    
    // Store tokens and user data
    setTokens(data.accessToken, data.refreshToken);
    setCurrentUser(data.user);
    
    console.log("User logged in successfully via new auth-utils:", data.user.id);
    return data.user;
  } catch (error) {
    console.error("Error logging in via new auth-utils:", error);
    throw error;
  }
}

export async function registerUser(
  name: string, 
  email: string, 
  password: string, 
  role: string, // Using string instead of specific type to match backend
  phoneNumber?: string,
  location?: { coordinates: [number, number] },
): Promise<AuthUser> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name, 
        email, 
        password, 
        role,
        phoneNumber,
        location
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    const data: AuthResponse = await response.json();
    
    // Store tokens and user data
    setTokens(data.accessToken, data.refreshToken);
    setCurrentUser(data.user);
    
    console.log("User registered successfully via new auth-utils:", data.user.id);
    return data.user;
  } catch (error) {
    console.error("Error registering user in new auth-utils:", error);
    throw error;
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    // Note: This would need to be implemented in the backend
    console.log(`Attempting to send password reset email to: ${email}`);
    // For now, we'll just log this as the backend doesn't have this endpoint yet
    console.log("Password reset functionality needs to be implemented in the backend");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  try {
    // Note: This would need to be implemented in the backend
    console.log("Attempting to reset password with token:", token);
    // For now, we'll just log this as the backend doesn't have this endpoint yet
    console.log("Password reset confirmation functionality needs to be implemented in the backend");
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  try {
    const { accessToken } = getTokens();
    
    if (!accessToken) {
      throw new Error("User not authenticated");
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to change password');
    }

    console.log("Password changed successfully");
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
}
