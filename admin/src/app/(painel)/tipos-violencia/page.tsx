import { asc } from "drizzle-orm";

import { ResourceList } from "@/components/admin/resource-list";
import { db } from "@/db";
import { violenceTypes } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

export default async function ViolenceTypesPage({ searchParams }: PageProps<"/tipos-violencia">) {
  await requireAdmin();
  const { salvo } = await searchParams;
  const rows = await db.select().from(violenceTypes).orderBy(asc(violenceTypes.sortOrder));

  return (
    <ResourceList
      resource="tipos-violencia"
      heading="Tipos de violência"
      newLabel="Novo tipo"
      publishedLabel="Publicados"
      hiddenLabel="Ocultos"
      savedMessage="Tipo de violência salvo com sucesso!"
      saved={salvo === "1"}
      items={rows.map((row) => ({
        id: row.id,
        title: row.name,
        subtitle: row.description,
        published: row.published,
      }))}
    />
  );
}
