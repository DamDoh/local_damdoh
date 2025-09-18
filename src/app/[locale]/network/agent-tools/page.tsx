
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, Phone, Search, User, ShieldAlert, Frown } from "lucide-react";
import Link from 'next/link';
import { apiCall } from '@/lib/api-utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-utils';
import { useUserProfile } from '@/hooks/useUserProfile';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StakeholderIcon } from '@/components/icons/StakeholderIcon';
import { useTranslations } from 'next-intl';

export default function AgentToolsPage() {
    const t = useTranslations('agentToolsPage');
    const { user: authUser, loading: authLoading } = useAuth();
    const { profile: agentProfile, loading: profileLoading } = useUserProfile();
    const { toast } = useToast();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);

    const handleLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber.trim()) {
            setSearchError(t('phoneRequiredError'));
            return;
        }
        setIsLoading(true);
        setFoundUser(null);
        setSearchError(null);
        try {
            const result = await apiCall<UserProfile>('/users/lookup-by-phone', {
                method: 'POST',
                body: JSON.stringify({ phoneNumber })
            });
            setFoundUser(result);
        } catch (error: any) {
            console.error("Error looking up user:", error);
            setSearchError(error.message || "An unexpected error occurred.");
            toast({
                title: "Lookup Failed",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const isAuthorized = agentProfile?.primaryRole === 'Field Agent/Agronomist (DamDoh Internal)' || agentProfile?.primaryRole === 'Admin';

    if (authLoading || profileLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }
    
    if (!isAuthorized) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-destructive" />{t('accessDeniedTitle')}</CardTitle>
                    <CardDescription>{t('accessDeniedDescription')}</CardDescription>
                </CardHeader>
                 <CardContent>
                     <Button asChild variant="outline">
                        <Link href="/network"><ArrowLeft className="h-4 w-4 mr-2"/>{t('backLink')}</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <Link href="/network" className="inline-flex items-center text-sm text-primary hover:underline">
                <ArrowLeft className="mr-1 h-4 w-4" /> {t('backLink')}
            </Link>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl">{t('title')}</CardTitle>
                    <CardDescription>{t('description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLookup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone-lookup" className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground"/>{t('findUserLabel')}</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="phone-lookup"
                                    type="tel"
                                    placeholder="e.g., +254712345678"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                                <Button type="submit" disabled={isLoading || !phoneNumber.trim()}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                    {t('findButton')}
                                </Button>
                            </div>
                        </div>
                    </form>
                    
                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">{t('resultsTitle')}</h3>
                        {isLoading ? (
                            <div className="p-4 border rounded-lg flex items-center gap-4">
                                <Skeleton className="h-16 w-16 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                    <Skeleton className="h-3 w-28" />
                                </div>
                            </div>
                        ) : searchError ? (
                             <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg text-center">
                                 <Frown className="mx-auto h-8 w-8 text-destructive mb-2" />
                                 <p className="text-sm text-destructive">{searchError}</p>
                             </div>
                        ) : foundUser ? (
                            <Card>
                                <CardContent className="p-4 flex items-center gap-4">
                                     <Avatar className="h-16 w-16">
                                        <AvatarImage src={foundUser.avatarUrl} alt={foundUser.displayName} />
                                        <AvatarFallback>{foundUser.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <Link href={`/profiles/${foundUser.id}`} className="hover:underline">
                                           <h4 className="font-semibold">{foundUser.displayName}</h4>
                                        </Link>
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <StakeholderIcon role={foundUser.primaryRole} className="h-4 w-4" />
                                            {foundUser.primaryRole}
                                        </div>
                                        <Badge variant="outline" className="mt-1 font-mono text-xs">{foundUser.universalId}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                           <div className="p-4 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                                <p>{t('resultsPlaceholder')}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
