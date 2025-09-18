"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDataRefreshOptions {
  interval?: number; // in milliseconds
  enabled?: boolean;
  onRefresh?: () => Promise<void> | void;
  retryOnError?: boolean;
  maxRetries?: number;
}

interface UseDataRefreshReturn {
  isRefreshing: boolean;
  lastRefresh: Date | null;
  refresh: () => Promise<void>;
  error: Error | null;
  retryCount: number;
}

export const useDataRefresh = ({
  interval = 300000, // 5 minutes default
  enabled = true,
  onRefresh,
  retryOnError = true,
  maxRetries = 3
}: UseDataRefreshOptions = {}): UseDataRefreshReturn => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) return;

    setIsRefreshing(true);
    setError(null);

    try {
      await onRefresh();
      setLastRefresh(new Date());
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Refresh failed');
      setError(error);

      // Retry logic
      if (retryOnError && retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff
        retryTimeoutRef.current = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          refresh();
        }, delay);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing, retryOnError, retryCount, maxRetries]);

  // Set up automatic refresh interval
  useEffect(() => {
    if (enabled && interval > 0) {
      intervalRef.current = setInterval(refresh, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, refresh]);

  // Cleanup retry timeout
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Manual refresh function
  const manualRefresh = useCallback(async () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    await refresh();
  }, [refresh]);

  return {
    isRefreshing,
    lastRefresh,
    refresh: manualRefresh,
    error,
    retryCount
  };
};

// Hook for dashboard data refresh
export const useDashboardRefresh = (onRefresh: () => Promise<void> | void) => {
  return useDataRefresh({
    interval: 300000, // 5 minutes
    enabled: true,
    onRefresh,
    retryOnError: true,
    maxRetries: 3
  });
};