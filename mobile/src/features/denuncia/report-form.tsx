import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Field, Notice } from '@/components/ui';
import { Messages } from '@/constants/messages';
import { Spacing } from '@/constants/theme';
import { saveReport, type ReportPerspective } from '@/data/reports-db';

type Errors = { description?: string; occurredAt?: string; relationship?: string };

export function ReportForm({ perspective }: { perspective: ReportPerspective }) {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [description, setDescription] = useState('');
  const [occurredAt, setOccurredAt] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isFirst = perspective === 'first';

  async function submit() {
    const nextErrors: Errors = {};
    if (!description.trim()) nextErrors.description = 'Descreva o que aconteceu.';
    if (isFirst && !occurredAt.trim()) nextErrors.occurredAt = 'Informe quando aconteceu.';
    if (!isFirst && !relationship.trim()) nextErrors.relationship = 'Informe sua relação com ela.';
    setErrors(nextErrors);
    setFeedback(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await saveReport({
        perspective,
        reporterName: name.trim() || null,
        relationship: isFirst ? null : relationship.trim(),
        description: description.trim(),
        occurredAtText: occurredAt.trim() || null,
      });
      setName('');
      setRelationship('');
      setDescription('');
      setOccurredAt('');
      setFeedback(Messages.reportSaved);
    } catch {
      // Inclui SQLCipher ausente: melhor não salvar do que salvar sem proteção.
      setFeedback('Não foi possível salvar com segurança neste aparelho. O relato não foi gravado.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.form}>
      <Notice>
        {isFirst
          ? 'Este espaço ajuda você a organizar seu relato com calma. Ele fica salvo apenas neste aparelho e não substitui um Boletim de Ocorrência oficial.'
          : 'Você está relatando em nome de outra pessoa. Isso pode ajudá-la a buscar apoio. O que você escrever sobre ela fica apenas neste aparelho.'}
      </Notice>

      <Field
        label={isFirst ? 'Seu nome (opcional)' : 'Nome da pessoa (opcional)'}
        placeholder={isFirst ? 'Como podemos te chamar' : 'Nome de quem você quer ajudar'}
        value={name}
        onChangeText={setName}
      />

      {!isFirst ? (
        <Field
          label="Sua relação com ela"
          placeholder="Ex: vizinha, amiga, familiar"
          value={relationship}
          onChangeText={setRelationship}
          error={errors.relationship}
        />
      ) : null}

      <Field
        label={isFirst ? 'O que aconteceu' : 'O que você presenciou'}
        placeholder={
          isFirst
            ? 'Descreva com as palavras que fizerem sentido para você.'
            : 'Descreva o que você viu ou ouviu.'
        }
        multiline
        value={description}
        onChangeText={setDescription}
        error={errors.description}
      />

      <Field
        label={isFirst ? 'Quando aconteceu' : 'Quando aconteceu (opcional)'}
        placeholder="Ex: 12/08/2026 ou ‘semana passada’"
        value={occurredAt}
        onChangeText={setOccurredAt}
        error={errors.occurredAt}
      />

      {feedback ? <Notice>{feedback}</Notice> : null}

      <Button label="Salvar relato" onPress={submit} disabled={saving} style={styles.save} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.three },
  save: { marginTop: Spacing.two },
});
