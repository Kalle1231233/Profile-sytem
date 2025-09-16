import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import * as Location from 'expo-location';
import { useCurrentPosition } from '../useCurrentPosition';
import type { PermissionStatus } from '../../types/location';

const waitFor = async (expectation: () => void, timeout = 1000, interval = 20) => {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      expectation();
      return;
    } catch (error) {
      if (Date.now() - start > timeout) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }
};

const renderCurrentPositionHook = async (permission: PermissionStatus) => {
  const result: { current: ReturnType<typeof useCurrentPosition> } = {
    current: undefined as unknown as ReturnType<typeof useCurrentPosition>,
  };

  const TestComponent = ({ status }: { status: PermissionStatus }) => {
    result.current = useCurrentPosition(status);
    return null;
  };

  let renderer: TestRenderer.ReactTestRenderer | undefined;

  await act(async () => {
    renderer = TestRenderer.create(<TestComponent status={permission} />);
  });

  if (!renderer) {
    throw new Error('Renderer konnte nicht initialisiert werden.');
  }

  return {
    result,
    rerender: async (status: PermissionStatus) => {
      await act(async () => {
        renderer!.update(<TestComponent status={status} />);
      });
    },
    unmount: () => renderer!.unmount(),
  };
};

describe('useCurrentPosition', () => {
  const hasServicesEnabledMock = jest.mocked(Location.hasServicesEnabledAsync);
  const getCurrentPositionMock = jest.mocked(Location.getCurrentPositionAsync);
  const watchPositionMock = jest.mocked(Location.watchPositionAsync);

  beforeEach(() => {
    jest.clearAllMocks();
    hasServicesEnabledMock.mockReset();
    getCurrentPositionMock.mockReset();
    watchPositionMock.mockReset();
  });

  it('returns a coordinate when permission is granted', async () => {
    const currentLocation: Location.LocationObject = {
      coords: {
        latitude: 52.5,
        longitude: 13.4,
        altitude: null,
        accuracy: 5,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };

    hasServicesEnabledMock.mockResolvedValue(true);
    getCurrentPositionMock.mockResolvedValue(currentLocation);
    watchPositionMock.mockImplementation(async (_options, callback) => {
      callback({
        coords: {
          latitude: 52.51,
          longitude: 13.41,
          altitude: null,
          accuracy: 7,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });

      return {
        remove: jest.fn(),
      } as unknown as Location.LocationSubscription;
    });

    const hook = await renderCurrentPositionHook('granted');

    await waitFor(() => {
      expect(hook.result.current.position).toEqual({
        latitude: 52.51,
        longitude: 13.41,
        accuracy: 7,
      });
    });

    expect(getCurrentPositionMock).toHaveBeenCalled();
    expect(watchPositionMock).toHaveBeenCalled();
  });

  it('provides a permission error when access is denied', async () => {
    const hook = await renderCurrentPositionHook('denied');

    await waitFor(() => {
      expect(hook.result.current.error?.type).toBe('permission-denied');
    });

    expect(hasServicesEnabledMock).not.toHaveBeenCalled();
    expect(getCurrentPositionMock).not.toHaveBeenCalled();
  });
});
