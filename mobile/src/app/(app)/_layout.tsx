import { Stack } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { Colors } from '@/constants/theme';

export default function AppLayout() {
  return (
    <AppShell>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
          contentStyle: { backgroundColor: Colors.background },
        }}
      />
    </AppShell>
  );
}
