/** Mesmo formato de GET /api/public/content no admin. */

export type ViolenceType = {
  id: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
};

export type Law = {
  id: string;
  popularName: string;
  number: string;
  summary: string;
  officialUrl: string | null;
  violenceTypeSlugs: string[];
};

export type Video = {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  campus: string | null;
};

export type SupportCategory = 'emergencia' | 'psicossocial' | 'juridica';

export type SupportService = {
  id: string;
  type: string;
  category: SupportCategory;
  name: string;
  address: string;
  neighborhood: string | null;
  city: string;
  state: string;
  phone: string | null;
  hours: string | null;
  latitude: number | null;
  longitude: number | null;
  services: string[];
  verifiedAt: string | null;
};

export type Catalog = {
  violenceTypes: ViolenceType[];
  laws: Law[];
  videos: Video[];
  supportServices: SupportService[];
};

export type Snapshot = Catalog & { version: string };

export function isSnapshot(value: unknown): value is Snapshot {
  const data = value as Partial<Snapshot> | null;
  return (
    typeof data?.version === 'string' &&
    Array.isArray(data.violenceTypes) &&
    Array.isArray(data.laws) &&
    Array.isArray(data.videos) &&
    Array.isArray(data.supportServices)
  );
}
