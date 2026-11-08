import { and, eq } from "drizzle-orm";

import { db } from "../src/db";
import { account, session, user } from "../src/db/schema";
import {
  generateTemporaryPassword,
  hashPassword,
  printTemporaryPassword,
  requireAdminEmail,
} from "./admin-account";

/** Sem envio de e-mail não há "esqueci a senha": esta é a recuperação, só local. */
async function main() {
  const email = requireAdminEmail();
  const [admin] = await db.select({ id: user.id }).from(user).where(eq(user.email, email));
  if (!admin) {
    throw new Error(`Administrador ${email} não encontrado. Rode npm run db:seed.`);
  }

  const password = generateTemporaryPassword();
  const passwordHash = await hashPassword(password);

  await db.transaction(async (tx) => {
    await tx
      .update(account)
      .set({ password: passwordHash, updatedAt: new Date() })
      .where(and(eq(account.userId, admin.id), eq(account.providerId, "credential")));
    await tx.update(user).set({ mustChangePassword: true }).where(eq(user.id, admin.id));
    await tx.delete(session).where(eq(session.userId, admin.id));
  });

  printTemporaryPassword(email, password);
  await db.$client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
