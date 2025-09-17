"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense, useState, useEffect, createContext } from 'react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import type { AuthUser } from '@/lib/auth-utils';
import { useAuth } from '@/lib/auth-utils';
import type { UserProfile } from '@/lib/types';
import { apiCall } from '@/lib/api-utils';

export interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });


// A dummy component to ensure the offline sync hook is initialized at the root.
function OfflineSyncInitializer() {
    useOfflineSync(); // This initializes the listeners and sync logic.
    return null; // It doesn't render anything.
}

export function Providers({ 
    children
}: { 
    children: React.ReactNode;
}) {
    const { user: authUser, loading } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (authUser) {
            const fetchProfile = async () => {
                try {
                    const result = await apiCall(`/user/profile/${authUser.id}`, {
                        method: 'GET',
                    });
                    setProfile(result.data as UserProfile);
                } catch (error) {
                    console.error("Failed to fetch user profile:", error);
                    setProfile(null);
                }
            };
            
            fetchProfile();
        } else {
            setProfile(null);
        }
    }, [authUser]);
    
    const authValue = { user: authUser, profile, loading };

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <QueryClientProvider client={new QueryClient()}>
                <AuthContext.Provider value={authValue}>
                    {children}
                    <OfflineSyncInitializer />
                </AuthContext.Provider>
            </QueryClientProvider>
        </Suspense>
    );
}
