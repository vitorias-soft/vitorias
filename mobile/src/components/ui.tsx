import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type ViewStyle,
} from 'react-native';

import { Colors, Fonts, MinTouch, Radius, Spacing } from '@/constants/theme';

export function Heading({ style, ...props }: TextProps) {
  return <Text accessibilityRole="header" style={[styles.heading, style]} {...props} />;
}

export function BodyText({ style, ...props }: TextProps) {
  return <Text style={[styles.body, style]} {...props} />;
}

export function Card({ style, children }: { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <View style={styles.notice}>
      <BodyText>{children}</BodyText>
    </View>
  );
}

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: 'primary' | 'secondary' | 'destructive';
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, variant = 'primary', style, disabled, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'destructive' && styles.buttonDestructive,
        (pressed || disabled) && styles.pressed,
        style,
      ]}
      {...props}>
      <Text style={[styles.buttonLabel, variant === 'secondary' && styles.buttonLabelSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View accessibilityRole="tablist" style={styles.segmented}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.segmentSelected]}>
            <Text style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Field({
  label,
  error,
  multiline,
  style,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        multiline={multiline}
        placeholderTextColor={Colors.textMuted}
        // O teclado não deve aprender nem sugerir o que é digitado aqui.
        autoCorrect={false}
        autoComplete="off"
        spellCheck={false}
        importantForAutofill="no"
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.inputMultiline, style]}
        {...props}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontFamily: Fonts.heading, fontSize: 20, color: Colors.primaryText },
  body: { fontFamily: Fonts.bodyBold, fontSize: 13, lineHeight: 18, color: Colors.textMuted },
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.large,
    padding: Spacing.three,
  },
  notice: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.large,
    padding: Spacing.three,
  },
  button: {
    minHeight: MinTouch,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.large,
    backgroundColor: Colors.primary,
  },
  buttonSecondary: { backgroundColor: Colors.surfaceAccent },
  buttonDestructive: { backgroundColor: Colors.emergency },
  buttonLabel: { fontFamily: Fonts.heading, fontSize: 15, color: Colors.onPrimary },
  buttonLabelSecondary: { color: Colors.primaryText },
  pressed: { opacity: 0.7 },
  segmented: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.large,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
  segment: {
    flex: 1,
    minHeight: MinTouch,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.one,
    borderRadius: Radius.large,
  },
  segmentSelected: { backgroundColor: Colors.primary },
  segmentLabel: { fontFamily: Fonts.heading, fontSize: 12, color: Colors.textMuted, textAlign: 'center' },
  segmentLabelSelected: { color: Colors.onPrimary },
  field: { gap: Spacing.one },
  fieldLabel: { fontFamily: Fonts.heading, fontSize: 13, color: Colors.label },
  input: {
    minHeight: MinTouch,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.large,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.primaryText,
  },
  inputMultiline: { minHeight: 100 },
  error: { fontFamily: Fonts.bodyBold, fontSize: 13, color: Colors.emergency },
});
