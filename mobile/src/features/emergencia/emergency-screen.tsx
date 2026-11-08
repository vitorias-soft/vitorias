import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Linking from 'expo-linking';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { BodyText, Card, Notice } from '@/components/ui';
import { EMERGENCY_CHANNELS } from '@/constants/emergency-channels';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';

export function EmergencyScreen() {
  return (
    <Screen>
      <Notice>Toque no botão para abrir o discador do seu telefone com o número preenchido.</Notice>
      {EMERGENCY_CHANNELS.map((channel) => (
        <Card key={channel.number} style={styles.card}>
          <Text style={styles.number}>{channel.number}</Text>
          <View style={styles.info}>
            <Text style={styles.name}>{channel.name}</Text>
            <BodyText>{channel.description}</BodyText>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ligar para ${channel.number}, ${channel.name}`}
            // Sem diálogo extra: o próprio discador já é a confirmação (RN04, RN10).
            onPress={() => Linking.openURL(`tel:${channel.number}`)}
            style={({ pressed }) => [styles.call, pressed && styles.pressed]}>
            <MaterialIcons name="call" size={24} color={Colors.onPrimary} />
          </Pressable>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, minHeight: 116 },
  number: { fontFamily: Fonts.heading, fontSize: 30, color: Colors.emergency },
  info: { flex: 1, gap: Spacing.one },
  name: { fontFamily: Fonts.heading, fontSize: 13, color: Colors.label },
  call: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.small,
    backgroundColor: Colors.emergency,
  },
  pressed: { opacity: 0.8 },
});
