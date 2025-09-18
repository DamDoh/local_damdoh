import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { toast } = useToast();

  const defaultOptions: PositionOptions = {
    enableHighAccuracy: options.enableHighAccuracy ?? true,
    timeout: options.timeout ?? 10000,
    maximumAge: options.maximumAge ?? 300000 // 5 minutes
  };

  // Get current position
  const getCurrentPosition = useCallback(async () => {
    if (!navigator.geolocation) {
      const errorMsg = "Geolocation is not supported by this browser";
      setError(errorMsg);
      toast({
        title: "Location Error",
        description: errorMsg,
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise<LocationData | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined
          };

          setLocation(locationData);
          setIsLoading(false);

          toast({
            title: "Location Found",
            description: `Accuracy: ${Math.round(locationData.accuracy)}m`,
          });

          resolve(locationData);
        },
        (error) => {
          let errorMsg = "Unable to retrieve location";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = "Location access denied by user";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMsg = "Location request timed out";
              break;
          }

          setError(errorMsg);
          setIsLoading(false);

          toast({
            title: "Location Error",
            description: errorMsg,
            variant: "destructive"
          });

          resolve(null);
        },
        defaultOptions
      );
    });
  }, [defaultOptions, toast]);

  // Start watching position
  const startWatching = useCallback(() => {
    if (!navigator.geolocation || isWatching) return;

    setIsWatching(true);
    setError(null);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          altitude: position.coords.altitude || undefined,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined
        };

        setLocation(locationData);
        setError(null);
      },
      (error) => {
        let errorMsg = "Location tracking failed";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = "Location access denied";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "Location unavailable";
            break;
          case error.TIMEOUT:
            errorMsg = "Location request timed out";
            break;
        }

        setError(errorMsg);
        toast({
          title: "Tracking Error",
          description: errorMsg,
          variant: "destructive"
        });
      },
      defaultOptions
    );

    setWatchId(id);

    toast({
      title: "Location Tracking Started",
      description: "Tracking your position for field mapping",
    });
  }, [defaultOptions, isWatching, toast]);

  // Stop watching position
  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsWatching(false);

    toast({
      title: "Location Tracking Stopped",
      description: "Field mapping tracking disabled",
    });
  }, [watchId, toast]);

  // Calculate distance between two points
  const calculateDistance = useCallback((point1: LocationData, point2: LocationData): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }, []);

  // Calculate area of polygon (field boundary)
  const calculateArea = useCallback((points: LocationData[]): number => {
    if (points.length < 3) return 0;

    let area = 0;
    const n = points.length;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += points[i].longitude * points[j].latitude;
      area -= points[j].longitude * points[i].latitude;
    }

    area = Math.abs(area) * 111319.5 * 111319.5 * Math.cos((points[0].latitude * Math.PI) / 180) / 2;

    return Math.abs(area); // Area in square meters
  }, []);

  // Get address from coordinates (reverse geocoding)
  const getAddressFromCoordinates = useCallback(async (lat: number, lng: number): Promise<string | null> => {
    try {
      // Using a free geocoding service (you might want to use a paid service for production)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      return data.locality || data.city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    location,
    isLoading,
    error,
    isWatching,
    getCurrentPosition,
    startWatching,
    stopWatching,
    calculateDistance,
    calculateArea,
    getAddressFromCoordinates
  };
}