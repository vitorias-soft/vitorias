import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { saveViolenceType } from "@/app/(painel)/actions";
import { ResourceForm } from "@/components/admin/resource-form";
import { db } from "@/db";
import { violenceTypes } from "@/db/schema";
import { isUuid } from "@/lib/route-id";
import { requireAdmin } from "@/lib/session";

export default async function ViolenceTypeFormPage({ params }: PageProps<"/tipos-violencia/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "novo";
  if (!isNew && !isUuid(id)) notFound();

  const [type] = isNew ? [] : await db.select().from(violenceTypes).where(eq(violenceTypes.id, id));
  if (!isNew && !type) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold">
        {isNew ? "Novo tipo de violência" : "Editar tipo de violência"}
      </h1>
      <ResourceForm
        action={saveViolenceType.bind(null, isNew ? null : id)}
        cancelHref="/tipos-violencia"
        fields={[
          { type: "text", name: "name", label: "Nome", required: true, defaultValue: type?.name },
          {
            type: "textarea",
            name: "description",
            label: "Descrição",
            required: true,
            defaultValue: type?.description,
          },
          {
            type: "number",
            name: "sortOrder",
            label: "Ordem de exibição",
            defaultValue: type?.sortOrder ?? 0,
          },
          {
            type: "switch",
            name: "published",
            label: "Publicado no app",
            defaultChecked: type?.published,
          },
        ]}
      />
    </div>
  );
}
