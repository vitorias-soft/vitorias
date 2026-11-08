import type { SupportCategory, SupportService } from '@/data/content-types';

export type Coordinates = { latitude: number; longitude: number };

const INITIAL_RADIUS_KM = 20;

/** Distância calculada só no aparelho (RN02). */
export function distanceKm(from: Coordinates, to: Coordinates) {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(to.latitude - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.latitude)) * Math.cos(toRad(to.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export type ListedService = { service: SupportService; distance: number | null };

export function buildSupportList(
  services: SupportService[],
  options: {
    category: SupportCategory | 'todas';
    query: string;
    position: Coordinates | null;
  },
): ListedService[] {
  const query = normalize(options.query.trim());

  const matches = services
    .filter((service) => options.category === 'todas' || service.category === options.category)
    .filter(
      (service) =>
        !query ||
        normalize(
          [service.name, service.city, service.neighborhood, service.address].join(' '),
        ).includes(query),
    )
    .map((service) => ({
      service,
      distance:
        options.position && service.latitude !== null && service.longitude !== null
          ? distanceKm(options.position, {
              latitude: service.latitude,
              longitude: service.longitude,
            })
          : null,
    }))
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

  // Sem nada no raio, amplia em vez de dizer que não existe apoio. Serviços sem
  // coordenadas sempre aparecem: não dá para afirmar que estão longe.
  const nearby = matches.filter(
    (item) => item.distance === null || item.distance <= INITIAL_RADIUS_KM,
  );
  return nearby.length > 0 ? nearby : matches;
}

export function directionsUrl(service: SupportService) {
  // Só o destino: o próprio Maps usa a localização atual, e o app não envia a origem.
  const destination =
    service.latitude !== null && service.longitude !== null
      ? `${service.latitude},${service.longitude}`
      : `${service.address}, ${service.city} - ${service.state}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
