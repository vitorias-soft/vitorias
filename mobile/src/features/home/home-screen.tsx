import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { BodyText, Heading } from '@/components/ui';
import { Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useCatalog } from '@/data/use-catalog';

export function HomeScreen() {
  const { catalog } = useCatalog();
  const videos = catalog?.videos ?? [];

  return (
    <Screen>
      <Text accessibilityRole="header" style={styles.greeting}>
        Você não está <Text style={{ color: Colors.mauve }}>sozinha</Text>.
      </Text>
      <BodyText>
        Informação, direitos e apoio em um só lugar. Denúncia, apoio e emergência estão sempre a um
        toque, na barra abaixo.
      </BodyText>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.navigate('/informacoes')}
        style={({ pressed }) => [styles.infoCard, pressed && styles.pressed]}>
        <View style={styles.infoIcon}>
          <MaterialIcons name="menu-book" size={42} color={Colors.text} />
        </View>
        <View style={styles.infoText}>
          <Text style={styles.infoTitle}>Informações e Direitos</Text>
          <BodyText>Tipos de violência, Lei Maria da Penha e Lei do Feminicídio</BodyText>
        </View>
      </Pressable>

      {videos.length > 0 ? (
        <View style={styles.events}>
          <Heading style={styles.eventsTitle}>Eventos</Heading>
          {videos.map((video) => (
            <View key={video.id} style={styles.event}>
              <BodyText>{video.description}</BodyText>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`Assistir ${video.title} no YouTube`}
                // Sem miniatura: não baixa nada do YouTube nem deixa cache de imagem.
                onPress={() => Linking.openURL(video.youtubeUrl).catch(() => {})}
                style={({ pressed }) => [styles.video, pressed && styles.pressed]}>
                <MaterialIcons name="play-circle-outline" size={54} color={Colors.onPrimary} />
                <Text style={styles.videoTitle}>{video.title}</Text>
                {video.campus ? <Text style={styles.videoCampus}>{video.campus}</Text> : null}
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: { fontFamily: Fonts.heading, fontSize: 24, color: Colors.plum },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radius.small,
    padding: Spacing.three,
    elevation: 4,
  },
  infoIcon: {
    width: 79,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    backgroundColor: Colors.iconTile,
  },
  infoText: { flex: 1, gap: Spacing.one },
  infoTitle: { fontFamily: Fonts.heading, fontSize: 13, color: Colors.text },
  events: { gap: Spacing.two },
  eventsTitle: { fontSize: 24, color: Colors.plum },
  event: { gap: Spacing.two },
  video: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Radius.large,
    backgroundColor: Colors.primary,
  },
  videoTitle: { fontFamily: Fonts.heading, fontSize: 16, color: Colors.onPrimary, textAlign: 'center' },
  videoCampus: { fontFamily: Fonts.body, fontSize: 13, color: Colors.onPrimary },
  pressed: { opacity: 0.8 },
});
