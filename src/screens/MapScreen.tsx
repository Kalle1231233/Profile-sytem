import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, type MapViewProps, type Region } from 'react-native-maps';
import { CenterOnUserButton } from '../components/CenterOnUserButton';
import { PermissionBanner } from '../components/PermissionBanner';
import { texts } from '../constants/strings';
import { useCurrentPosition } from '../hooks/useCurrentPosition';
import { useLocationPermission } from '../hooks/useLocationPermission';
import { DEFAULT_REGION_DELTA, getRegionForCoordinate } from '../lib/map';
import { colors } from '../styles/colors';
import { borderRadius, spacing } from '../styles/dimensions';

const mapProvider: MapViewProps['provider'] = Platform.select({
  android: PROVIDER_GOOGLE,
  ios: undefined,
  default: undefined,
});

export const MapScreen = () => {
  const mapRef = useRef<MapView | null>(null);
  const hasCenteredOnUserRef = useRef(false);
  const {
    status,
    requestPermission,
    openAppSettings,
    isRequesting,
    error: permissionError,
  } = useLocationPermission();
  const { position, isFetching, error: locationError, refresh } = useCurrentPosition(status);

  const initialRegion: Region = useMemo(
    () => getRegionForCoordinate(position, DEFAULT_REGION_DELTA),
    [position?.latitude, position?.longitude]
  );

  const handleCenterOnUser = useCallback(() => {
    if (!mapRef.current || !position) {
      return;
    }

    const region = getRegionForCoordinate(position, DEFAULT_REGION_DELTA);
    mapRef.current.animateToRegion(region, 600);
  }, [position]);

  useEffect(() => {
    if (status !== 'granted' || !position || !mapRef.current) {
      return;
    }

    if (!hasCenteredOnUserRef.current) {
      hasCenteredOnUserRef.current = true;
      const region = getRegionForCoordinate(position, DEFAULT_REGION_DELTA);
      mapRef.current.animateToRegion(region, 600);
    }
  }, [position, status]);

  useEffect(() => {
    if (status !== 'granted') {
      hasCenteredOnUserRef.current = false;
    }
  }, [status]);

  const handleOpenSettings = useCallback(async () => {
    try {
      if (status === 'blocked') {
        await openAppSettings();
        return;
      }

      if (locationError?.type === 'services-disabled') {
        // There is no universal API to open location settings, fall back to app settings.
        await Linking.openSettings();
      }
    } catch (settingsError) {
      Alert.alert('Aktion fehlgeschlagen', 'Die Einstellungen konnten nicht geöffnet werden.');
    }
  }, [locationError?.type, openAppSettings, status]);

  const renderStatusBanner = () => {
    if (status === 'unknown') {
      return null;
    }

    if (status !== 'granted') {
      return (
        <PermissionBanner
          status={status}
          isRequesting={isRequesting}
          onRequestPermission={requestPermission}
          onOpenSettings={openAppSettings}
          errorMessage={permissionError}
        />
      );
    }

    if (locationError) {
      const isServicesDisabled = locationError.type === 'services-disabled';
      const actionLabel = isServicesDisabled
        ? texts.permission.settingsAction
        : texts.map.retry;
      const onPress = isServicesDisabled ? handleOpenSettings : refresh;

      return (
        <View style={styles.bannerContainer} accessibilityRole="alert">
          <Text style={styles.bannerTitle}>{texts.map.locationUnavailable}</Text>
          <Text style={styles.bannerMessage}>{locationError.message}</Text>
          <View style={styles.bannerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={actionLabel}
              accessibilityHint={
                locationError.type === 'services-disabled'
                  ? 'Öffnet die Einstellungen, um Standortdienste zu aktivieren.'
                  : 'Startet einen neuen Versuch, Ihre Position zu bestimmen.'
              }
              onPress={onPress}
              style={({ pressed }) => [
                styles.bannerButton,
                pressed && !isFetching ? styles.bannerButtonPressed : null,
                isFetching ? styles.bannerButtonDisabled : null,
              ]}
              disabled={isFetching}
            >
              <Text style={styles.bannerButtonText}>{actionLabel}</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={(ref) => {
          mapRef.current = ref;
        }}
        provider={mapProvider}
        style={StyleSheet.absoluteFill}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={initialRegion}
        accessibilityLabel="Interaktive Karte"
      />
      <View style={styles.topContainer}>{renderStatusBanner()}</View>
      <View style={styles.buttonContainer} pointerEvents="box-none">
        <CenterOnUserButton
          onPress={handleCenterOnUser}
          disabled={!position || status !== 'granted'}
        />
      </View>
      {isFetching ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topContainer: {
    position: 'absolute',
    top: spacing.lg,
    left: 0,
    right: 0,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  bannerContainer: {
    backgroundColor: colors.bannerBackground,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
    gap: spacing.sm,
  },
  bannerTitle: {
    fontWeight: '600',
    color: colors.info,
    fontSize: 16,
  },
  bannerMessage: {
    color: colors.text,
    fontSize: 14,
  },
  bannerActions: {
    alignItems: 'flex-start',
  },
  bannerButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  bannerButtonPressed: {
    opacity: 0.8,
  },
  bannerButtonDisabled: {
    opacity: 0.6,
  },
  bannerButtonText: {
    color: colors.textInverted,
    fontWeight: '600',
  },
});
