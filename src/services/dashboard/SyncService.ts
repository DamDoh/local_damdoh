/**
 * Cross-Platform Synchronization Service
 * Enables seamless data sync across devices and platforms with conflict resolution
 */

export interface SyncData {
  id: string;
  type: 'user_preferences' | 'dashboard_layout' | 'gamification_progress' | 'farm_data' | 'marketplace_activity' | 'voice_settings';
  data: any;
  version: number;
  timestamp: Date;
  deviceId: string;
  userId: string;
  checksum: string;
}

export interface SyncConflict {
  id: string;
  localData: SyncData;
  remoteData: SyncData;
  resolution?: 'local' | 'remote' | 'merge' | 'manual';
  resolvedAt?: Date;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: Date | null;
  pendingChanges: number;
  conflicts: SyncConflict[];
  syncInProgress: boolean;
  deviceId: string;
}

export interface SyncOptions {
  autoSync: boolean;
  syncInterval: number; // minutes
  conflictResolution: 'local' | 'remote' | 'manual';
  offlineMode: boolean;
  backgroundSync: boolean;
}

export class SyncService {
  private static instance: SyncService;
  private syncStatus: SyncStatus;
  private options: SyncOptions;
  private syncQueue: SyncData[] = [];
  private eventListeners: ((event: string, data?: any) => void)[] = [];
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.options = {
      autoSync: true,
      syncInterval: 5, // 5 minutes
      conflictResolution: 'manual',
      offlineMode: false,
      backgroundSync: true
    };

    this.syncStatus = {
      isOnline: navigator.onLine,
      lastSyncTime: null,
      pendingChanges: 0,
      conflicts: [],
      syncInProgress: false,
      deviceId: this.generateDeviceId()
    };

    this.initializeEventListeners();
    this.loadPersistedData();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private generateDeviceId(): string {
    const stored = localStorage.getItem('damdoh_device_id');
    if (stored) return stored;

    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('damdoh_device_id', deviceId);
    return deviceId;
  }

