import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { db } from "../src/db";
import { buildSnapshot } from "../src/lib/snapshot";

/** Gera o conteúdo embutido no app, no mesmo formato da API pública. */
async function main() {
  const target = resolve(process.cwd(), "../mobile/assets/content/snapshot.json");
  const snapshot = await buildSnapshot();
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`Snapshot ${snapshot.version.slice(0, 12)} gravado em ${target}`);
  await db.$client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
