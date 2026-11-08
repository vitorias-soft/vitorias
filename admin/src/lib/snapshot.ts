import { createHash } from "node:crypto";

import { asc, eq } from "drizzle-orm";

import { db } from "../db";
import {
  laws,
  lawViolenceTypes,
  supportServices,
  videos,
  violenceTypes,
} from "../db/schema";

/**
 * Catálogo publicado que o app baixa inteiro. Usado pela API pública e pelo
 * script que gera o snapshot embutido, para os dois terem o mesmo formato.
 * Só sai daqui o que está publicado, e nada sobre quem pede.
 */
export async function buildSnapshot() {
  const [typeRows, lawRows, links, videoRows, serviceRows] = await Promise.all([
    db
      .select()
      .from(violenceTypes)
      .where(eq(violenceTypes.published, true))
      .orderBy(asc(violenceTypes.sortOrder), asc(violenceTypes.name)),
    db.select().from(laws).where(eq(laws.published, true)).orderBy(asc(laws.popularName)),
    db
      .select({ lawId: lawViolenceTypes.lawId, slug: violenceTypes.slug })
      .from(lawViolenceTypes)
      .innerJoin(violenceTypes, eq(lawViolenceTypes.violenceTypeId, violenceTypes.id))
      .orderBy(asc(violenceTypes.slug)),
    db.select().from(videos).where(eq(videos.published, true)).orderBy(asc(videos.title)),
    db
      .select()
      .from(supportServices)
      .where(eq(supportServices.published, true))
      .orderBy(asc(supportServices.name)),
  ]);

  const content = {
    violenceTypes: typeRows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      sortOrder: row.sortOrder,
    })),
    laws: lawRows.map((row) => ({
      id: row.id,
      popularName: row.popularName,
      number: row.number,
      summary: row.summary,
      officialUrl: row.officialUrl,
      violenceTypeSlugs: links.filter((link) => link.lawId === row.id).map((link) => link.slug),
    })),
    videos: videoRows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      youtubeUrl: row.youtubeUrl,
      campus: row.campus,
    })),
    supportServices: serviceRows.map((row) => ({
      id: row.id,
      type: row.type,
      category: row.category,
      name: row.name,
      address: row.address,
      neighborhood: row.neighborhood,
      city: row.city,
      state: row.state,
      phone: row.phone,
      hours: row.hours,
      latitude: row.latitude,
      longitude: row.longitude,
      services: row.services,
      verifiedAt: row.verifiedAt?.toISOString() ?? null,
    })),
  };

  const version = createHash("sha256").update(JSON.stringify(content)).digest("hex");
  return { version, ...content };
}
