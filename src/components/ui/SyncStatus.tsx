/**
 * Sync Status Component - Shows cross-platform synchronization status and controls
 */

import React, { useState } from 'react';
import { Cloud, CloudOff, RefreshCw, Settings, AlertTriangle, CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { useSync } from '@/hooks/useSync';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SyncStatusProps {
  compact?: boolean;
  showSettings?: boolean;
  className?: string;
}

const SyncStatus: React.FC<SyncStatusProps> = ({
  compact = false,
  showSettings = true,
  className = ''
}) => {
  const {
    syncStatus,
    options,
    performSync,
    updateOptions,
    forceSync,
    clearSyncData
  } = useSync();

  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) {
      return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
    if (syncStatus.syncInProgress) {
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    if (syncStatus.conflicts.length > 0) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    if (syncStatus.lastSyncTime) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Cloud className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) {
      return 'Offline';
    }
    if (syncStatus.syncInProgress) {
      return 'Syncing...';
    }
    if (syncStatus.conflicts.length > 0) {
      return `${syncStatus.conflicts.length} conflicts`;
    }
    if (syncStatus.lastSyncTime) {
      const timeAgo = getTimeAgo(syncStatus.lastSyncTime);
      return `Synced ${timeAgo}`;
    }
    return 'Not synced';
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleForceSync = async () => {
    try {
      await forceSync();
    } catch (error) {
      console.error('Force sync failed:', error);
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {getStatusIcon()}
        <span className="text-sm text-gray-600">{getStatusText()}</span>
        {syncStatus.pendingChanges > 0 && (
          <Badge variant="secondary" className="text-xs">
            {syncStatus.pendingChanges} pending
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border overflow-hidden ${className}`}
         style={{ borderColor: 'var(--color-border)' }}>
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
              {getStatusIcon()}
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                Sync Status
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>
                {getStatusText()}
              </p>
            </div>
          </div>

          {showSettings && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettingsPanel(!showSettingsPanel)}
              style={{ color: 'var(--color-textSecondary)' }}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Status indicators */}
        <div className="mt-3 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            {syncStatus.isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span style={{ color: 'var(--color-textSecondary)' }}>
              {syncStatus.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {syncStatus.pendingChanges > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span style={{ color: 'var(--color-textSecondary)' }}>
                {syncStatus.pendingChanges} pending changes
              </span>
            </div>
          )}

          {syncStatus.conflicts.length > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span style={{ color: 'var(--color-textSecondary)' }}>
                {syncStatus.conflicts.length} conflicts
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Quick actions */}
        <div className="flex gap-2 mb-4">
          <Button
            onClick={handleForceSync}
            disabled={!syncStatus.isOnline || syncStatus.syncInProgress}
            size="sm"
            className="flex-1"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus.syncInProgress ? 'animate-spin' : ''}`} />
            {syncStatus.syncInProgress ? 'Syncing...' : 'Sync Now'}
          </Button>

          {syncStatus.pendingChanges > 0 && (
            <Button
              onClick={() => performSync()}
              variant="outline"
              size="sm"
              disabled={!syncStatus.isOnline}
            >
              Upload Changes
            </Button>
          )}
        </div>

        {/* Conflicts */}
        {syncStatus.conflicts.length > 0 && (
          <div className="mb-4 p-3 rounded-lg border border-yellow-200 bg-yellow-50">
            <h4 className="font-medium text-yellow-800 mb-2">Sync Conflicts</h4>
            <p className="text-sm text-yellow-700 mb-3">
              {syncStatus.conflicts.length} conflicts need resolution
            </p>
            <Button
              size="sm"
              variant="outline"
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              Resolve Conflicts
            </Button>
          </div>
        )}

        {/* Settings panel */}
        {showSettingsPanel && (
          <div className="border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
            <h4 className="font-medium mb-3" style={{ color: 'var(--color-text)' }}>Sync Settings</h4>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--color-text)' }}>Auto Sync</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.autoSync}
                    onChange={(e) => updateOptions({ autoSync: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--color-text)' }}>Background Sync</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.backgroundSync}
                    onChange={(e) => updateOptions({ backgroundSync: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Sync Interval (minutes)
                </label>
                <select
                  value={options.syncInterval}
                  onChange={(e) => updateOptions({ syncInterval: parseInt(e.target.value) })}
                  className="w-full text-sm border rounded px-2 py-1"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
                >
                  <option value="1">Every minute</option>
                  <option value="5">Every 5 minutes</option>
                  <option value="15">Every 15 minutes</option>
                  <option value="30">Every 30 minutes</option>
                  <option value="60">Every hour</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Conflict Resolution
                </label>
                <select
                  value={options.conflictResolution}
                  onChange={(e) => updateOptions({ conflictResolution: e.target.value as any })}
                  className="w-full text-sm border rounded px-2 py-1"
                  style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
                >
                  <option value="manual">Ask me to resolve</option>
                  <option value="local">Keep my changes</option>
                  <option value="remote">Use server changes</option>
                </select>
              </div>

              {/* Advanced options */}
              <div className="pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <Button
                  onClick={clearSyncData}
                  variant="outline"
                  size="sm"
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                >
                  Clear Sync Data
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  This will reset all sync data and may cause data loss
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncStatus;