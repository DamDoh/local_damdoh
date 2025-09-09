
"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense, useState, useEffect, createContext } from 'react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, functions } from '@/lib/firebase/client';
import type { UserProfile } from '@/lib/types';
import { httpsCallable } from "firebase/functions";

export interface AuthContextType {
  user: User | null;
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
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false); // Firebase is not configured, stop loading
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser && functions) {
                try {
                    const getProfile = httpsCallable(functions, 'user-getProfileByIdFromDB');
                    const result = await getProfile({ uid: currentUser.uid });
                    setProfile(result.data as UserProfile);
                } catch (error) {
                    console.error("Failed to fetch user profile:", error);
                    setProfile(null);
                }
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [functions]);
    
    const authValue = { user, profile, loading };

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
