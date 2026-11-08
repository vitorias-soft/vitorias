import { asc } from "drizzle-orm";

import { ResourceList } from "@/components/admin/resource-list";
import { db } from "@/db";
import { supportServices } from "@/db/schema";
import { SUPPORT_TYPES, type SupportType } from "@/lib/content-schemas";
import { requireAdmin } from "@/lib/session";

export default async function SupportServicesPage({ searchParams }: PageProps<"/rede-apoio">) {
  await requireAdmin();
  const { salvo } = await searchParams;
  const rows = await db.select().from(supportServices).orderBy(asc(supportServices.name));

  return (
    <ResourceList
      resource="rede-apoio"
      heading="Rede de apoio"
      newLabel="Novo serviço"
      publishedLabel="Publicados"
      hiddenLabel="Ocultos"
      savedMessage="Serviço salvo com sucesso!"
      saved={salvo === "1"}
      items={rows.map((row) => ({
        id: row.id,
        badge: SUPPORT_TYPES[row.type as SupportType]?.label ?? row.type,
        title: row.name,
        subtitle: `${row.address} · ${row.city}/${row.state}`,
        note: row.verifiedAt ? null : "Dados ainda não conferidos",
        published: row.published,
      }))}
    />
  );
}
