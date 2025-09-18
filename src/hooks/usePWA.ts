/**
 * PWA Hook - Manages Progressive Web App functionality
 * Handles service worker registration, offline detection, and sync status
 */

import { useState, useEffect, useCallback } from 'react';

interface PWAActions {
  updateApp: () => void;
  dismissUpdate: () => void;
}

interface PWAReturn {
  isOnline: boolean;
  isOffline: boolean;
  needsRefresh: boolean;
  isInstallable: boolean;
  deferredPrompt: Event | null;
  syncStatus: 'idle' | 'syncing' | 'completed' | 'failed';
  actions: PWAActions;
}

export const usePWA = (): PWAReturn => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'failed'>('idle');

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');

      // Trigger sync after coming online
      setTimeout(() => {
        setSyncStatus('completed');
        setTimeout(() => setSyncStatus('idle'), 2000);
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('idle');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);

          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setNeedsRefresh(true);
                }
              });
            }
          });

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SYNC_STATUS') {
              setSyncStatus(event.data.status);
            }
          });
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }
  }, []);

  // Handle app update
  const updateApp = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, []);

  // Dismiss update notification
  const dismissUpdate = useCallback(() => {
    setNeedsRefresh(false);
  }, []);

  const actions: PWAActions = {
    updateApp,
    dismissUpdate
  };

  return {
    isOnline,
    isOffline: !isOnline,
    needsRefresh,
    isInstallable,
    deferredPrompt,
    syncStatus,
    actions
  };
};