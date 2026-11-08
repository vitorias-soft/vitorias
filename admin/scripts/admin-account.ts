import { randomBytes } from "node:crypto";

import { hashPassword } from "better-auth/crypto";

/** Senha temporária aleatória, impressa uma única vez e nunca gravada no .env. */
export function generateTemporaryPassword() {
  return randomBytes(12).toString("base64url");
}

export { hashPassword };

export function requireAdminEmail() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) {
    throw new Error("ADMIN_EMAIL não definido no .env.");
  }
  return email;
}

export function printTemporaryPassword(email: string, password: string) {
  console.log("\n  Administrador:    " + email);
  console.log("  Senha temporária: " + password);
  console.log("  Ela não será mostrada de novo. A troca é obrigatória no primeiro acesso.\n");
}
