import { router } from 'expo-router';
import { useSyncExternalStore } from 'react';

/**
 * Busca e navegação ficam só na memória: não gravar é mais confiável que
 * apagar, porque o sistema pode matar o app sem que nenhuma limpeza rode.
 */
let searchQuery = '';
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSearchQuery() {
  return useSyncExternalStore(subscribe, () => searchQuery);
}

export function setSearchQuery(value: string) {
  searchQuery = value;
  listeners.forEach((listener) => listener());
}

export function clearSession() {
  setSearchQuery('');
}

/**
 * Saída rápida: síncrona e sem I/O, para ficar dentro de 1 s em qualquer tela.
 * Substituir a rota desmonta todas as telas, levando junto formulários digitados.
 */
export function quickExit() {
  clearSession();
  router.replace('/neutra');
}
