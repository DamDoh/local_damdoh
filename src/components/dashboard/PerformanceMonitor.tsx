"use client";

import React, { useEffect, useState } from 'react';
import { Activity, Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PerformanceMetrics {
  loadTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  networkStatus: 'online' | 'offline' | 'slow';
  errorCount: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    apiResponseTime: 0,
    memoryUsage: 0,
    networkStatus: 'online',
    errorCount: 0
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }

    // Monitor performance
    const updateMetrics = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;

        // Estimate memory usage (if available)
        const memoryUsage = (performance as any).memory
          ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
          : 0;

        setMetrics(prev => ({
          ...prev,
          loadTime: Math.round(loadTime),
          memoryUsage
        }));
      }
    };

    // Monitor network status
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        const networkStatus = effectiveType === 'slow-2g' || effectiveType === '2g'
          ? 'slow'
          : navigator.onLine ? 'online' : 'offline';

        setMetrics(prev => ({ ...prev, networkStatus }));
      }
    };

    updateMetrics();
    updateNetworkStatus();

    // Set up periodic updates
    const interval = setInterval(() => {
      updateMetrics();
      updateNetworkStatus();
    }, 30000); // Update every 30 seconds

    // Listen for online/offline events
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  if (!isVisible) return null;

  const getNetworkIcon = () => {
    switch (metrics.networkStatus) {
      case 'online': return <Wifi className="h-4 w-4 text-green-600" />;
      case 'slow': return <Wifi className="h-4 w-4 text-yellow-600" />;
      case 'offline': return <WifiOff className="h-4 w-4 text-red-600" />;
    }
  };

  const getNetworkBadge = () => {
    switch (metrics.networkStatus) {
      case 'online': return <Badge className="bg-green-100 text-green-800">Online</Badge>;
      case 'slow': return <Badge className="bg-yellow-100 text-yellow-800">Slow</Badge>;
      case 'offline': return <Badge className="bg-red-100 text-red-800">Offline</Badge>;
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <Activity className="h-4 w-4 mr-2" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Load Time:</span>
            <div className="font-medium">{metrics.loadTime}ms</div>
          </div>
          <div>
            <span className="text-muted-foreground">Memory:</span>
            <div className="font-medium">{metrics.memoryUsage}MB</div>
          </div>
          <div>
            <span className="text-muted-foreground">Network:</span>
            <div className="flex items-center gap-1">
              {getNetworkIcon()}
              {getNetworkBadge()}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Errors:</span>
            <div className="flex items-center gap-1">
              {metrics.errorCount > 0 ? (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <span className="font-medium">{metrics.errorCount}</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Hide Monitor
          </button>
        </div>
      </CardContent>
    </Card>
  );
};