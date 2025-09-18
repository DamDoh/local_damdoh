/**
 * Swipeable Container Component - Mobile gesture-enabled container
 * Provides swipe gesture support for mobile interactions
 */

import React, { useEffect, useRef } from 'react';
import { useMobileGestures } from '@/hooks/useMobileGestures';

interface SwipeableContainerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  disabled?: boolean;
}

export const SwipeableContainer: React.FC<SwipeableContainerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = '',
  disabled = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { swipeDirection } = useMobileGestures(containerRef, {
    threshold: 50,
    velocity: 0.3,
    restorePosition: true
  });

  useEffect(() => {
    if (disabled) return;

    switch (swipeDirection) {
      case 'left':
        onSwipeLeft?.();
        break;
      case 'right':
        onSwipeRight?.();
        break;
      case 'up':
        onSwipeUp?.();
        break;
      case 'down':
        onSwipeDown?.();
        break;
    }
  }, [swipeDirection, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, disabled]);

  return (
    <div
      ref={containerRef}
      className={`touch-pan-y ${className}`}
      style={{
        touchAction: 'pan-y',
        userSelect: 'none'
      }}
    >
      {children}
    </div>
  );
};