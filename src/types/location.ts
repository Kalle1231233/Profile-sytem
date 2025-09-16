import type { LocationObject } from 'expo-location';

export type PermissionStatus = 'unknown' | 'granted' | 'denied' | 'blocked';

export interface Coordinate {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

export interface LocationError {
  type: 'timeout' | 'services-disabled' | 'permission-denied' | 'unknown';
  message: string;
}

export interface CurrentPositionState {
  position: Coordinate | null;
  locationObject: LocationObject | null;
  isFetching: boolean;
  error: LocationError | null;
}
