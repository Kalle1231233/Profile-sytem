import type { FunctionComponent } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { PermissionStatus } from '../types/location';
import { texts } from '../constants/strings';
import { colors } from '../styles/colors';
import { borderRadius, spacing } from '../styles/dimensions';

interface PermissionBannerProps {
  status: PermissionStatus;
  isRequesting: boolean;
  onRequestPermission: () => void;
  onOpenSettings: () => void;
  errorMessage?: string | null;
}

export const PermissionBanner: FunctionComponent<PermissionBannerProps> = ({
  status,
  isRequesting,
  onRequestPermission,
  onOpenSettings,
  errorMessage,
}) => {
  if (status === 'granted') {
    return null;
  }

  const isBlocked = status === 'blocked';
  const message = isBlocked
    ? texts.permission.blockedMessage
    : texts.permission.deniedMessage;

  const actionLabel = isBlocked
    ? texts.permission.settingsAction
    : texts.permission.requestAction;

  const handlePress = isBlocked ? onOpenSettings : onRequestPermission;

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={styles.container}
    >
      <View style={styles.textContainer}>
        <Text style={styles.title}>{texts.permission.requestTitle}</Text>
        <Text style={styles.message}>{message}</Text>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        accessibilityHint={
          isBlocked
            ? 'Öffnet die Systemeinstellungen, um die Berechtigung manuell zu aktivieren.'
            : 'Fragt die Standort-Berechtigung erneut an.'
        }
        onPress={handlePress}
        disabled={isRequesting}
        style={({ pressed }) => [
          styles.actionButton,
          pressed && !isRequesting ? styles.actionButtonPressed : null,
          isRequesting ? styles.actionButtonDisabled : null,
        ]}
      >
        {isRequesting ? (
          <ActivityIndicator color={colors.textInverted} />
        ) : (
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bannerBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    color: colors.info,
    marginBottom: spacing.xs,
    fontSize: 15,
  },
  message: {
    color: colors.text,
    fontSize: 14,
  },
  error: {
    color: colors.warning,
    marginTop: spacing.xs,
    fontSize: 13,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPressed: {
    opacity: 0.85,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionLabel: {
    color: colors.textInverted,
    fontWeight: '600',
  },
});
