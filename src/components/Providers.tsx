
"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from "@/lib/auth-utils";
import { NextIntlClientProvider } from 'next-intl';
import React from 'react';

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
    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </QueryClientProvider>
        </NextIntlClientProvider>
    );
}
