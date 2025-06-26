
"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext, type AuthContextType } from "@/lib/auth-utils";
import React, { useState, useEffect, Suspense } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from '@/lib/firebase/client';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';


// Create a client once
const queryClient = new QueryClient();

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
            <I18nextProvider i18n={i18n}>
                <QueryClientProvider client={queryClient}>
                    <AuthContext.Provider value={authValue}>
                        {children}
                    </AuthContext.Provider>
                </QueryClientProvider>
            </I18nextProvider>
        </Suspense>
    );
}
