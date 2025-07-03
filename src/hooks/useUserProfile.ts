
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-utils';
import type { UserProfile } from '@/lib/types';
import { getProfileByIdFromDB } from '@/lib/db-utils';

export function useUserProfile() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (uid: string) => {
    if (!uid) {
      setLoading(false);
      setError("No user ID provided.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userProfile = await getProfileByIdFromDB(uid);
      if (userProfile) {
        setProfile(userProfile);
      } else {
        setError("Profile not found.");
      }
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      setError(err.message || "Failed to load user profile.");
      setProfile(null);
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
    }
  }, [authUser, authLoading, fetchProfile]);

  return { profile, loading, error };
}
