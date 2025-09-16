import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import { useLocationPermission } from '../useLocationPermission';

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

const renderPermissionHook = async () => {
  const result: { current: ReturnType<typeof useLocationPermission> } = {
    current: undefined as unknown as ReturnType<typeof useLocationPermission>,
  };

  const TestComponent = () => {
    result.current = useLocationPermission();
    return null;
  };

  let renderer: TestRenderer.ReactTestRenderer | undefined;

  await act(async () => {
    renderer = TestRenderer.create(<TestComponent />);
  });

  if (!renderer) {
    throw new Error('Renderer konnte nicht initialisiert werden.');
  }

  return {
    result,
    rerender: async () => {
      await act(async () => {
        renderer!.update(<TestComponent />);
      });
    },
    unmount: () => {
      renderer!.unmount();
    },
  };
};

describe('useLocationPermission', () => {
  const getForegroundPermissionsAsyncMock = jest.mocked(
    Location.getForegroundPermissionsAsync
  );
  const requestForegroundPermissionsAsyncMock = jest.mocked(
    Location.requestForegroundPermissionsAsync
  );

  beforeAll(() => {
    jest.spyOn(AppState, 'addEventListener').mockImplementation(() => ({
      remove: jest.fn(),
    }));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requests permission on mount when allowed to ask again', async () => {
    getForegroundPermissionsAsyncMock.mockResolvedValueOnce({
      granted: false,
      canAskAgain: true,
      expires: 'never',
      status: 'denied' as const,
    });

    requestForegroundPermissionsAsyncMock.mockResolvedValueOnce({
      granted: true,
      canAskAgain: true,
      expires: 'never',
      status: 'granted' as const,
    });

    const hook = await renderPermissionHook();

    await waitFor(() => {
      expect(hook.result.current.status).toBe('granted');
    });

    expect(getForegroundPermissionsAsyncMock).toHaveBeenCalledTimes(1);
    expect(requestForegroundPermissionsAsyncMock).toHaveBeenCalledTimes(1);
  });

  it('marks status as blocked when the system prevents re-requesting', async () => {
    getForegroundPermissionsAsyncMock.mockResolvedValueOnce({
      granted: false,
      canAskAgain: false,
      expires: 'never',
      status: 'denied' as const,
    });

    const hook = await renderPermissionHook();

    await waitFor(() => {
      expect(hook.result.current.status).toBe('blocked');
    });

    expect(requestForegroundPermissionsAsyncMock).not.toHaveBeenCalled();
  });
});
