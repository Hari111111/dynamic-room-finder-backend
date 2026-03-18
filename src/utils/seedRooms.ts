import { promises as fs } from 'fs';
import path from 'path';
import { RoomModel } from '../models/Room';

type SeedRoom = {
  title: string;
  city: string;
  locality: string;
  address: string;
  price: number;
  deposit: number;
  rating: number;
  reviewCount: number;
  occupancy: 'Single' | 'Double' | 'Shared';
  roomType: 'Private Room' | 'Studio' | 'PG' | 'Coliving';
  gender: 'Any' | 'Boys' | 'Girls';
  availableFrom: string;
  seatsLeft: number;
  description: string;
  heroTag: string;
  image: string;
  amenities: string[];
  rules: string[];
  transit: string[];
  nearbyPlaces: Array<{
    name: string;
    category: string;
    distanceKm: number;
    walkMinutes: number;
    highlight: string;
  }>;
  featured: boolean;
};

export async function seedRoomsIfNeeded() {
  const roomCount = await RoomModel.countDocuments();
  if (roomCount > 0) {
    return;
  }

  const filePath = path.resolve(__dirname, '../../data/rooms.json');
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as { rooms?: SeedRoom[] };
  const rooms = parsed.rooms ?? [];

  if (!rooms.length) {
    return;
  }

  await RoomModel.insertMany(rooms);
}
