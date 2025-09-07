

"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext, type AuthContextType } from "@/lib/auth-utils";
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth, functions } from '@/lib/firebase/client';
import { useOfflineSync } from '@/hooks/useOfflineSync'; // Import the hook
import type { UserProfile } from '@/lib/types';
import { httpsCallable } from 'firebase/functions';

// A dummy component to ensure the offline sync hook is initialized at the root.
function OfflineSyncInitializer() {
    useOfflineSync(); // This initializes the listeners and sync logic.
    return null; // It doesn't render anything.
}

const getProfileByIdFromDB = httpsCallable(functions, 'user-getProfileByIdFromDB');


export function Providers({ 
    children
}: { 
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async (uid: string) => {
        try {
            const result = await getProfileByIdFromDB({ uid });
            setProfile(result.data as UserProfile);
        } catch (error) {
            console.error("Failed to fetch user profile on auth change:", error);
            setProfile(null);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                await fetchProfile(firebaseUser.uid);
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });
        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [fetchProfile]);

    const authValue: AuthContextType = { user, profile, loading };

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
