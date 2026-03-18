type NearbyPlacePayload = {
  id?: string;
  name?: string;
  category?: string;
  distanceKm?: number;
  walkMinutes?: number;
  highlight?: string;
};

type RoomPayload = {
  title?: string;
  city?: string;
  locality?: string;
  address?: string;
  price?: number;
  deposit?: number;
  rating?: number;
  reviewCount?: number;
  occupancy?: 'Single' | 'Double' | 'Shared';
  roomType?: 'Private Room' | 'Studio' | 'PG' | 'Coliving';
  gender?: 'Any' | 'Boys' | 'Girls';
  availableFrom?: string;
  seatsLeft?: number;
  description?: string;
  heroTag?: string;
  image?: string;
  amenities?: string[] | string;
  rules?: string[] | string;
  transit?: string[] | string;
  nearbyPlaces?: NearbyPlacePayload[];
  featured?: boolean;
};

function normalizeList(value: string[] | string | undefined) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

export function normalizeRoomPayload(payload: RoomPayload) {
  const title = String(payload.title ?? '').trim();
  const city = String(payload.city ?? '').trim();
  const locality = String(payload.locality ?? '').trim();
  const address = String(payload.address ?? '').trim();
  const description = String(payload.description ?? '').trim();

  if (!title || !city || !locality || !address || !description) {
    throw new Error('Title, city, locality, address, and description are required.');
  }

  return {
    title,
    city,
    locality,
    address,
    price: Number(payload.price ?? 0),
    deposit: Number(payload.deposit ?? 0),
    rating: Number(payload.rating ?? 4.5),
    reviewCount: Number(payload.reviewCount ?? 0),
    occupancy: payload.occupancy || 'Single',
    roomType: payload.roomType || 'Private Room',
    gender: payload.gender || 'Any',
    availableFrom: String(payload.availableFrom ?? new Date().toISOString().slice(0, 10)),
    seatsLeft: Number(payload.seatsLeft ?? 1),
    description,
    heroTag: String(payload.heroTag ?? 'Move-in ready').trim() || 'Move-in ready',
    image:
      String(payload.image ?? '').trim() ||
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    amenities: normalizeList(payload.amenities),
    rules: normalizeList(payload.rules),
    transit: normalizeList(payload.transit),
    nearbyPlaces: Array.isArray(payload.nearbyPlaces)
      ? payload.nearbyPlaces
          .map((place) => ({
            name: String(place.name ?? '').trim(),
            category: String(place.category ?? '').trim(),
            distanceKm: Number(place.distanceKm ?? 0),
            walkMinutes: Number(place.walkMinutes ?? 0),
            highlight: String(place.highlight ?? '').trim(),
          }))
          .filter((place) => place.name && place.category)
      : [],
    featured: Boolean(payload.featured),
  };
}
