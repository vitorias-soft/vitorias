import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { BodyText, Card, Heading } from '@/components/ui';
import { Spacing } from '@/constants/theme';

export function AboutScreen() {
  return (
    <Screen>
      <Card style={styles.card}>
        <Heading style={styles.title}>O que é o Vitórias</Heading>
        <BodyText>
          Um app de conscientização, orientação e apoio a mulheres em situação de violência. Não
          substitui os serviços de emergência nem um Boletim de Ocorrência.
        </BodyText>
      </Card>

      <Card style={styles.card}>
        <Heading style={styles.title}>O que fica neste aparelho</Heading>
        <BodyText>
          Não há conta. Sua localização é usada só no aparelho, para calcular a distância até os
          serviços, e nunca é enviada. Buscas não são gravadas. Relatos ficam apenas aqui,
          criptografados, e não vão para a nuvem.
        </BodyText>
      </Card>

      <Card style={styles.card}>
        <Heading style={styles.title}>O que pode ficar fora do app</Heading>
        <View style={styles.list}>
          <BodyText>• Ligações ficam no registro de chamadas do telefone.</BodyText>
          <BodyText>
            • Rotas abertas no Google Maps podem ficar no histórico da sua conta Google.
          </BodyText>
          <BodyText>
            • Vídeos e links oficiais podem ficar no histórico do YouTube ou do navegador.
          </BodyText>
        </View>
        <BodyText>
          O app não controla esses históricos. Se alguém tem acesso ao seu aparelho, vale apagá-los
          depois de usar.
        </BodyText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.two },
  title: { fontSize: 15 },
  list: { gap: Spacing.one },
});
