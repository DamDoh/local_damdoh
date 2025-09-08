
"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext, useAuth as useAuthHook } from "@/lib/auth-utils";
import React, { Suspense } from 'react';
import { useOfflineSync } from '@/hooks/useOfflineSync';

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
    // The actual authentication state is managed within the useAuth hook,
    // which is provided by the AuthContext.Provider in a higher-level component if needed,
    // or this can be the root provider.
    const authValue = useAuthHook();

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
