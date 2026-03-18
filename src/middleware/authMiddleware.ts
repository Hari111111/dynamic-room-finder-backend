import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserModel } from '../models/User';
import type { TokenPayload } from '../utils/token';

async function attachCurrentUser(req: Request, token: string) {
  const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
  const user = await UserModel.findById(payload.id).lean();

  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    role: user.role,
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber ?? '',
    savedRoomIds: Array.isArray(user.savedRooms)
      ? user.savedRooms.map((roomId) => roomId.toString())
      : [],
    approvalStatus: user.approvalStatus ?? 'approved',
  };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const user = await attachCurrentUser(req, token);

    if (!user) {
      return res.status(401).json({ message: 'Account no longer exists.' });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  if (req.user.approvalStatus !== 'approved') {
    return res.status(403).json({ message: 'Your admin access is pending superadmin approval.' });
  }

  return next();
}

export function requireSuperadmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Superadmin access required.' });
  }

  return next();
}
