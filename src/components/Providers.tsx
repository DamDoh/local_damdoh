
"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext, type AuthContextType } from "@/lib/auth-utils";
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from '@/lib/firebase/client';
import { useOfflineSync } from '@/hooks/useOfflineSync'; // Import the hook
import { getProfileByIdFromDB } from '@/lib/server-actions';
import type { UserProfile } from '@/lib/types';


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
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = useCallback(async (uid: string) => {
        const userProfile = await getProfileByIdFromDB(uid);
        setProfile(userProfile);
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
