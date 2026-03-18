import { Request, Response } from 'express';
import { RoomModel } from '../models/Room';
import { UserModel } from '../models/User';

export async function getAdminSummary(_req: Request, res: Response) {
  const [rooms, users] = await Promise.all([
    RoomModel.find().lean(),
    UserModel.find().lean(),
  ]);

  const avgPrice = rooms.length
    ? Math.round(rooms.reduce((sum, room) => sum + room.price, 0) / rooms.length)
    : 0;

  return res.json({
    summary: {
      totalRooms: await RoomModel.countDocuments(),
      featuredRooms: await RoomModel.countDocuments({ featured: true }),
      avgPrice,
      totalUsers: users.length,
      admins: users.filter((user) => user.role === 'admin').length,
      cities: [...new Set(rooms.map((room) => room.city))],
    },
    latestRooms: rooms
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5),
  });
}
