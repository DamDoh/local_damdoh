/**
 * Sync Hook - Provides cross-platform synchronization functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { SyncService, SyncStatus, SyncOptions, SyncData, SyncConflict } from '@/services/dashboard/SyncService';

export interface UseSyncReturn {
  // Status
  syncStatus: SyncStatus;
  options: SyncOptions;

  // Actions
  queueForSync: (type: SyncData['type'], data: any, userId: string) => Promise<void>;
  performSync: () => Promise<void>;
  resolveConflict: (conflictId: string, resolution: SyncConflict['resolution']) => Promise<void>;
  updateOptions: (newOptions: Partial<SyncOptions>) => void;
  forceSync: () => Promise<void>;
  clearSyncData: () => void;

  // Events
  onSyncEvent: (callback: (event: string, data?: any) => void) => () => void;
}

export const useSync = (): UseSyncReturn => {
  const syncService = SyncService.getInstance();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncService.getStatus());
  const [options, setOptions] = useState<SyncOptions>(syncService.getOptions());

  // Listen for sync events
  useEffect(() => {
    const unsubscribe = syncService.onSyncEvent((event, data) => {
      // Update status on any sync event
      setSyncStatus(syncService.getStatus());

      // Handle specific events
      switch (event) {
        case 'sync_completed':
        case 'sync_failed':
        case 'online':
        case 'offline':
          setSyncStatus(syncService.getStatus());
          break;
        case 'conflict_detected':
          // Could show notification or modal for conflict resolution
          console.log('Sync conflict detected:', data);
          break;
        case 'data_applied':
          // Data was updated, could trigger re-renders
          console.log('Sync data applied:', data);
          break;
      }
    });

    return unsubscribe;
  }, []);

  // Update options when they change
  useEffect(() => {
    setOptions(syncService.getOptions());
  }, []);

  const queueForSync = useCallback(async (type: SyncData['type'], data: any, userId: string) => {
    await syncService.queueForSync(type, data, userId);
  }, []);

  const performSync = useCallback(async () => {
    await syncService.performSync();
  }, []);

  const resolveConflict = useCallback(async (conflictId: string, resolution: SyncConflict['resolution']) => {
    await syncService.resolveConflict(conflictId, resolution);
  }, []);

  const updateOptions = useCallback((newOptions: Partial<SyncOptions>) => {
    syncService.updateOptions(newOptions);
    setOptions(syncService.getOptions());
  }, []);

  const forceSync = useCallback(async () => {
    await syncService.forceSync();
  }, []);

  const clearSyncData = useCallback(() => {
    syncService.clearSyncData();
    setSyncStatus(syncService.getStatus());
  }, []);

  const onSyncEvent = useCallback((callback: (event: string, data?: any) => void) => {
    return syncService.onSyncEvent(callback);
  }, []);

  return {
    syncStatus,
    options,
    queueForSync,
    performSync,
    resolveConflict,
    updateOptions,
    forceSync,
    clearSyncData,
    onSyncEvent
  };
};

// Hook for syncing user preferences
export const useSyncPreferences = (userId: string) => {
  const { queueForSync } = useSync();

  const syncPreference = useCallback(async (key: string, value: any) => {
    await queueForSync('user_preferences', { [key]: value }, userId);
  }, [queueForSync, userId]);

  return { syncPreference };
};

// Hook for syncing dashboard layout
export const useSyncLayout = (userId: string) => {
  const { queueForSync } = useSync();

  const syncLayout = useCallback(async (layout: any) => {
    await queueForSync('dashboard_layout', layout, userId);
  }, [queueForSync, userId]);

  return { syncLayout };
};

// Hook for syncing gamification progress
export const useSyncGamification = (userId: string) => {
  const { queueForSync } = useSync();

  const syncProgress = useCallback(async (progress: any) => {
    await queueForSync('gamification_progress', progress, userId);
  }, [queueForSync, userId]);

  return { syncProgress };
};

// Hook for syncing farm data
export const useSyncFarmData = (userId: string) => {
  const { queueForSync } = useSync();

  const syncFarmData = useCallback(async (farmData: any) => {
    await queueForSync('farm_data', farmData, userId);
  }, [queueForSync, userId]);

  return { syncFarmData };
};

// Hook for syncing voice settings
export const useSyncVoiceSettings = (userId: string) => {
  const { queueForSync } = useSync();

  const syncVoiceSettings = useCallback(async (settings: any) => {
    await queueForSync('voice_settings', settings, userId);
  }, [queueForSync, userId]);

  return { syncVoiceSettings };
};