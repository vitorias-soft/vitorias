import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type ColorValue } from 'react-native';

import { Screen } from '@/components/screen';
import { Card, Notice } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { clearSession } from '@/security/session';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

function Row({
  icon,
  label,
  onPress,
  color = Colors.label,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  color?: ColorValue;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <View style={styles.tile}>
        <MaterialIcons name={icon} size={24} color={Colors.plum} />
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
      <MaterialIcons name="chevron-right" size={24} color={Colors.plum} />
    </Pressable>
  );
}

export function SettingsScreen() {
  const [cleared, setCleared] = useState(false);

  return (
    <Screen>
      <Card style={styles.card}>
        <Row
          icon="auto-delete"
          label="Limpar histórico de pesquisa"
          onPress={() => {
            clearSession();
            setCleared(true);
          }}
        />
        <View style={styles.divider} />
        <Row icon="home" label="Voltar para home" onPress={() => router.navigate('/home')} />
        <View style={styles.divider} />
        <Row icon="build" label="Sobre o app" onPress={() => router.navigate('/sobre')} />
      </Card>
      {cleared ? <Notice>Histórico de pesquisa limpo.</Notice> : null}
      <Image
        source={require('@/assets/images/brand/logo.png')}
        style={styles.watermark}
        contentFit="contain"
        accessible={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: Spacing.two, elevation: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, minHeight: 60 },
  tile: {
    width: 46,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.small,
    backgroundColor: Colors.iconTile,
  },
  label: { flex: 1, fontFamily: Fonts.heading, fontSize: 13 },
  divider: { height: 1, backgroundColor: Colors.border },
  watermark: { width: '100%', height: 320, opacity: 0.3 },
});
