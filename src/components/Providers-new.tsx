"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { Suspense, useState, useEffect, createContext } from 'react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import type { AuthUser } from '@/lib/auth-utils-new';
import { getCurrentUser, getTokens } from '@/lib/auth-utils-new';

export interface AuthContextType {
  user: AuthUser | null;
  profile: any | null; // We'll need to define a proper profile type later
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

// A dummy component to ensure the offline sync hook is initialized at the root.
function OfflineSyncInitializer() {
    useOfflineSync(); // This initializes the listeners and sync logic.
    return null; // It doesn't render anything.
}

// PWA initializer component
function PWAInitializer() {
    useEffect(() => {
        // Register service worker if supported
        if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('PWA: Service worker registered successfully');
                })
                .catch((error) => {
                    console.log('PWA: Service worker registration failed:', error);
                });
        }

        // Handle PWA install prompt
        let deferredPrompt: Event | null = null;

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            deferredPrompt = e;
            (window as any).deferredPrompt = deferredPrompt;
        };

        const handleAppInstalled = () => {
            deferredPrompt = null;
            (window as any).deferredPrompt = null;
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    return null;
}

export function Providers({ 
    children
}: { 
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [profile, setProfile] = useState<any | null>(null); // We'll need to define a proper profile type later
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const currentUser = getCurrentUser();
        const { accessToken } = getTokens();
        
        if (currentUser && accessToken) {
            setUser(currentUser);
            // TODO: Fetch user profile from backend API
            setProfile(null);
        }
        
        setLoading(false);
    }, []);
    
    const authValue = { user, profile, loading };

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <QueryClientProvider client={new QueryClient()}>
                <AuthContext.Provider value={authValue}>
                    {children}
                    <OfflineSyncInitializer />
                    <PWAInitializer />
                </AuthContext.Provider>
            </QueryClientProvider>
        </Suspense>
    );
}