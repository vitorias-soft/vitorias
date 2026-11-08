import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, Pressable, StyleSheet, Text, View } from 'react-native';

import { BodyText, Button, Card, Field, Notice } from '@/components/ui';
import { Colors, Fonts, MinTouch, Radius, Spacing } from '@/constants/theme';
import {
  deleteAllReports,
  deleteReport,
  listReports,
  type Report,
} from '@/data/reports-db';
import { clearPin, createPin, hasPin, MIN_PIN_LENGTH, verifyPin } from '@/security/pin';

type Gate = 'checking' | 'create' | 'enter' | 'open';

/** Protege os relatos com PIN e tranca de novo ao sair da aba ou do app. */
export function SavedReports() {
  const [gate, setGate] = useState<Gate>('checking');

  const lock = useCallback(() => {
    hasPin()
      .then((exists) => setGate(exists ? 'enter' : 'create'))
      .catch(() => setGate('enter'));
  }, []);

  useFocusEffect(
    useCallback(() => {
      lock();
      return () => setGate('checking');
    }, [lock]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') lock();
    });
    return () => subscription.remove();
  }, [lock]);

  if (gate === 'checking') return null;
  if (gate === 'open') return <ReportList />;
  return <PinGate mode={gate} onUnlock={() => setGate('open')} onReset={lock} />;
}

function PinGate({
  mode,
  onUnlock,
  onReset,
}: {
  mode: 'create' | 'enter';
  onUnlock: () => void;
  onReset: () => void;
}) {
  const [pin, setPin] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string>();

  async function submit() {
    if (mode === 'create') {
      if (pin.length < MIN_PIN_LENGTH) {
        setError(`Use ao menos ${MIN_PIN_LENGTH} números.`);
      } else if (pin !== confirmation) {
        setError('Os PINs não coincidem.');
      } else {
        await createPin(pin);
        onUnlock();
      }
      return;
    }

    const result = await verifyPin(pin);
    setPin('');
    if (result === 'ok') onUnlock();
    else if (result === 'locked') setError('Muitas tentativas. Aguarde 30 segundos.');
    else setError('PIN incorreto.');
  }

  function forgotPin() {
    Alert.alert(
      'Esqueceu o PIN?',
      'Não é possível recuperá-lo. Para criar outro, todos os relatos salvos neste aparelho serão apagados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar e criar novo PIN',
          style: 'destructive',
          onPress: async () => {
            await deleteAllReports().catch(() => {});
            await clearPin();
            onReset();
          },
        },
      ],
    );
  }

  return (
    <View style={styles.gate}>
      <Notice>
        {mode === 'create'
          ? 'Crie um PIN para abrir esta área. Assim, quem pegar o aparelho desbloqueado não lê o que está aqui.'
          : 'Digite seu PIN para abrir esta área.'}
      </Notice>
      <Field
        label={mode === 'create' ? 'Novo PIN' : 'PIN'}
        value={pin}
        onChangeText={(text) => setPin(text.replace(/\D/g, ''))}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={12}
        error={mode === 'enter' ? error : undefined}
      />
      {mode === 'create' ? (
        <Field
          label="Confirme o PIN"
          value={confirmation}
          onChangeText={(text) => setConfirmation(text.replace(/\D/g, ''))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={12}
          error={error}
        />
      ) : null}
      <Button label={mode === 'create' ? 'Criar PIN' : 'Abrir'} onPress={submit} />
      {mode === 'enter' ? (
        <Pressable accessibilityRole="button" onPress={forgotPin} style={styles.forgot}>
          <Text style={styles.forgotLabel}>Esqueci o PIN</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ReportList() {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(() => {
    listReports()
      .then(setReports)
      .catch(() => setFailed(true));
  }, []);

  useEffect(refresh, [refresh]);

  if (failed) return <Notice>Não foi possível abrir os relatos neste aparelho.</Notice>;
  if (!reports) return null;
  if (reports.length === 0) return <Notice>Nenhum relato salvo.</Notice>;

  function confirmDeleteAll() {
    Alert.alert('Apagar todos os relatos?', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar todos',
        style: 'destructive',
        onPress: () => deleteAllReports().then(refresh),
      },
    ]);
  }

  function confirmDelete(id: string) {
    Alert.alert('Apagar este relato?', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => deleteReport(id).then(refresh) },
    ]);
  }

  return (
    <View style={styles.list}>
      {reports.map((report) => (
        <Card key={report.id} style={styles.report}>
          <View style={styles.reportHeader}>
            <Text style={styles.date}>
              {new Date(report.createdAt).toLocaleDateString('pt-BR')}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>
                {report.perspective === 'first' ? '1ª pessoa' : '3ª pessoa'}
              </Text>
            </View>
          </View>
          {report.reporterName ? <Text style={styles.name}>{report.reporterName}</Text> : null}
          <BodyText>{report.description}</BodyText>
          {report.relationship ? <BodyText>Relação: {report.relationship}</BodyText> : null}
          {report.occurredAtText ? <BodyText>Quando: {report.occurredAtText}</BodyText> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Apagar este relato"
            onPress={() => confirmDelete(report.id)}
            style={styles.deleteOne}>
            <Text style={styles.deleteLabel}>Apagar</Text>
          </Pressable>
        </Card>
      ))}
      <Button label="Apagar Todos" variant="destructive" onPress={confirmDeleteAll} />
    </View>
  );
}

const styles = StyleSheet.create({
  gate: { gap: Spacing.three },
  forgot: { minHeight: MinTouch, alignItems: 'center', justifyContent: 'center' },
  forgotLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  list: { gap: Spacing.three },
  report: { gap: Spacing.two },
  reportHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: { fontFamily: Fonts.heading, fontSize: 13, color: Colors.label },
  badge: {
    backgroundColor: Colors.surfaceAccent,
    borderRadius: Radius.large,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  badgeLabel: { fontFamily: Fonts.heading, fontSize: 11, color: Colors.label },
  name: { fontFamily: Fonts.heading, fontSize: 13, color: Colors.label },
  deleteOne: { minHeight: MinTouch, justifyContent: 'center', alignSelf: 'flex-end' },
  deleteLabel: { fontFamily: Fonts.bodyBold, fontSize: 14, color: Colors.emergency },
});
