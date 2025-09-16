jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 2 },
  hasServicesEnabledAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
}));
