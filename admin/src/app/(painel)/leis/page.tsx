import { asc } from "drizzle-orm";

import { ResourceList } from "@/components/admin/resource-list";
import { db } from "@/db";
import { laws } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

export default async function LawsPage({ searchParams }: PageProps<"/leis">) {
  await requireAdmin();
  const { salvo } = await searchParams;
  const rows = await db.select().from(laws).orderBy(asc(laws.popularName));

  return (
    <ResourceList
      resource="leis"
      heading="Leis"
      newLabel="Nova lei"
      publishedLabel="Publicadas"
      hiddenLabel="Ocultas"
      savedMessage="Lei salva com sucesso!"
      saved={salvo === "1"}
      items={rows.map((row) => ({
        id: row.id,
        badge: row.number,
        title: row.popularName,
        published: row.published,
      }))}
    />
  );
}
