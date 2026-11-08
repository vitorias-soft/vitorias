import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router, usePathname } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Fonts, MinTouch, Spacing } from '@/constants/theme';
import { quickExit } from '@/security/session';

const TITLES: Record<string, string> = {
  '/informacoes': 'Informação e Direitos',
  '/denuncia': 'Denúncia',
  '/apoio': 'Apoio',
  '/emergencia': 'Emergência',
  '/ajustes': 'Ajustes',
  '/sobre': 'Sobre o app',
};

const TABS = [
  { href: '/denuncia', label: 'Denúncia' },
  { href: '/apoio', label: 'Apoio' },
  { href: '/emergencia', label: 'Emergência' },
] as const;

/** Barra superior com a saída rápida e barra inferior, visíveis em todas as telas (RN05). */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.two }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar para o início"
          onPress={() => router.navigate('/home')}
          style={styles.logoButton}>
          <Image
            source={require('@/assets/images/brand/logo.png')}
            style={styles.logo}
            contentFit="cover"
          />
        </Pressable>
        <Text numberOfLines={1} accessibilityRole="header" style={styles.title}>
          {TITLES[pathname] ?? ''}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ajustes"
          onPress={() => router.navigate('/ajustes')}
          style={styles.iconButton}>
          <MaterialIcons name="settings" size={28} color={Colors.text} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Saída rápida"
          // onPressIn: dispara no primeiro contato, sem esperar soltar o dedo.
          onPressIn={quickExit}
          style={styles.iconButton}>
          <MaterialIcons name="close" size={32} color={Colors.text} />
        </Pressable>
      </View>

      <View style={styles.content}>{children}</View>

      <View style={[styles.tabBar, { paddingBottom: insets.bottom + Spacing.one }]}>
        {TABS.map((tab) => {
          const selected = pathname === tab.href;
          const color = !selected
            ? Colors.textMuted
            : tab.href === '/emergencia'
              ? Colors.emergency
              : Colors.primary;
          return (
            <Pressable
              key={tab.href}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => router.navigate(tab.href)}
              style={styles.tab}>
              <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.tabLabel, { color }]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  logoButton: { minWidth: MinTouch, minHeight: MinTouch, justifyContent: 'center' },
  logo: { width: 48, height: 48, borderRadius: 24 },
  title: { flex: 1, fontFamily: Fonts.heading, fontSize: 18, color: Colors.primaryText },
  iconButton: { width: MinTouch, height: MinTouch, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingTop: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  tab: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontFamily: Fonts.heading, fontSize: 16 },
});
