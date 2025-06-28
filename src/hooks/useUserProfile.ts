
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-utils';
import type { UserProfile } from '@/lib/types';
import { getProfileByIdFromDB } from '@/lib/db-utils';

// Simple in-memory cache
let userProfileCache: UserProfile | null = null;
let lastFetchedUid: string | null = null;

export function useUserProfile() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (uid: string) => {
    // If we have a cached profile for the current user, use it immediately
    if (lastFetchedUid === uid && userProfileCache) {
        setProfile(userProfileCache);
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const userProfile = await getProfileByIdFromDB(uid);
      setProfile(userProfile);
      // Update cache
      userProfileCache = userProfile;
      lastFetchedUid = uid;
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      setError("Failed to load user profile.");
      // Clear cache on error
      userProfileCache = null;
      lastFetchedUid = null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    
    if (authUser) {
      fetchProfile(authUser.uid);
    } else {
      // Not authenticated, so no profile to fetch
      setProfile(null);
      setLoading(false);
      setError(null);
      // Clear cache on logout
      userProfileCache = null;
      lastFetchedUid = null;
    }
  }, [authUser, authLoading, fetchProfile]);

  return { profile, loading, error };
}
