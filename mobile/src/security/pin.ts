import { CryptoDigestAlgorithm, digestStringAsync, randomUUID } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

/**
 * Barreira de quem abre o app no aparelho desbloqueado, cenário que a
 * criptografia em repouso não cobre. Quem só tem o PIN errado não descobre se
 * existem relatos: a mesma tela aparece com ou sem eles.
 */
const PIN_KEY = 'relatos_pin';
const MAX_ATTEMPTS = 5;
const LOCK_MS = 30_000;

export const MIN_PIN_LENGTH = 4;

// Em memória de propósito: é um freio contra tentativas em sequência.
let failedAttempts = 0;
let lockedUntil = 0;

function hash(pin: string, salt: string) {
  return digestStringAsync(CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);
}

export async function hasPin() {
  return (await SecureStore.getItemAsync(PIN_KEY)) !== null;
}

export async function createPin(pin: string) {
  const salt = randomUUID();
  await SecureStore.setItemAsync(PIN_KEY, `${salt}:${await hash(pin, salt)}`);
}

export async function clearPin() {
  await SecureStore.deleteItemAsync(PIN_KEY);
  failedAttempts = 0;
  lockedUntil = 0;
}

export type PinResult = 'ok' | 'wrong' | 'locked';

export async function verifyPin(pin: string): Promise<PinResult> {
  if (Date.now() < lockedUntil) return 'locked';

  const stored = await SecureStore.getItemAsync(PIN_KEY);
  const [salt, expected] = stored?.split(':') ?? [];
  if (salt && expected && (await hash(pin, salt)) === expected) {
    failedAttempts = 0;
    return 'ok';
  }

  failedAttempts += 1;
  if (failedAttempts >= MAX_ATTEMPTS) {
    failedAttempts = 0;
    lockedUntil = Date.now() + LOCK_MS;
    return 'locked';
  }
  return 'wrong';
}
