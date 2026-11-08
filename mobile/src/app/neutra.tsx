import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState, BackHandler, StyleSheet, Text, View } from 'react-native';

/**
 * Destino da saída rápida: sem marca nem conteúdo do app. Voltar fecha o app em
 * vez de revelar a tela anterior, e ao reabrir a pessoa retoma pela Home.
 */
export default function NeutralScreen() {
  const wentToBackground = useRef(false);

  useEffect(() => {
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        wentToBackground.current = true;
      } else if (state === 'active' && wentToBackground.current) {
        router.replace('/home');
      }
    });
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      BackHandler.exitApp();
      return true;
    });
    return () => {
      appState.remove();
      back.remove();
    };
  }, []);

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <View style={styles.root}>
      <Text style={styles.date}>{today}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  date: { fontSize: 18, color: '#555555' },
});
