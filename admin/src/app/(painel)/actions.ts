"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { FormState } from "@/components/admin/resource-form";
import { db } from "@/db";
import {
  laws,
  lawViolenceTypes,
  supportServices,
  videos,
  violenceTypes,
} from "@/db/schema";
import {
  fieldErrors,
  formToObject,
  lawSchema,
  slugify,
  SUPPORT_TYPES,
  supportServiceSchema,
  videoSchema,
  violenceTypeSchema,
} from "@/lib/content-schemas";
import { requireAdmin } from "@/lib/session";

const TABLES = {
  leis: laws,
  videos,
  "tipos-violencia": violenceTypes,
  "rede-apoio": supportServices,
} as const;

export type Resource = keyof typeof TABLES;

const targetSchema = z.object({
  resource: z.enum(Object.keys(TABLES) as [Resource, ...Resource[]]),
  id: z.uuid(),
});

export async function setPublished(resource: Resource, id: string, published: boolean) {
  await requireAdmin();
  const target = targetSchema.parse({ resource, id });

  if (target.resource === "rede-apoio" && published) {
    const [service] = await db
      .select({ verifiedAt: supportServices.verifiedAt })
      .from(supportServices)
      .where(eq(supportServices.id, target.id));
    if (!service?.verifiedAt) {
      return { error: "Confira os dados deste serviço antes de publicar." };
    }
  }

  const table = TABLES[target.resource];
  await db.update(table).set({ published }).where(eq(table.id, target.id));
  revalidatePath(`/${target.resource}`);
  return {};
}

export async function deleteResource(resource: Resource, id: string) {
  await requireAdmin();
  const target = targetSchema.parse({ resource, id });
  const table = TABLES[target.resource];
  await db.delete(table).where(eq(table.id, target.id));
  revalidatePath(`/${target.resource}`);
}

function finish(resource: Resource): never {
  revalidatePath(`/${resource}`);
  redirect(`/${resource}?salvo=1`);
}

export async function saveLaw(
  id: string | null,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = lawSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const typeIds = z.array(z.uuid()).parse(formData.getAll("violenceTypeIds"));

  await db.transaction(async (tx) => {
    let lawId = id;
    if (lawId) {
      await tx.update(laws).set(parsed.data).where(eq(laws.id, lawId));
      await tx.delete(lawViolenceTypes).where(eq(lawViolenceTypes.lawId, lawId));
    } else {
      const [created] = await tx.insert(laws).values(parsed.data).returning({ id: laws.id });
      lawId = created.id;
    }
    if (typeIds.length > 0) {
      await tx
        .insert(lawViolenceTypes)
        .values(typeIds.map((violenceTypeId) => ({ lawId: lawId!, violenceTypeId })));
    }
  });

  finish("leis");
}

export async function saveVideo(
  id: string | null,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = videoSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  if (id) {
    await db.update(videos).set(parsed.data).where(eq(videos.id, id));
  } else {
    await db.insert(videos).values(parsed.data);
  }

  finish("videos");
}

export async function saveViolenceType(
  id: string | null,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = violenceTypeSchema.safeParse(formToObject(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  if (id) {
    // O slug fica estável: renomear não muda o vínculo usado no app.
    await db.update(violenceTypes).set(parsed.data).where(eq(violenceTypes.id, id));
  } else {
    const slug = slugify(parsed.data.name);
    const [existing] = await db
      .select({ id: violenceTypes.id })
      .from(violenceTypes)
      .where(eq(violenceTypes.slug, slug));
    if (existing) return { errors: { name: "Já existe um tipo com este nome." } };
    await db.insert(violenceTypes).values({ ...parsed.data, slug });
  }

  finish("tipos-violencia");
}

export async function saveSupportService(
  id: string | null,
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const parsed = supportServiceSchema.safeParse({
    services: "",
    latitude: "",
    longitude: "",
    ...formToObject(formData),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { verified, ...data } = parsed.data;
  const [current] = id
    ? await db
        .select({ verifiedAt: supportServices.verifiedAt })
        .from(supportServices)
        .where(eq(supportServices.id, id))
    : [];
  const values = {
    ...data,
    category: SUPPORT_TYPES[data.type].category,
    verifiedAt: verified ? (current?.verifiedAt ?? new Date()) : null,
  };

  if (id) {
    await db.update(supportServices).set(values).where(eq(supportServices.id, id));
  } else {
    await db.insert(supportServices).values(values);
  }

  finish("rede-apoio");
}
