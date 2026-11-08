import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { saveLaw } from "@/app/(painel)/actions";
import { ResourceForm } from "@/components/admin/resource-form";
import { db } from "@/db";
import { laws, lawViolenceTypes, violenceTypes } from "@/db/schema";
import { isUuid } from "@/lib/route-id";
import { requireAdmin } from "@/lib/session";

export default async function LawFormPage({ params }: PageProps<"/leis/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "novo";
  if (!isNew && !isUuid(id)) notFound();

  const [law] = isNew ? [] : await db.select().from(laws).where(eq(laws.id, id));
  if (!isNew && !law) notFound();

  const [types, links] = await Promise.all([
    db.select().from(violenceTypes).orderBy(asc(violenceTypes.sortOrder)),
    isNew
      ? []
      : db
          .select({ id: lawViolenceTypes.violenceTypeId })
          .from(lawViolenceTypes)
          .where(eq(lawViolenceTypes.lawId, id)),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold">{isNew ? "Nova lei" : "Editar lei"}</h1>
      <ResourceForm
        action={saveLaw.bind(null, isNew ? null : id)}
        cancelHref="/leis"
        fields={[
          {
            type: "text",
            name: "popularName",
            label: "Nome popular",
            required: true,
            defaultValue: law?.popularName,
          },
          {
            type: "text",
            name: "number",
            label: "Número",
            required: true,
            placeholder: "Lei nº 11.340/2006",
            defaultValue: law?.number,
          },
          {
            type: "checkboxes",
            name: "violenceTypeIds",
            label: "Tipos de violência",
            options: types.map((type) => ({ value: type.id, label: type.name })),
            defaultValues: links.map((link) => link.id),
          },
          {
            type: "textarea",
            name: "summary",
            label: "Resumo",
            required: true,
            defaultValue: law?.summary,
          },
          { type: "url", name: "officialUrl", label: "Link oficial", defaultValue: law?.officialUrl },
          {
            type: "switch",
            name: "published",
            label: "Publicada no app",
            defaultChecked: law?.published,
          },
        ]}
      />
    </div>
  );
}
