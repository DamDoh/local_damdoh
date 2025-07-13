
"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext, type AuthContextType } from "@/lib/auth-utils";
import React, { useState, useEffect, Suspense } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from '@/lib/firebase/client';
import { useOfflineSync } from '@/hooks/useOfflineSync'; // Import the hook

// Create a client once
const queryClient = new QueryClient();

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const authValue: AuthContextType = { user, loading };

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <QueryClientProvider client={queryClient}>
                <AuthContext.Provider value={authValue}>
                    {children}
                    <OfflineSyncInitializer />
                </AuthContext.Provider>
            </QueryClientProvider>
        </Suspense>
    );
}
