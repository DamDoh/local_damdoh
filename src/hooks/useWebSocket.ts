import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getTokens } from '@/lib/auth-utils-new';

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler?: (...args: any[]) => void) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { url = 'http://localhost:8000', autoConnect = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const { accessToken } = getTokens();

    socketRef.current = io(url, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    socket.on('connected', (data) => {
      console.log('WebSocket authenticated:', data);
    });
  }, [url]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('WebSocket not connected, cannot emit:', event);
    }
  }, []);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  }, []);

  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (handler) {
        socketRef.current.off(event, handler);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}

// Specialized hooks for different features
export function useNotificationsWebSocket() {
  const { socket, isConnected, on, off, emit } = useWebSocket();

  useEffect(() => {
    if (isConnected) {
      emit('subscribe:notifications');
    }
  }, [isConnected, emit]);

  return { socket, isConnected, on, off, emit };
}

export function usePostsWebSocket(options: { following?: string[], groupId?: string } = {}) {
  const { socket, isConnected, on, off, emit } = useWebSocket();

  useEffect(() => {
    if (isConnected) {
      emit('subscribe:posts', options);
    }
  }, [isConnected, emit, options]);

  return { socket, isConnected, on, off, emit };
}

export function useMessagesWebSocket() {
  const { socket, isConnected, on, off, emit } = useWebSocket();

  useEffect(() => {
    if (isConnected) {
      emit('subscribe:messages');
    }
  }, [isConnected, emit]);

  return { socket, isConnected, on, off, emit };
}

export function useMarketplaceWebSocket(categories: string[] = []) {
  const { socket, isConnected, on, off, emit } = useWebSocket();

  useEffect(() => {
    if (isConnected) {
      emit('subscribe:marketplace', { categories });
    }
  }, [isConnected, emit, categories]);

  return { socket, isConnected, on, off, emit };
}