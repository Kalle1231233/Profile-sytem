import type { Region } from 'react-native-maps';
import type { Coordinate } from '../types/location';

export const FALLBACK_COORDINATE: Coordinate = {
  latitude: 52.520008,
  longitude: 13.404954,
};

export const DEFAULT_REGION_DELTA = {
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const getRegionForCoordinate = (
  coordinate: Coordinate | null,
  delta: Partial<Pick<Region, 'latitudeDelta' | 'longitudeDelta'>> = DEFAULT_REGION_DELTA
): Region => ({
  latitude: coordinate?.latitude ?? FALLBACK_COORDINATE.latitude,
  longitude: coordinate?.longitude ?? FALLBACK_COORDINATE.longitude,
  latitudeDelta: delta.latitudeDelta ?? DEFAULT_REGION_DELTA.latitudeDelta,
  longitudeDelta: delta.longitudeDelta ?? DEFAULT_REGION_DELTA.longitudeDelta,
});

export const isCoordinate = (value: unknown): value is Coordinate => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const maybeCoordinate = value as Partial<Coordinate>;
  return (
    typeof maybeCoordinate.latitude === 'number' &&
    typeof maybeCoordinate.longitude === 'number'
  );
};
