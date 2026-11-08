import { z } from "zod";

const required = (label: string) => z.string().trim().min(1, `${label} é obrigatório.`);

const optional = z
  .string()
  .trim()
  .transform((value) => value || null);

const httpUrl = (value: string) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

const optionalNumber = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : Number(value.replace(",", "."))))
    .refine((value) => value === null || (value >= min && value <= max), message);

const checkbox = z.string().optional().transform(Boolean);

export const lawSchema = z.object({
  popularName: required("Nome popular"),
  number: required("Número"),
  summary: required("Resumo"),
  officialUrl: optional.refine((v) => v === null || httpUrl(v), "Informe um link válido."),
  published: checkbox,
});

const YOUTUBE_HOST = /^(www\.|m\.)?(youtube\.com|youtu\.be)$/;

export const videoSchema = z.object({
  title: required("Título"),
  description: required("Descrição"),
  youtubeUrl: required("Link do YouTube").refine(
    (value) => httpUrl(value) && YOUTUBE_HOST.test(new URL(value).hostname),
    "Informe um link do YouTube.",
  ),
  campus: optional,
  published: checkbox,
});

export const violenceTypeSchema = z.object({
  name: required("Nome"),
  description: required("Descrição"),
  sortOrder: z.coerce.number().int("Use um número inteiro.").default(0),
  published: checkbox,
});

/** Tipo → categoria do filtro do app (RF-07). Abrigos não entram: endereço sigiloso. */
export const SUPPORT_TYPES = {
  deam: { label: "DEAM", category: "emergencia" },
  patrulha_maria_da_penha: { label: "Patrulha Maria da Penha", category: "emergencia" },
  hospital: { label: "Hospital de referência", category: "emergencia" },
  crm: { label: "CRM / CEAM", category: "psicossocial" },
  creas: { label: "CREAS", category: "psicossocial" },
  cras: { label: "CRAS", category: "psicossocial" },
  caps: { label: "CAPS", category: "psicossocial" },
  defensoria: { label: "Defensoria Pública", category: "juridica" },
  npj: { label: "NPJ universitário", category: "juridica" },
  casa_mulher_brasileira: { label: "Casa da Mulher Brasileira", category: "juridica" },
} as const;

export type SupportType = keyof typeof SUPPORT_TYPES;

export const supportServiceSchema = z
  .object({
    type: z.enum(Object.keys(SUPPORT_TYPES) as [SupportType, ...SupportType[]], {
      error: "Selecione o tipo.",
    }),
    name: required("Nome"),
    address: required("Endereço"),
    neighborhood: optional,
    city: required("Cidade"),
    state: required("UF").toUpperCase().length(2, "Use a sigla da UF."),
    phone: optional,
    hours: optional,
    latitude: optionalNumber(-90, 90, "Latitude inválida."),
    longitude: optionalNumber(-180, 180, "Longitude inválida."),
    services: z
      .string()
      .transform((value) => value.split("\n").map((line) => line.trim()).filter(Boolean)),
    verified: checkbox,
    published: checkbox,
  })
  .refine((data) => (data.latitude === null) === (data.longitude === null), {
    path: ["longitude"],
    message: "Informe latitude e longitude juntas.",
  })
  .refine((data) => !data.published || data.verified, {
    path: ["published"],
    message: "Confira os dados antes de publicar: um telefone errado pode custar caro aqui.",
  });

export function formToObject(formData: FormData) {
  const data: Record<string, string> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string" && !key.startsWith("$ACTION")) data[key] = value;
  }
  return data;
}

export function fieldErrors(error: z.ZodError) {
  const flat = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
  return Object.fromEntries(
    Object.entries(flat).map(([field, messages]) => [field, messages?.[0] ?? "Valor inválido."]),
  );
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
