
"use client";

import { useState, useEffect, useCallback } from 'react';
import { HOMEPAGE_PREFERENCE_KEY } from '@/lib/constants';

export function useHomepagePreference() {
  const [preference, setPreference] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // This effect runs only on the client after hydration
    setIsMounted(true);
    const storedPreference = localStorage.getItem(HOMEPAGE_PREFERENCE_KEY);
    setPreference(storedPreference);
  }, []);

  const getHomepagePreference = useCallback((): string | null => {
    if (typeof window !== 'undefined') { // Ensure localStorage is accessed only on client
      return localStorage.getItem(HOMEPAGE_PREFERENCE_KEY);
    }
    return null;
  }, []);

  const setHomepagePreference = useCallback((path: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(HOMEPAGE_PREFERENCE_KEY, path);
      setPreference(path);
    }
  }, []);

  const clearHomepagePreference = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(HOMEPAGE_PREFERENCE_KEY);
      setPreference(null);
    }
  }, []);
  
  // Only return the actual preference value once isMounted is true
  // This helps prevent hydration mismatches if this hook were used during SSR
  // (though for localStorage, it inherently won't work SSR).
  const currentPreference = isMounted ? preference : null;

  return {
    homepagePreference: currentPreference,
    getHomepagePreference, // This can be called anytime, will return null on server
    setHomepagePreference,
    clearHomepagePreference,
    isPreferenceLoading: !isMounted, // Flag to indicate if preference is still being loaded from localStorage
  };
}
