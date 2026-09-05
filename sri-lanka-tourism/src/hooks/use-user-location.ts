"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export interface UserLocationState {
  location: [number, number] | null;
  accuracy: number | null;
  isLoading: boolean;
  isTracking: boolean;
  error: string | null;
}

export function useUserLocation() {
  const [state, setState] = useState<UserLocationState>({
    location: null,
    accuracy: null,
    isLoading: false,
    isTracking: false,
    error: null,
  });

  const watchIdRef = useRef<number | null>(null);

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser.",
        isLoading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setState((prev) => ({
          ...prev,
          location: [latitude, longitude],
          accuracy,
          isLoading: false,
          error: null,
        }));
      },
      (err) => {
        let errorMsg = "Unable to retrieve your location.";
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = "Location permission denied. Please allow location access in your browser settings.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMsg = "Location information is unavailable.";
        } else if (err.code === err.TIMEOUT) {
          errorMsg = "Location request timed out.";
        }
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState((prev) => ({ ...prev, isTracking: false }));
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser.",
      }));
      return;
    }

    stopTracking(); // Clear any existing watcher

    setState((prev) => ({ ...prev, isTracking: true, isLoading: true, error: null }));

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setState((prev) => ({
          ...prev,
          location: [latitude, longitude],
          accuracy,
          isLoading: false,
          error: null,
        }));
      },
      (err) => {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Tracking error: " + err.message,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000,
      }
    );

    watchIdRef.current = id;
  }, [stopTracking]);

  const toggleTracking = useCallback(() => {
    if (state.isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  }, [state.isTracking, startTracking, stopTracking]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    ...state,
    locateUser,
    startTracking,
    stopTracking,
    toggleTracking,
  };
}
