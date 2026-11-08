import { asc } from "drizzle-orm";

import { ResourceList } from "@/components/admin/resource-list";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { requireAdmin } from "@/lib/session";

export default async function VideosPage({ searchParams }: PageProps<"/videos">) {
  await requireAdmin();
  const { salvo } = await searchParams;
  const rows = await db.select().from(videos).orderBy(asc(videos.title));

  return (
    <ResourceList
      resource="videos"
      heading="Vídeos"
      newLabel="Novo vídeo"
      publishedLabel="Na Home"
      hiddenLabel="Ocultos"
      savedMessage="Vídeo salvo com sucesso!"
      saved={salvo === "1"}
      items={rows.map((row) => ({
        id: row.id,
        badge: row.campus,
        title: row.title,
        subtitle: row.description,
        published: row.published,
      }))}
    />
  );
}
