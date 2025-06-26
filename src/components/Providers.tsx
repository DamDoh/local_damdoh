
"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext, type AuthContextType } from "@/lib/auth-utils";
import { NextIntlClientProvider } from 'next-intl';
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from '@/lib/firebase/client';


// Create a client once
const queryClient = new QueryClient();

export function Providers({ 
    children,
    locale,
    messages
}: { 
    children: React.ReactNode;
    locale: string;
    messages: any; // Using 'any' as AbstractMessages can be complex
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
        <NextIntlClientProvider locale={locale} messages={messages}>
            <QueryClientProvider client={queryClient}>
                <AuthContext.Provider value={authValue}>
                    {children}
                </AuthContext.Provider>
            </QueryClientProvider>
        </NextIntlClientProvider>
    );
}
