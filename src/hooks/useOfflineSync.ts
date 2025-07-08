
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/client';
import { useTranslations } from 'next-intl';

// In a real-world app, this would use IndexedDB. For this UI demo, we'll use a simple in-memory array.
interface OfflineAction {
  id: string;
  payload: any;
  timestamp: number;
}

export function useOfflineSync() {
  const t = useTranslations('OfflineIndicator');
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Safely get initial online status on the client
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsOnline(navigator.onLine);
    }
  }, []);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    toast({ title: t('toast.online.title'), description: t('toast.online.description') });
  }, [toast, t]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    toast({ title: t('toast.offline.title'), description: t('toast.offline.description'), variant: 'destructive' });
  }, [toast, t]);

  // Set up event listeners for online/offline status changes
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  // Simulate syncing process
  useEffect(() => {
    if (isOnline && pendingActions.length > 0 && !isSyncing) {
      const syncChanges = async () => {
        setIsSyncing(true);
        toast({ title: t('toast.syncing.title'), description: t('toast.syncing.description', { count: pendingActions.length }) });
        
        try {
          // In a real app, you would call your backend function here.
          // const uploadChanges = httpsCallable(functions, 'uploadOfflineChanges');
          // await uploadChanges({ changes: pendingActions });

          // Simulate network delay and success
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          toast({ title: t('toast.synced.title'), description: t('toast.synced.description') });
          setPendingActions([]); // Clear the queue on success
        } catch (error) {
          console.error("Sync failed:", error);
          toast({ title: t('toast.syncFailed.title'), description: t('toast.syncFailed.description'), variant: 'destructive' });
        } finally {
          setIsSyncing(false);
        }
      };
      
      syncChanges();
    }
  }, [isOnline, pendingActions, isSyncing, toast, t]);

  // Exposed function to add an action to the queue (for simulation)
  const addActionToQueue = useCallback((actionPayload: any) => {
    const newAction: OfflineAction = {
      id: `action-${Date.now()}`,
      payload: actionPayload,
      timestamp: Date.now()
    };
    setPendingActions(prev => [...prev, newAction]);
    toast({ title: t('toast.queued.title'), description: t('toast.queued.description') });
  }, [toast, t]);

  return { isOnline, pendingActionCount: pendingActions.length, isSyncing, addActionToQueue };
}
