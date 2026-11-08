import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { saveVideo } from "@/app/(painel)/actions";
import { ResourceForm } from "@/components/admin/resource-form";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { isUuid } from "@/lib/route-id";
import { requireAdmin } from "@/lib/session";

export default async function VideoFormPage({ params }: PageProps<"/videos/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "novo";
  if (!isNew && !isUuid(id)) notFound();

  const [video] = isNew ? [] : await db.select().from(videos).where(eq(videos.id, id));
  if (!isNew && !video) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold">{isNew ? "Novo vídeo" : "Editar vídeo"}</h1>
      <ResourceForm
        action={saveVideo.bind(null, isNew ? null : id)}
        cancelHref="/videos"
        fields={[
          { type: "text", name: "title", label: "Título", required: true, defaultValue: video?.title },
          {
            type: "textarea",
            name: "description",
            label: "Descrição",
            required: true,
            defaultValue: video?.description,
          },
          {
            type: "url",
            name: "youtubeUrl",
            label: "Link do YouTube",
            required: true,
            defaultValue: video?.youtubeUrl,
          },
          { type: "text", name: "campus", label: "Campus", defaultValue: video?.campus },
          {
            type: "switch",
            name: "published",
            label: "Exibir na Home",
            defaultChecked: video?.published,
          },
        ]}
      />
    </div>
  );
}