  private initializeEventListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.emitEvent('online');
      if (this.options.autoSync) {
        this.performSync();
      }
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
      this.emitEvent('offline');
    });

    // Page visibility for background sync
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.options.backgroundSync) {
        this.performSync();
      }
    });

    // Before unload, sync pending changes
    window.addEventListener('beforeunload', () => {
      if (this.syncQueue.length > 0) {
        this.persistSyncQueue();
      }
    });
  }

  private loadPersistedData(): void {
    try {
      const persistedQueue = localStorage.getItem('damdoh_sync_queue');
      if (persistedQueue) {
        this.syncQueue = JSON.parse(persistedQueue).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        this.syncStatus.pendingChanges = this.syncQueue.length;
      }

      const persistedConflicts = localStorage.getItem('damdoh_sync_conflicts');
      if (persistedConflicts) {
        this.syncStatus.conflicts = JSON.parse(persistedConflicts).map((conflict: any) => ({
          ...conflict,
          localData: { ...conflict.localData, timestamp: new Date(conflict.localData.timestamp) },
          remoteData: { ...conflict.remoteData, timestamp: new Date(conflict.remoteData.timestamp) },
          resolvedAt: conflict.resolvedAt ? new Date(conflict.resolvedAt) : undefined
        }));
      }

      const lastSync = localStorage.getItem('damdoh_last_sync');
      if (lastSync) {
        this.syncStatus.lastSyncTime = new Date(lastSync);
      }
    } catch (error) {
      console.error('Failed to load persisted sync data:', error);
    }
  }

  private persistSyncQueue(): void {
    try {
      localStorage.setItem('damdoh_sync_queue', JSON.stringify(this.syncQueue));
      localStorage.setItem('damdoh_sync_conflicts', JSON.stringify(this.syncStatus.conflicts));
      if (this.syncStatus.lastSyncTime) {
        localStorage.setItem('damdoh_last_sync', this.syncStatus.lastSyncTime.toISOString());
      }
    } catch (error) {
      console.error('Failed to persist sync data:', error);
    }
  }

  // Queue data for synchronization
  async queueForSync(type: SyncData['type'], data: any, userId: string): Promise<void> {
    const syncData: SyncData = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      version: Date.now(),
      timestamp: new Date(),
      deviceId: this.syncStatus.deviceId,
      userId,
      checksum: this.generateChecksum(data)
    };

    this.syncQueue.push(syncData);
    this.syncStatus.pendingChanges = this.syncQueue.length;
    this.persistSyncQueue();
    this.emitEvent('queued', syncData);

    // If online and auto-sync enabled, trigger sync
    if (this.syncStatus.isOnline && this.options.autoSync) {
      this.performSync();
    }
  }

  // Perform synchronization with server
  async performSync(): Promise<void> {
    if (this.syncStatus.syncInProgress || !this.syncStatus.isOnline) {
      return;
    }

    this.syncStatus.syncInProgress = true;
    this.emitEvent('sync_started');

    try {
      // Get user ID (would come from auth context in real app)
      const userId = 'current_user_id'; // Placeholder

      // Send local changes to server
      if (this.syncQueue.length > 0) {
        await this.sendChangesToServer(this.syncQueue, userId);
      }

      // Fetch remote changes
      const remoteChanges = await this.fetchChangesFromServer(userId);

      // Process remote changes and handle conflicts
      await this.processRemoteChanges(remoteChanges);

      // Update sync status
      this.syncStatus.lastSyncTime = new Date();
      this.syncStatus.pendingChanges = 0;
      this.syncQueue = [];
      this.persistSyncQueue();

      this.emitEvent('sync_completed');

    } catch (error) {
      console.error('Sync failed:', error);
      this.emitEvent('sync_failed', error);
    } finally {
      this.syncStatus.syncInProgress = false;
    }
  }

  private async sendChangesToServer(changes: SyncData[], userId: string): Promise<void> {
    // In a real implementation, this would make API calls to sync endpoint
    console.log('Sending changes to server:', changes);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo purposes, we'll assume all changes are successfully synced
    // In real app, handle partial failures and retries
  }

  private async fetchChangesFromServer(userId: string): Promise<SyncData[]> {
    // In a real implementation, this would fetch changes since last sync
    console.log('Fetching changes from server for user:', userId);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Return mock remote changes
    return [];
  }

  private async processRemoteChanges(remoteChanges: SyncData[]): Promise<void> {
    for (const remoteChange of remoteChanges) {
      const localChange = this.syncQueue.find(c => c.id === remoteChange.id);

      if (localChange) {
        // Conflict detected
        const conflict: SyncConflict = {
          id: `conflict_${Date.now()}`,
          localData: localChange,
          remoteData: remoteChange
        };

        if (this.options.conflictResolution === 'local') {
          conflict.resolution = 'local';
          conflict.resolvedAt = new Date();
        } else if (this.options.conflictResolution === 'remote') {
          conflict.resolution = 'remote';
          conflict.resolvedAt = new Date();
          // Apply remote change
          this.applySyncData(remoteChange);
        } else {
          // Manual resolution needed
          this.syncStatus.conflicts.push(conflict);
          this.emitEvent('conflict_detected', conflict);
        }
      } else {
        // No conflict, apply remote change
        this.applySyncData(remoteChange);
      }
    }
  }

  private applySyncData(syncData: SyncData): void {
    // Apply the synced data to local state
    switch (syncData.type) {
      case 'user_preferences':
        this.applyUserPreferences(syncData.data);
        break;
      case 'dashboard_layout':
        this.applyDashboardLayout(syncData.data);
        break;
      case 'gamification_progress':
        this.applyGamificationProgress(syncData.data);
        break;
      case 'farm_data':
        this.applyFarmData(syncData.data);
        break;
      case 'voice_settings':
        this.applyVoiceSettings(syncData.data);
        break;
      default:
        console.log('Unknown sync data type:', syncData.type);
    }

    this.emitEvent('data_applied', syncData);
  }

  private applyUserPreferences(preferences: any): void {
    // Apply user preferences to local storage/state
    Object.entries(preferences).forEach(([key, value]) => {
      localStorage.setItem(`user_pref_${key}`, JSON.stringify(value));
    });
  }

  private applyDashboardLayout(layout: any): void {
    // Apply dashboard layout changes
    localStorage.setItem('dashboard_layout', JSON.stringify(layout));
    // Trigger layout update event
    this.emitEvent('layout_updated', layout);
  }

  private applyGamificationProgress(progress: any): void {
    // Apply gamification progress
    localStorage.setItem('gamification_progress', JSON.stringify(progress));
    this.emitEvent('gamification_updated', progress);
  }

  private applyFarmData(farmData: any): void {
    // Apply farm data updates
    localStorage.setItem('farm_data', JSON.stringify(farmData));
    this.emitEvent('farm_data_updated', farmData);
  }

  private applyVoiceSettings(settings: any): void {
    // Apply voice settings
    localStorage.setItem('voice_settings', JSON.stringify(settings));
    this.emitEvent('voice_settings_updated', settings);
  }

  private generateChecksum(data: any): string {
    // Simple checksum generation
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  // Conflict resolution
  async resolveConflict(conflictId: string, resolution: SyncConflict['resolution']): Promise<void> {
    const conflictIndex = this.syncStatus.conflicts.findIndex(c => c.id === conflictId);
    if (conflictIndex === -1) return;

    const conflict = this.syncStatus.conflicts[conflictIndex];
    conflict.resolution = resolution;
    conflict.resolvedAt = new Date();

    if (resolution === 'local') {
      // Keep local data, mark remote as resolved
    } else if (resolution === 'remote') {
      // Apply remote data
      this.applySyncData(conflict.remoteData);
    } else if (resolution === 'merge') {
      // Merge data (would need merge logic based on data type)
      const mergedData = this.mergeData(conflict.localData, conflict.remoteData);
      this.applySyncData({ ...conflict.localData, data: mergedData });
    }

    // Remove resolved conflict
    this.syncStatus.conflicts.splice(conflictIndex, 1);
    this.persistSyncQueue();
    this.emitEvent('conflict_resolved', conflict);
  }

  private mergeData(localData: SyncData, remoteData: SyncData): any {
    // Simple merge strategy - remote wins for conflicts
    // In real app, would have sophisticated merge logic per data type
    return { ...localData.data, ...remoteData.data };
  }

  // Event system
  onSyncEvent(callback: (event: string, data?: any) => void): () => void {
    this.eventListeners.push(callback);
    return () => {
      const index = this.eventListeners.indexOf(callback);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  private emitEvent(event: string, data?: any): void {
    this.eventListeners.forEach(callback => callback(event, data));
  }

  // Auto-sync management
  startAutoSync(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      if (this.syncStatus.isOnline && this.options.autoSync) {
        this.performSync();
      }
    }, this.options.syncInterval * 60 * 1000);
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Settings management
  updateOptions(newOptions: Partial<SyncOptions>): void {
    this.options = { ...this.options, ...newOptions };

    if (newOptions.autoSync !== undefined) {
      if (newOptions.autoSync) {
        this.startAutoSync();
      } else {
        this.stopAutoSync();
      }
    }

    if (newOptions.syncInterval !== undefined && this.syncInterval) {
      this.stopAutoSync();
      this.startAutoSync();
    }

    localStorage.setItem('damdoh_sync_options', JSON.stringify(this.options));
  }

  getOptions(): SyncOptions {
    return { ...this.options };
  }

  getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Force sync
  async forceSync(): Promise<void> {
    await this.performSync();
  }

  // Clear all sync data (for testing/reset)
  clearSyncData(): void {
    this.syncQueue = [];
    this.syncStatus.conflicts = [];
    this.syncStatus.pendingChanges = 0;
    this.syncStatus.lastSyncTime = null;
    localStorage.removeItem('damdoh_sync_queue');
    localStorage.removeItem('damdoh_sync_conflicts');
    localStorage.removeItem('damdoh_last_sync');
  }
}