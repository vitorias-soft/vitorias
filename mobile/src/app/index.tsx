import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';

export default function OpeningScreen() {
  return (
    <View style={styles.root}>
      <View style={styles.words}>
        <Text style={[styles.word, { color: Colors.plum }]}>PROTEÇÃO</Text>
        <Text style={[styles.word, { color: Colors.mauve }]}>LIBERDADE</Text>
        <Text style={[styles.word, { color: Colors.plum }]}>DIGNIDADE</Text>
      </View>
      <Image
        source={require('@/assets/images/brand/logo.png')}
        style={styles.logo}
        contentFit="contain"
        accessibilityLabel="Logo do Vitórias"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Entrar no Vitórias"
        // replace: a abertura não fica na pilha, então voltar não passa por ela.
        onPress={() => router.replace('/home')}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonLabel}>VITÓRIAS</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: Spacing.four,
  },
  words: { alignItems: 'center', gap: Spacing.four },
  word: { fontFamily: Fonts.brand, fontSize: 34, letterSpacing: 1 },
  logo: { width: '100%', flex: 1, maxHeight: 308, marginVertical: Spacing.three },
  button: {
    width: 277,
    maxWidth: '100%',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    elevation: 12,
  },
  pressed: { opacity: 0.8 },
  buttonLabel: { fontFamily: Fonts.brand, fontSize: 40, color: Colors.onPrimary },
});
