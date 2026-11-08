import { Stack } from 'expo-router';
import { usePreventScreenCapture } from 'expo-screen-capture';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { syncContent } from '@/data/sync';

SplashScreen.preventAutoHideAsync();

function ScreenProtection() {
  // FLAG_SECURE: bloqueia capturas e deixa a prévia em "recentes" em branco.
  usePreventScreenCapture();
  return null;
}

export default function RootLayout() {
  useEffect(() => {
    // Nada aqui aguarda rede ou banco: emergência e saída rápida valem desde a abertura.
    SplashScreen.hideAsync();
    syncContent();
  }, []);

  return (
    <>
      {/* Em desenvolvimento fica desligada para permitir espelhamento e evidências. */}
      {__DEV__ ? null : <ScreenProtection />}
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          contentStyle: { backgroundColor: Colors.background },
        }}
      />
    </>
  );
}
