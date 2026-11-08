import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { BodyText, Card, Notice, Segmented } from '@/components/ui';
import { Messages } from '@/constants/messages';
import { Colors, Fonts, MinTouch, Radius, Spacing } from '@/constants/theme';
import type { Law, ViolenceType } from '@/data/content-types';
import { useCatalog } from '@/data/use-catalog';

const TABS = [
  { value: 'tipos', label: 'Tipos de Violência' },
  { value: 'leis', label: 'Direitos e Leis' },
] as const;

export function GuideScreen() {
  const [tab, setTab] = useState<'tipos' | 'leis'>('tipos');
  const { status, catalog } = useCatalog();

  const items = tab === 'tipos' ? catalog?.violenceTypes : catalog?.laws;
  const unavailable = status === 'error' || (status === 'ready' && items?.length === 0);

  return (
    <Screen>
      <Segmented options={TABS} value={tab} onChange={setTab} />
      {unavailable ? <Notice>{Messages.contentUnavailable}</Notice> : null}
      {!unavailable && tab === 'tipos' ? <ViolenceTypes types={catalog?.violenceTypes ?? []} /> : null}
      {!unavailable && tab === 'leis' ? <Laws laws={catalog?.laws ?? []} /> : null}
    </Screen>
  );
}

function ViolenceTypes({ types }: { types: ViolenceType[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <>
      <Notice>
        Toque em cada item para entender melhor. Baseado no Art. 7º da Lei Maria da Penha (Lei nº
        11.340/2006).
      </Notice>
      {types.map((type) => {
        const open = openId === type.id;
        return (
          <Card key={type.id} style={styles.accordion}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              onPress={() => setOpenId(open ? null : type.id)}
              style={styles.accordionHeader}>
              <View style={styles.dot} />
              <Text style={styles.accordionTitle}>{type.name}</Text>
              <MaterialIcons name={open ? 'arrow-upward' : 'arrow-downward'} size={24} color={Colors.text} />
            </Pressable>
            {open ? <BodyText style={styles.accordionBody}>{type.description}</BodyText> : null}
          </Card>
        );
      })}
    </>
  );
}

function Laws({ laws }: { laws: Law[] }) {
  return (
    <>
      {laws.map((law) => (
        <Card key={law.id} style={styles.law}>
          <View style={styles.lawNumber}>
            <Text style={styles.lawNumberText}>{law.number}</Text>
          </View>
          <Text accessibilityRole="header" style={styles.lawName}>
            {law.popularName}
          </Text>
          <BodyText>{law.summary}</BodyText>
          {law.officialUrl ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => Linking.openURL(law.officialUrl!).catch(() => {})}
              style={styles.lawLink}>
              <Text style={styles.lawLinkText}>Ver texto oficial</Text>
            </Pressable>
          ) : null}
        </Card>
      ))}
      <Notice>
        Este conteúdo é informativo e não substitui orientação jurídica individual. Procure a
        Defensoria Pública ou um Núcleo de Prática Jurídica para orientação sobre o seu caso.
      </Notice>
    </>
  );
}

const styles = StyleSheet.create({
  accordion: { paddingVertical: Spacing.one },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, minHeight: 52 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.mauve },
  accordionTitle: { flex: 1, fontFamily: Fonts.heading, fontSize: 16, color: Colors.text },
  accordionBody: { paddingBottom: Spacing.three },
  law: { gap: Spacing.two },
  lawNumber: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceAccent,
    borderRadius: Radius.large,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  lawNumberText: { fontFamily: Fonts.heading, fontSize: 12, color: Colors.label },
  lawName: { fontFamily: Fonts.heading, fontSize: 16, color: Colors.label },
  lawLink: { minHeight: MinTouch, justifyContent: 'center' },
  lawLinkText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});
