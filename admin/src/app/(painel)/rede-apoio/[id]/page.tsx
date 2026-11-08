import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { saveSupportService } from "@/app/(painel)/actions";
import { ResourceForm } from "@/components/admin/resource-form";
import { db } from "@/db";
import { supportServices } from "@/db/schema";
import { SUPPORT_TYPES } from "@/lib/content-schemas";
import { isUuid } from "@/lib/route-id";
import { requireAdmin } from "@/lib/session";

const TYPE_OPTIONS = Object.entries(SUPPORT_TYPES).map(([value, { label }]) => ({ value, label }));

export default async function SupportServiceFormPage({ params }: PageProps<"/rede-apoio/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "novo";
  if (!isNew && !isUuid(id)) notFound();

  const [service] = isNew
    ? []
    : await db.select().from(supportServices).where(eq(supportServices.id, id));
  if (!isNew && !service) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-bold">
        {isNew ? "Novo serviço" : "Editar serviço"}
      </h1>
      <ResourceForm
        action={saveSupportService.bind(null, isNew ? null : id)}
        cancelHref="/rede-apoio"
        fields={[
          {
            type: "select",
            name: "type",
            label: "Tipo",
            required: true,
            options: TYPE_OPTIONS,
            defaultValue: service?.type,
            hint: "Não cadastre abrigos: a localização costuma ser sigilosa. Oriente o acesso via CRM/CREAS.",
          },
          { type: "text", name: "name", label: "Nome", required: true, defaultValue: service?.name },
          {
            type: "text",
            name: "address",
            label: "Endereço",
            required: true,
            defaultValue: service?.address,
          },
          { type: "text", name: "neighborhood", label: "Bairro", defaultValue: service?.neighborhood },
          { type: "text", name: "city", label: "Cidade", required: true, defaultValue: service?.city },
          { type: "text", name: "state", label: "UF", required: true, defaultValue: service?.state },
          { type: "text", name: "phone", label: "Telefone", defaultValue: service?.phone },
          { type: "text", name: "hours", label: "Horário", defaultValue: service?.hours },
          {
            type: "number",
            name: "latitude",
            label: "Latitude",
            placeholder: "-15.7939",
            defaultValue: service?.latitude,
            hint: "Sem coordenadas, o serviço aparece sem distância e a rota usa o endereço.",
          },
          {
            type: "number",
            name: "longitude",
            label: "Longitude",
            placeholder: "-47.8828",
            defaultValue: service?.longitude,
          },
          {
            type: "textarea",
            name: "services",
            label: "Serviços oferecidos",
            hint: "Um por linha.",
            defaultValue: service?.services.join("\n"),
          },
          {
            type: "switch",
            name: "verified",
            label: "Dados conferidos com o serviço",
            defaultChecked: Boolean(service?.verifiedAt),
          },
          {
            type: "switch",
            name: "published",
            label: "Publicado no app",
            defaultChecked: service?.published,
          },
        ]}
      />
    </div>
  );
}
