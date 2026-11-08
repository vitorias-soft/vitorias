import { getContentVersion, replaceContent } from './content-db';
import { isSnapshot } from './content-types';

const TIMEOUT_MS = 8000;

/**
 * Baixa o catálogo publicado e o substitui inteiro. Nunca envia cidade,
 * coordenadas nem identificador. Sem rede ou com o computador desligado, o app
 * segue com o que já tem, por isso nenhuma falha aqui vira erro na tela.
 */
export async function syncContent() {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!baseUrl) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const version = await getContentVersion();
    const response = await fetch(`${baseUrl}/api/public/content`, {
      headers: version ? { 'If-None-Match': `"${version}"` } : {},
      signal: controller.signal,
    });
    if (response.status !== 200) return;

    const snapshot: unknown = await response.json();
    if (isSnapshot(snapshot)) await replaceContent(snapshot);
  } catch {
    // Offline é um estado normal do app.
  } finally {
    clearTimeout(timeout);
  }
}
