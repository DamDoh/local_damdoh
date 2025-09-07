
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/client';
import { useTranslations } from 'next-intl';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type OfflineAction } from '@/lib/db';

export function useOfflineSync() {
  const t = useTranslations('OfflineIndicator');
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  // Use dexie-react-hooks to get a live count of pending actions.
  // This is more efficient than fetching the whole array.
  const pendingActionCount = useLiveQuery(() => db.outbox.count(), [], 0);

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

  // Syncing process
  useEffect(() => {
    if (isOnline && pendingActionCount > 0 && !isSyncing) {
      const syncChanges = async () => {
        setIsSyncing(true);
        toast({ title: t('toast.syncing.title'), description: t('toast.syncing.description', { count: pendingActionCount }) });
        
        try {
          // Fetch all pending actions from IndexedDB
          const actionsToSync = await db.outbox.toArray();
          
          // Call the backend function with the batch of changes
          const uploadChanges = httpsCallable(functions, 'offlineSync-uploadOfflineChanges');
          await uploadChanges({ changes: actionsToSync });
          
          // On success, clear the synced items from the outbox
          await db.outbox.clear();
          
          toast({ title: t('toast.synced.title'), description: t('toast.synced.description') });
        } catch (error) {
          console.error("Sync failed:", error);
          toast({ title: t('toast.syncFailed.title'), description: t('toast.syncFailed.description'), variant: 'destructive' });
        } finally {
          setIsSyncing(false);
        }
      };
      
      syncChanges();
    }
  }, [isOnline, pendingActionCount, isSyncing, toast, t, functions]);
  
  // Exposed function to add an action to the queue
  const addActionToQueue = useCallback(async (actionPayload: any) => {
    const newAction: OfflineAction = {
      ...actionPayload, // This should contain operation, collectionPath, documentId, payload
      timestamp: Date.now()
    };
    try {
        await db.outbox.add(newAction);
        toast({ title: t('toast.queued.title'), description: t('toast.queued.description') });
    } catch(error) {
        console.error("Failed to add action to offline queue:", error);
        toast({ title: "Error", description: "Could not save action for offline sync.", variant: "destructive"});
    }
  }, [toast, t]);

  return { isOnline, pendingActionCount: pendingActionCount || 0, isSyncing, addActionToQueue };
}
