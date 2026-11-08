import { randomUUID } from "node:crypto";

import { eq, sql } from "drizzle-orm";

import { db } from "../src/db";
import {
  account,
  laws,
  lawViolenceTypes,
  supportServices,
  user,
  violenceTypes,
} from "../src/db/schema";
import {
  generateTemporaryPassword,
  hashPassword,
  printTemporaryPassword,
  requireAdminEmail,
} from "./admin-account";
import { lawSeed, supportServiceSeed, violenceTypeSeed } from "./seed-data";

/** Cria o administrador; se o e-mail já existe, não altera nada. */
async function seedAdmin() {
  const email = requireAdminEmail();
  const [existing] = await db.select({ id: user.id }).from(user).where(eq(user.email, email));
  if (existing) {
    console.log(`Administrador ${email} já existe: nada alterado.`);
    return;
  }

  const password = generateTemporaryPassword();
  const passwordHash = await hashPassword(password);
  const userId = randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(user).values({
      id: userId,
      name: "Administrador",
      email,
      emailVerified: true,
      mustChangePassword: true,
    });
    await tx.insert(account).values({
      id: randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: passwordHash,
      updatedAt: new Date(),
    });
  });

  printTemporaryPassword(email, password);
}

/** Cada grupo só é semeado com a tabela vazia, para não desfazer edições do painel. */
async function seedContent() {
  const [{ count: typeCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(violenceTypes);
  if (typeCount === 0) {
    await db
      .insert(violenceTypes)
      .values(violenceTypeSeed.map((type, i) => ({ ...type, sortOrder: i, published: true })));
    console.log("Tipos de violência criados.");
  }

  const [{ count: lawCount }] = await db.select({ count: sql<number>`count(*)::int` }).from(laws);
  if (lawCount === 0) {
    const types = await db.select().from(violenceTypes);
    for (const { types: slugs, ...law } of lawSeed) {
      const [created] = await db.insert(laws).values(law).returning({ id: laws.id });
      const links = types
        .filter((type) => slugs.includes(type.slug))
        .map((type) => ({ lawId: created.id, violenceTypeId: type.id }));
      if (links.length > 0) await db.insert(lawViolenceTypes).values(links);
    }
    console.log("Leis criadas.");
  }

  const [{ count: serviceCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(supportServices);
  if (serviceCount === 0) {
    await db.insert(supportServices).values(supportServiceSeed);
    console.log("Rede de apoio do DF criada como oculta: confira os dados e publique no painel.");
  }
}

async function main() {
  await seedAdmin();
  await seedContent();
  await db.$client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
