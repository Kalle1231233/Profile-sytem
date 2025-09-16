import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import type { LocationSubscription } from 'expo-location';
import { texts } from '../constants/strings';
import type { Coordinate, CurrentPositionState, LocationError, PermissionStatus } from '../types/location';

const toCoordinate = (location: Location.LocationObject): Coordinate => ({
  latitude: location.coords.latitude,
  longitude: location.coords.longitude,
  accuracy: location.coords.accuracy,
});

const toLocationError = (error: unknown): LocationError => {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code?: string }).code);
    if (code === 'E_LOCATION_TIMEOUT') {
      return { type: 'timeout', message: texts.errors.timeout };
    }
    if (code === 'E_LOCATION_SERVICES_DISABLED') {
      return { type: 'services-disabled', message: texts.map.gpsDisabled };
    }
    if (code === 'E_LOCATION_UNAUTHORIZED') {
      return { type: 'permission-denied', message: texts.permission.deniedMessage };
    }
  }

  return {
    type: 'unknown',
    message:
      error instanceof Error && error.message.length > 0
        ? error.message
        : texts.errors.unknown,
  };
};

const initialState: CurrentPositionState = {
  position: null,
  locationObject: null,
  isFetching: false,
  error: null,
};

interface UseCurrentPositionResult extends CurrentPositionState {
  startWatching: () => Promise<void>;
  stopWatching: () => void;
  refresh: () => Promise<void>;
}

export const useCurrentPosition = (
  permissionStatus: PermissionStatus
): UseCurrentPositionResult => {
  const [{ position, locationObject, isFetching, error }, setState] =
    useState<CurrentPositionState>(initialState);
  const watcherRef = useRef<LocationSubscription | null>(null);
  const isMountedRef = useRef(true);

  const updateState = useCallback((partial: Partial<CurrentPositionState>) => {
    setState((current) => {
      if (!isMountedRef.current) {
        return current;
      }

      return { ...current, ...partial };
    });
  }, []);

  const stopWatching = useCallback(() => {
    watcherRef.current?.remove();
    watcherRef.current = null;
    updateState({ isFetching: false });
  }, [updateState]);

  const startWatching = useCallback(async () => {
    if (watcherRef.current) {
      return;
    }

    updateState({ isFetching: true, error: null });

    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        updateState({
          error: { type: 'services-disabled', message: texts.map.gpsDisabled },
          isFetching: false,
          position: null,
          locationObject: null,
        });
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 10000,
      });
      updateState({
        position: toCoordinate(currentLocation),
        locationObject: currentLocation,
      });

      watcherRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 25,
          timeInterval: 5000,
        },
        (location) => {
          updateState({
            position: toCoordinate(location),
            locationObject: location,
          });
        }
      );
    } catch (watchError) {
      updateState({
        error: toLocationError(watchError),
        position: null,
        locationObject: null,
      });
      stopWatching();
    } finally {
      updateState({ isFetching: false });
    }
  }, [stopWatching, updateState]);

  const refresh = useCallback(async () => {
    stopWatching();
    await startWatching();
  }, [startWatching, stopWatching]);

  useEffect(() => {
    if (permissionStatus === 'granted') {
      startWatching();
      return () => {
        stopWatching();
      };
    }

    stopWatching();
    if (permissionStatus === 'denied') {
      updateState({
        error: { type: 'permission-denied', message: texts.permission.deniedMessage },
        position: null,
        locationObject: null,
      });
    } else if (permissionStatus === 'blocked') {
      updateState({
        error: { type: 'permission-denied', message: texts.permission.blockedMessage },
        position: null,
        locationObject: null,
      });
    } else {
      updateState({ error: null, position: null, locationObject: null });
    }
  }, [permissionStatus, startWatching, stopWatching, updateState]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stopWatching();
    };
  }, [stopWatching]);

  return {
    position,
    locationObject,
    isFetching,
    error,
    startWatching,
    stopWatching,
    refresh,
  };
};
