import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

interface OfflineData {
  id: string;
  type: 'crop_observation' | 'market_listing' | 'farm_activity' | 'weather_alert' | 'loan_application' | 'document_scan' | 'field_visit' | 'financial_report';
  data: any;
  timestamp: number;
  synced: boolean;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingData, setPendingData] = useState<OfflineData[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Load pending data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('damdoh-offline-data');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setPendingData(data);
      } catch (error) {
        console.error('Failed to load offline data:', error);
      }
    }
  }, []);

  // Save pending data to localStorage
  const saveToStorage = useCallback((data: OfflineData[]) => {
    localStorage.setItem('damdoh-offline-data', JSON.stringify(data));
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Syncing your data...",
      });
      syncPendingData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "Your data will be saved locally and synced when online.",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Add data to offline queue
  const addOfflineData = useCallback((type: OfflineData['type'], data: any) => {
    const offlineItem: OfflineData = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      synced: false
    };

    setPendingData(prev => {
      const updated = [...prev, offlineItem];
      saveToStorage(updated);
      return updated;
    });

    if (!isOnline) {
      toast({
        title: "Saved Offline",
        description: `${type.replace('_', ' ')} saved locally. Will sync when online.`,
      });
    }

    return offlineItem.id;
  }, [isOnline, saveToStorage, toast]);

  // Sync pending data when back online
  const syncPendingData = useCallback(async () => {
    if (!isOnline || pendingData.length === 0 || isSyncing) return;

    setIsSyncing(true);
    let syncedCount = 0;

    try {
      for (const item of pendingData) {
        if (item.synced) continue;

        try {
          // Sync based on data type
          switch (item.type) {
            case 'crop_observation':
              await fetch('/api/farm-management/crops/observations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.data)
              });
              break;
            case 'market_listing':
              await fetch('/api/marketplace/listings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.data)
              });
              break;
            case 'farm_activity':
              await fetch('/api/farm-management/activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.data)
              });
              break;
            case 'weather_alert':
              await fetch('/api/weather/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.data)
              });
              break;
            case 'loan_application':
              await fetch('/api/fi/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.data)
              });
              break;
            case 'document_scan':
              await fetch('/api/fi/documents/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.data)
              });
              break;
            case 'field_visit':
              await fetch('/api/fi/field-visits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.data)
              });
              break;
            case 'financial_report':
              await fetch('/api/fi/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.data)
              });
              break;
          }

          // Mark as synced
          setPendingData(prev =>
            prev.map(p => p.id === item.id ? { ...p, synced: true } : p)
          );
          syncedCount++;

        } catch (error) {
          console.error(`Failed to sync ${item.type}:`, error);
        }
      }

      if (syncedCount > 0) {
        toast({
          title: "Data Synced",
          description: `Successfully synced ${syncedCount} items.`,
        });

        // Clean up synced data after a delay
        setTimeout(() => {
          setPendingData(prev => {
            const filtered = prev.filter(p => !p.synced);
            saveToStorage(filtered);
            return filtered;
          });
        }, 5000);
      }

    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: "Sync Failed",
        description: "Some data couldn't be synced. Will retry later.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, pendingData, isSyncing, saveToStorage, toast]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingData.length > 0) {
      const timer = setTimeout(syncPendingData, 2000); // Delay to avoid immediate sync
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingData.length, syncPendingData]);

  return {
    isOnline,
    pendingData,
    isSyncing,
    addOfflineData,
    syncPendingData,
    pendingCount: pendingData.filter(p => !p.synced).length
  };
}
