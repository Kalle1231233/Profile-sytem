import type { FunctionComponent } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';
import { borderRadius, spacing } from '../styles/dimensions';
import { texts } from '../constants/strings';

interface CenterOnUserButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const CenterOnUserButton: FunctionComponent<CenterOnUserButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={texts.map.centerOnUserButton}
      accessibilityHint="Zentriert die Karte auf Ihre aktuelle Position"
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.button, disabled && styles.buttonDisabled]}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{texts.map.centerOnUserButton}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.textInverted,
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});
