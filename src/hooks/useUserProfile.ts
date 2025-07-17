
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-utils';
import type { UserProfile } from '@/lib/types';
import { getProfileByIdFromDB } from '@/lib/server-actions';


/**
 * @deprecated This hook is deprecated. User profile data is now provided globally via `useAuth()` from `AuthContext`.
 * @returns An object containing the user's profile, loading state, and any errors.
 */
export function useUserProfile() {
  const { profile, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // This hook now primarily acts as a wrapper around the global context
  // for any components that might still be using it directly.
  // The fetching logic has been moved to Providers.tsx.

  useEffect(() => {
    if (!loading && !profile) {
      setError("No profile data found in authentication context.");
    } else {
      setError(null);
    }
  }, [profile, loading]);
  

  return { profile, loading, error };
}
