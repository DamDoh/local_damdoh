/**
 * Offline Indicator Component - Shows connection status and sync progress
 * Provides visual feedback about online/offline state and data synchronization
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  X,
  Cloud,
  CloudOff,
  Smartphone
} from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import { cn } from "@/lib/utils";

interface OfflineIndicatorProps {
  className?: string;
  showInstallPrompt?: boolean;
  compact?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className,
  showInstallPrompt = true,
  compact = false
}) => {
  const { isOnline, isOffline, syncStatus, isInstallable, deferredPrompt, actions } = usePWA();
  const [showDetails, setShowDetails] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Auto-hide after successful sync
  useEffect(() => {
    if (syncStatus === 'completed') {
      const timer = setTimeout(() => setDismissed(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  // Reset dismissed state when going offline
  useEffect(() => {
    if (isOffline) {
      setDismissed(false);
    }
  }, [isOffline]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      (deferredPrompt as any).prompt();
      const { outcome } = await (deferredPrompt as any).userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      (window as any).deferredPrompt = null;
    }
  };

  if (dismissed && isOnline && syncStatus !== 'syncing') {
    return null;
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {isOffline ? (
          <Badge variant="destructive" className="gap-1">
            <WifiOff className="h-3 w-3" />
            Offline
          </Badge>
        ) : syncStatus === 'syncing' ? (
          <Badge variant="secondary" className="gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Syncing
          </Badge>
        ) : syncStatus === 'completed' ? (
          <Badge variant="default" className="gap-1 bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            Synced
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1">
            <Wifi className="h-3 w-3" />
            Online
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={cn(
      "border-l-4 transition-all duration-300",
      isOffline
        ? "border-l-red-500 bg-red-50"
        : syncStatus === 'syncing'
        ? "border-l-blue-500 bg-blue-50"
        : syncStatus === 'completed'
        ? "border-l-green-500 bg-green-50"
        : "border-l-green-500 bg-green-50",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOffline ? (
              <div className="flex items-center gap-2">
                <WifiOff className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">You're Offline</p>
                  <p className="text-sm text-red-700">Working with cached data</p>
                </div>
              </div>
            ) : syncStatus === 'syncing' ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                <div>
                  <p className="font-medium text-blue-900">Syncing Data</p>
                  <p className="text-sm text-blue-700">Updating your information</p>
                </div>
              </div>
            ) : syncStatus === 'completed' ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Sync Complete</p>
                  <p className="text-sm text-green-700">All data is up to date</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Online</p>
                  <p className="text-sm text-green-700">Connected and ready</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {showInstallPrompt && isInstallable && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleInstall}
                className="gap-2"
              >
                <Smartphone className="h-4 w-4" />
                Install App
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Less' : 'More'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Connection Status</h4>
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <Cloud className="h-4 w-4 text-green-600" />
                  ) : (
                    <CloudOff className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">
                    {isOnline ? 'Connected to internet' : 'No internet connection'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Data Sync</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Dashboard layouts</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Messages</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Farm data</span>
                    <span className="text-green-600">✓</span>
                  </div>
                </div>
              </div>
            </div>

            {syncStatus === 'syncing' && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Syncing...</span>
                  <span className="text-sm text-muted-foreground">Please wait</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            )}

            {isOffline && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Offline Mode Active</p>
                    <p className="text-sm text-yellow-800">
                      You can continue using DamDoh with cached data. Changes will sync automatically when connection returns.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};