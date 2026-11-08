/**
 * Fixos no código de propósito: um número de emergência não pode depender de
 * sincronização nem de edição remota.
 */
export const EMERGENCY_CHANNELS = [
  {
    number: '180',
    name: 'Central de Atendimento à Mulher',
    description: 'Orientação, denúncia e encaminhamento - 24h',
  },
  {
    number: '190',
    name: 'Polícia Militar',
    description: 'Risco imediato à sua integridade física',
  },
  {
    number: '100',
    name: 'Disque Direitos Humanos',
    description: 'Denúncias de violações de direitos humanos',
  },
] as const;
