/**
 * Mobile Gestures Hook - Enhanced mobile interaction capabilities
 * Provides swipe gestures, touch interactions, and mobile-specific features
 */

import { useEffect, useRef, useCallback, useState } from 'react';

interface SwipeConfig {
  threshold?: number;
  velocity?: number;
  restorePosition?: boolean;
}

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

export const useMobileGestures = (
  elementRef: React.RefObject<HTMLElement>,
  config: SwipeConfig = {}
) => {
  const {
    threshold = 50,
    velocity = 0.3,
    restorePosition = true
  } = config;

  const [isSwipeEnabled, setIsSwipeEnabled] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartRef = useRef<TouchPosition | null>(null);
  const touchEndRef = useRef<TouchPosition | null>(null);
  const swipeTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isSwipeEnabled) return;

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    setIsDragging(true);
  }, [isSwipeEnabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isSwipeEnabled || !touchStartRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Prevent scrolling if horizontal swipe is detected
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      e.preventDefault();
    }
  }, [isSwipeEnabled]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isSwipeEnabled || !touchStartRef.current) return;

    const touch = e.changedTouches[0];
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    const deltaTime = touchEndRef.current.time - touchStartRef.current.time;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Calculate velocity (pixels per millisecond)
    const velocityX = absDeltaX / deltaTime;
    const velocityY = absDeltaY / deltaTime;

    setIsDragging(false);

    // Determine swipe direction
    if (absDeltaX > threshold && velocityX > velocity) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        setSwipeDirection(deltaX > 0 ? 'right' : 'left');

        // Clear previous timeout
        if (swipeTimeoutRef.current) {
          clearTimeout(swipeTimeoutRef.current);
        }

        // Reset direction after animation
        swipeTimeoutRef.current = setTimeout(() => {
          setSwipeDirection(null);
        }, 300);
      }
    } else if (absDeltaY > threshold && velocityY > velocity) {
      if (absDeltaY > absDeltaX) {
        // Vertical swipe
        setSwipeDirection(deltaY > 0 ? 'down' : 'up');

        if (swipeTimeoutRef.current) {
          clearTimeout(swipeTimeoutRef.current);
        }

        swipeTimeoutRef.current = setTimeout(() => {
          setSwipeDirection(null);
        }, 300);
      }
    }

    // Reset touch positions
    touchStartRef.current = null;
    touchEndRef.current = null;
  }, [isSwipeEnabled, threshold, velocity]);

  const enableSwipe = useCallback(() => setIsSwipeEnabled(true), []);
  const disableSwipe = useCallback(() => setIsSwipeEnabled(false), []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);

      if (swipeTimeoutRef.current) {
        clearTimeout(swipeTimeoutRef.current);
      }
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    swipeDirection,
    isDragging,
    isSwipeEnabled,
    enableSwipe,
    disableSwipe
  };
};

// PWA and Mobile Enhancement Hook
export const usePWAAndMobile = () => {
  const [isPWA, setIsPWA] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsPWA(isStandalone || isInWebAppiOS);

    // Check if mobile device
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    if ('serviceWorker' in navigator && 'caches' in window) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        if (registrations.length > 0) {
          setIsPWA(true);
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    setDeferredPrompt(null);
    setCanInstall(false);

    return outcome === 'accepted';
  };

  const shareContent = async (data: { title: string; text: string; url?: string }) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Error sharing:', error);
        return false;
      }
    }
    return false;
  };

  const vibrate = (pattern: number | number[] = 100) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  return {
    isPWA,
    isOnline,
    isMobile,
    canInstall,
    installPWA,
    shareContent,
    vibrate
  };
};

// Swipeable Container Component interface
export interface SwipeableContainerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  disabled?: boolean;
}