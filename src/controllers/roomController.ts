import { Request, Response } from 'express';
import { RoomModel } from '../models/Room';
import { normalizeRoomPayload } from '../utils/roomPayload';

function buildSummary(rooms: Array<{ city: string; price: number; rating: number; featured: boolean }>) {
  const cities = new Set(rooms.map((room) => room.city));
  const avgPrice = rooms.length
    ? Math.round(rooms.reduce((sum, room) => sum + room.price, 0) / rooms.length)
    : 0;
  const avgRating = rooms.length
    ? Number((rooms.reduce((sum, room) => sum + room.rating, 0) / rooms.length).toFixed(1))
    : 0;

  return {
    totalRooms: rooms.length,
    featuredRooms: rooms.filter((room) => room.featured).length,
    cities: [...cities],
    avgPrice,
    avgRating,
  };
}

export async function listRooms(req: Request, res: Response) {
  const { city, roomType, maxPrice, search, featured, occupancy } = req.query as Record<
    string,
    string | undefined
  >;

  const query: Record<string, unknown> = {};

  if (city) query.city = new RegExp(`^${city}$`, 'i');
  if (roomType) query.roomType = new RegExp(`^${roomType}$`, 'i');
  if (occupancy) query.occupancy = new RegExp(`^${occupancy}$`, 'i');
  if (maxPrice) query.price = { $lte: Number(maxPrice) };
  if (featured === 'true') query.featured = true;
  if (search) {
    query.$or = [
      { title: new RegExp(search, 'i') },
      { city: new RegExp(search, 'i') },
      { locality: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { amenities: { $regex: new RegExp(search, 'i') } },
    ];
  }

  const [rooms, allRooms] = await Promise.all([
    RoomModel.find(query).sort({ featured: -1, price: 1 }).lean(),
    RoomModel.find().lean(),
  ]);

  return res.json({
    rooms,
    summary: buildSummary(allRooms),
    filters: {
      cities: [...new Set(allRooms.map((room) => room.city))],
      roomTypes: [...new Set(allRooms.map((room) => room.roomType))],
      occupancy: [...new Set(allRooms.map((room) => room.occupancy))],
    },
  });
}

export async function getRoomById(req: Request, res: Response) {
  const room = await RoomModel.findById(req.params.id).lean();

  if (!room) {
    return res.status(404).json({ message: 'Room not found.' });
  }

  return res.json(room);
}

export async function createRoom(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const payload = normalizeRoomPayload(req.body);
    const room = await RoomModel.create({
      ...payload,
      ownerId: req.user.id,
      ownerName: req.user.name,
    });
    return res.status(201).json(room);
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : 'Unable to create room.',
    });
  }
}

export async function updateRoom(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const payload = normalizeRoomPayload(req.body);
    const room = await RoomModel.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found.' });
    }

    const isOwner = room.ownerId?.toString() === req.user.id;

    if (req.user.role !== 'superadmin' && !isOwner) {
      return res.status(403).json({ message: 'You can only update rooms created by you.' });
    }

    room.set({
      ...payload,
      ownerId: room.ownerId || req.user.id,
      ownerName: room.ownerName || req.user.name,
    });

    await room.save();

    return res.json(room);
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : 'Unable to update room.',
    });
  }
}

export async function deleteRoom(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const room = await RoomModel.findById(req.params.id);

  if (!room) {
    return res.status(404).json({ message: 'Room not found.' });
  }

  const isOwner = room.ownerId?.toString() === req.user.id;

  if (req.user.role !== 'superadmin' && !isOwner) {
    return res.status(403).json({ message: 'You can only delete rooms created by you.' });
  }

  await room.deleteOne();

  return res.status(204).send();
}
