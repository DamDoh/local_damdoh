
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Info, TrendingUp, MoreHorizontal, RefreshCw, AlertTriangle, Ticket } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-utils";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import type { SuggestedConnectionsOutput, SuggestedConnectionsInput } from "@/lib/types";


interface AISuggestion {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  reason?: string;
  dataAiHint?: string;
}

export function DashboardRightSidebar() {
  const t = useTranslations('DashboardRightSidebar');
  const { toast } = useToast();
  const [followedSuggestions, setFollowedSuggestions] = useState<Set<string>>(new Set());
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  
  const { user, profile, loading: authLoading } = useAuth(); // Using the centralized profile

  const sendConnectionRequestCallable = useMemo(() => httpsCallable(functions, 'network-sendConnectionRequest'), [functions]);
  const suggestConnectionsCallable = useMemo(() => httpsCallable(functions, 'suggestConnections'), [functions]);

  const fetchSuggestions = useCallback(async () => {
    if (!profile) return; // Wait until the user profile is loaded from context

    setIsLoadingSuggestions(true);
    setSuggestionError(null);
    try {
      const userInput: SuggestedConnectionsInput = {
        userId: profile.id,
        count: 5,
        language: 'en', // Hardcoding for now, can be replaced with locale
      };

      const result = (await suggestConnectionsCallable(userInput)).data as SuggestedConnectionsOutput;
      
      if (result && Array.isArray(result.suggestions)) {
        setAiSuggestions(result.suggestions.map(s => ({
          ...s,
          id: s.id || `missing-id-${Math.random()}`,
          name: s.name || "Unnamed User",
          role: s.role || "Unknown Role",
          avatarUrl: s.avatarUrl || 'https://placehold.co/50x50.png',
          dataAiHint: `${(s.role || 'profile').toLowerCase().split(" ")[0]} profile`
        })));
      } else {
        setAiSuggestions([]);
        setSuggestionError("No suggestions received from AI.");
      }
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      setSuggestionError(t('loadError'));
      setAiSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [profile, t, suggestConnectionsCallable]);

  useEffect(() => {
    // Only fetch suggestions if we are not loading profile and user exists
    if (!authLoading && user && profile) {
      fetchSuggestions();
    } else if (!authLoading && !user) {
      // If user is not logged in, stop loading and clear suggestions
      setIsLoadingSuggestions(false);
      setAiSuggestions([]);
    }
  }, [authLoading, user, profile, fetchSuggestions]);


  const handleFollow = async (suggestionId: string) => {
    if (!user) {
        toast({ title: t('toast.signInToConnect'), variant: "destructive" });
        return;
    }
    setFollowedSuggestions(prev => new Set(prev).add(suggestionId));
    try {
        await sendConnectionRequestCallable({ recipientId: suggestionId });
        toast({ title: t('toast.requestSent'), description: t('toast.requestSentDescription')});
    } catch (error: any) {
        toast({ title: t('toast.requestFailed'), description: error.message, variant: "destructive" });
        setFollowedSuggestions(prev => {
            const newSet = new Set(prev);
            newSet.delete(suggestionId);
            return newSet;
        });
    }
  };

  const renderSuggestions = () => {
    if (authLoading) {
      return Array.from({ length: 3 }).map((_, index) => (
        <li key={`skeleton-${index}`} className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 rounded-md" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-7 w-20 mt-1" />
          </div>
        </li>
      ));
    }
    
    if (!user) {
        return <p className="text-sm text-muted-foreground text-center py-4">{t('signInPrompt')}</p>;
    }
    
    if (isLoadingSuggestions) {
       return Array.from({ length: 3 }).map((_, index) => (
        <li key={`skeleton-${index}`} className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 rounded-md" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-7 w-20 mt-1" />
          </div>
        </li>
      ));
    }


    if (suggestionError) {
      return (
        <div className="text-center text-destructive py-4">
          <AlertTriangle className="inline-block mr-2 h-5 w-5" />
          {suggestionError}
        </div>
      );
    }

    if (aiSuggestions.length === 0) {
      return <p className="text-sm text-muted-foreground text-center py-4">{t('noSuggestions')}</p>;
    }

    return aiSuggestions.map(sug => (
      <li key={sug.id} className="flex items-start gap-3">
        <Link href={`/profiles/${sug.id}`}>
          <Avatar className="h-12 w-12 rounded-md cursor-pointer">
            <AvatarImage src={sug.avatarUrl} alt={sug.name} data-ai-hint={sug.dataAiHint || "profile agriculture"} />
            <AvatarFallback>{sug.name?.substring(0, 1) || '?'}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <Link href={`/profiles/${sug.id}`} className="hover:underline">
            <h4 className="text-sm font-semibold">{sug.name || 'Unnamed User'}</h4>
          </Link>
          <p className="text-xs text-muted-foreground line-clamp-1">{sug.role || 'No Role'}</p>
          {sug.reason && <p className="text-xs text-muted-foreground/80 mt-0.5 line-clamp-2 italic">"{sug.reason}"</p>}
          <Button
            variant="outline"
            size="sm"
            className="mt-1.5 h-7 px-2 text-xs"
            onClick={() => handleFollow(sug.id)}
            disabled={followedSuggestions.has(sug.id)}
          >
            {followedSuggestions.has(sug.id) ? (
              t('following')
            ) : (
              <>
                <Plus className="mr-1 h-3 w-3" /> {t('follow')}
              </>
            )}
          </Button>
        </div>
      </li>
    ));
  };


  return (
    <div className="space-y-4 sticky top-20">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-md font-semibold">{t('networkTitle')}</CardTitle>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={fetchSuggestions} className="h-7 w-7" title={t('refreshSuggestions')} disabled={isLoadingSuggestions}>
              <RefreshCw className={`h-4 w-4 ${isLoadingSuggestions ? 'animate-spin' : ''}`} />
            </Button>
            <Info className="h-4 w-4 text-muted-foreground cursor-pointer ml-1" title={t('infoTooltip')} />
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {renderSuggestions()}
          </ul>
          {!isLoadingSuggestions && aiSuggestions.length > 0 && (
             <Button variant="link" className="px-0 text-xs text-muted-foreground hover:text-primary mt-2" asChild>
                <Link href="/network/my-network">
                {t('viewAllButton')} <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
            </Button>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="text-md font-semibold">{t('promotionsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{t('promotionsDescription')}</p>
            <Button asChild variant="outline" className="w-full">
                <Link href="/marketplace/promotions"><Ticket className="mr-2 h-4 w-4"/>{t('managePromotionsButton')}</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
