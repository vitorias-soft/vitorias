import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { BodyText, Button, Card, Field, Notice } from '@/components/ui';
import { Messages } from '@/constants/messages';
import { Colors, Fonts, MinTouch, Radius, Spacing } from '@/constants/theme';
import type { SupportCategory, SupportService } from '@/data/content-types';
import { useCatalog } from '@/data/use-catalog';
import { setSearchQuery, useSearchQuery } from '@/security/session';

import { buildSupportList, directionsUrl, type Coordinates } from './support-list';

const FILTERS: { value: SupportCategory | 'todas'; label: string }[] = [
  { value: 'todas', label: 'Todos' },
  { value: 'emergencia', label: 'Emergência' },
  { value: 'psicossocial', label: 'Psicológico/Social' },
  { value: 'juridica', label: 'Jurídica' },
];

const GPS_TIMEOUT_MS = 15000;

/** Coordenadas ficam só no estado desta tela: nada é gravado nem enviado. */
function useCurrentPosition() {
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<'locating' | 'ready' | 'unavailable'>('locating');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) throw new Error('permission');
        const current = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            // Sem diálogo do sistema por cima do app: sem GPS, vale a busca por cidade.
            mayShowUserSettingsDialog: false,
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), GPS_TIMEOUT_MS),
          ),
        ]);
        if (!active) return;
        setPosition({ latitude: current.coords.latitude, longitude: current.coords.longitude });
        setStatus('ready');
      } catch {
        if (active) setStatus('unavailable');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { position, status };
}

function openDirections(service: SupportService) {
  Alert.alert(
    'Abrir no Google Maps?',
    'O destino pode ficar no histórico da sua conta Google. Se alguém tem acesso ao seu aparelho, apague-o depois de usar.',
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Abrir', onPress: () => Linking.openURL(directionsUrl(service)).catch(() => {}) },
    ],
  );
}

export function SupportScreen() {
  const { status: catalogStatus, catalog } = useCatalog();
  const { position, status: gpsStatus } = useCurrentPosition();
  const [category, setCategory] = useState<SupportCategory | 'todas'>('todas');
  const query = useSearchQuery();

  const services = catalog?.supportServices ?? [];
  const list = buildSupportList(services, { category, query, position });

  return (
    <Screen>
      {gpsStatus === 'unavailable' ? <Notice>{Messages.enableGps}</Notice> : null}

      <Field
        label="Buscar por cidade ou bairro"
        value={query}
        onChangeText={setSearchQuery}
        placeholder="Ex: Ceilândia"
      />

      <View accessibilityRole="radiogroup" style={styles.filters}>
        {FILTERS.map((filter) => {
          const selected = filter.value === category;
          return (
            <Pressable
              key={filter.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setCategory(filter.value)}
              style={[styles.filter, selected && styles.filterSelected]}>
              <Text style={[styles.filterLabel, selected && styles.filterLabelSelected]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {catalogStatus === 'ready' && list.length === 0 ? (
        <Notice>
          {services.length === 0
            ? 'Ainda não há serviços cadastrados neste aparelho. Em caso de emergência, use a aba Emergência.'
            : 'Nenhum serviço encontrado com esses critérios.'}
        </Notice>
      ) : null}

      {list.map(({ service, distance }) => (
        <Card key={service.id} style={styles.card}>
          <Text style={styles.name}>{service.name}</Text>
          <BodyText>
            {service.address} · {service.city}/{service.state}
          </BodyText>
          {distance !== null ? (
            <Text style={styles.distance}>
              {distance < 1 ? 'Menos de 1 km' : `${distance.toFixed(1).replace('.', ',')} km`}
            </Text>
          ) : null}
          {service.hours ? <BodyText>Horário: {service.hours}</BodyText> : null}
          {service.services.length > 0 ? <BodyText>{service.services.join(' · ')}</BodyText> : null}
          <View style={styles.actions}>
            <Button label="Ver rota" onPress={() => openDirections(service)} style={styles.action} />
            {service.phone ? (
              <Button
                label="Ligar"
                variant="secondary"
                accessibilityLabel={`Ligar para ${service.name}`}
                onPress={() =>
                  Linking.openURL(`tel:${service.phone!.replace(/[^\d+]/g, '')}`).catch(() => {})
                }
                style={styles.action}
              />
            ) : null}
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  filter: {
    minHeight: MinTouch,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.large,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterLabel: { fontFamily: Fonts.heading, fontSize: 12, color: Colors.textMuted },
  filterLabelSelected: { color: Colors.onPrimary },
  card: { gap: Spacing.two },
  name: { fontFamily: Fonts.heading, fontSize: 14, color: Colors.label },
  distance: { fontFamily: Fonts.heading, fontSize: 13, color: Colors.plum },
  actions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  action: { flex: 1 },
});
