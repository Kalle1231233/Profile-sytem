import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import * as Location from 'expo-location';
import type { PermissionStatus } from '../types/location';

interface UseLocationPermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
  isRequesting: boolean;
  error: string | null;
  refreshStatus: () => Promise<PermissionStatus>;
  requestPermission: () => Promise<PermissionStatus>;
  openAppSettings: () => Promise<void>;
}

const toStatus = (response: Location.PermissionResponse): PermissionStatus => {
  if (response.granted) {
    return 'granted';
  }

  return response.canAskAgain ? 'denied' : 'blocked';
};

const UNKNOWN_ERROR_MESSAGE =
  Platform.select({
    ios: 'Die Berechtigungsabfrage ist fehlgeschlagen. Bitte versuchen Sie es erneut.',
    android: 'Die Berechtigungsabfrage ist fehlgeschlagen. Bitte versuchen Sie es erneut.',
    default: 'Die Berechtigungsabfrage ist fehlgeschlagen.',
  }) ?? 'Die Berechtigungsabfrage ist fehlgeschlagen.';

export const useLocationPermission = (): UseLocationPermissionResult => {
  const [status, setStatus] = useState<PermissionStatus>('unknown');
  const [canAskAgain, setCanAskAgain] = useState<boolean>(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const didRequestOnLoad = useRef(false);

  const applyResponse = useCallback(
    (response: Location.PermissionResponse): { status: PermissionStatus; canAskAgain: boolean } => {
      const nextStatus = toStatus(response);
      setStatus(nextStatus);
      setCanAskAgain(response.canAskAgain);
      return { status: nextStatus, canAskAgain: response.canAskAgain };
    },
    []
  );

  const refreshStatus = useCallback(async (): Promise<PermissionStatus> => {
    try {
      const response = await Location.getForegroundPermissionsAsync();
      const result = applyResponse(response);
      return result.status;
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : UNKNOWN_ERROR_MESSAGE);
      return status;
    }
  }, [applyResponse, status]);

  const requestPermission = useCallback(async (): Promise<PermissionStatus> => {
    setIsRequesting(true);
    setError(null);
    try {
      const response = await Location.requestForegroundPermissionsAsync();
      const result = applyResponse(response);
      return result.status;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : UNKNOWN_ERROR_MESSAGE);
      return status;
    } finally {
      setIsRequesting(false);
      didRequestOnLoad.current = true;
    }
  }, [applyResponse, status]);

  const openAppSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const checkAndRequest = async () => {
      try {
        const response = await Location.getForegroundPermissionsAsync();
        const { status: latestStatus, canAskAgain: canStillAsk } = applyResponse(response);

        if (
          isMounted &&
          latestStatus !== 'granted' &&
          canStillAsk &&
          !didRequestOnLoad.current
        ) {
          didRequestOnLoad.current = true;
          await requestPermission();
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : UNKNOWN_ERROR_MESSAGE);
      }
    };

    checkAndRequest();

    return () => {
      isMounted = false;
    };
  }, [applyResponse, requestPermission]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        refreshStatus();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [refreshStatus]);

  return {
    status,
    canAskAgain,
    isRequesting,
    error,
    refreshStatus,
    requestPermission,
    openAppSettings,
  };
};
