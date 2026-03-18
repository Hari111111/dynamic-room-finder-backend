import { Request, Response } from 'express';
import { RoomModel } from '../models/Room';
import { UserModel } from '../models/User';

function buildSummary(rooms: Array<{ city: string; price: number; featured: boolean }>, totalMembers: number, pendingApprovals: number) {
  const avgPrice = rooms.length
    ? Math.round(rooms.reduce((sum, room) => sum + room.price, 0) / rooms.length)
    : 0;

  return {
    totalRooms: rooms.length,
    featuredRooms: rooms.filter((room) => room.featured).length,
    avgPrice,
    totalMembers,
    pendingApprovals,
    cities: [...new Set(rooms.map((room) => room.city))],
  };
}

export async function getAdminDashboard(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const roomQuery = req.user.role === 'superadmin' ? {} : { ownerId: req.user.id };
  const memberQuery =
    req.user.role === 'superadmin'
      ? { role: { $in: ['admin', 'superadmin'] } }
      : { _id: req.user.id };

  const [rooms, members] = await Promise.all([
    RoomModel.find(roomQuery).sort({ updatedAt: -1 }).lean(),
    UserModel.find(memberQuery).select('-password').sort({ createdAt: -1 }).lean(),
  ]);

  const mappedMembers = members.map((member) => ({
    id: member._id.toString(),
    name: member.name,
    email: member.email,
    mobileNumber: member.mobileNumber ?? '',
    role: member.role,
    approvalStatus: member.approvalStatus ?? 'approved',
    approvedBy: member.approvedBy?.toString() ?? null,
    createdAt: member.createdAt,
  }));

  return res.json({
    summary: buildSummary(
      rooms,
      mappedMembers.filter((member) => member.role !== 'user').length,
      mappedMembers.filter((member) => member.role === 'admin' && member.approvalStatus === 'pending').length,
    ),
    rooms,
    members: mappedMembers,
  });
}

export async function updateAdminApproval(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const status = req.body.status === 'rejected' ? 'rejected' : req.body.status === 'approved' ? 'approved' : null;

  if (!status) {
    return res.status(400).json({ message: 'A valid approval status is required.' });
  }

  const member = await UserModel.findById(req.params.id);

  if (!member) {
    return res.status(404).json({ message: 'Admin account not found.' });
  }

  if (member.role !== 'admin') {
    return res.status(400).json({ message: 'Only admin registrations can be approved or rejected.' });
  }

  member.approvalStatus = status;
  member.set('approvedBy', req.user.id);
  await member.save();

  return res.json({
    message: status === 'approved' ? 'Admin approved successfully.' : 'Admin request rejected.',
    user: {
      id: member._id.toString(),
      name: member.name,
      email: member.email,
      mobileNumber: member.mobileNumber ?? '',
      role: member.role,
      approvalStatus: member.approvalStatus,
      approvedBy: member.approvedBy ? String(member.approvedBy) : null,
      createdAt: member.createdAt,
    },
  });
}
