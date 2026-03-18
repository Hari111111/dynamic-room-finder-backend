import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { generateToken } from '../utils/token';

function userResponse(user: {
  _id: { toString(): string };
  name: string;
  email: string;
  mobileNumber?: string;
  role: 'user' | 'admin' | 'superadmin';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber ?? '',
    role: user.role,
    approvalStatus: user.approvalStatus ?? 'approved',
  };
}

export async function signup(req: Request, res: Response) {
  try {
    const name = String(req.body.name ?? '').trim();
    const email = String(req.body.email ?? '').trim().toLowerCase();
    const mobileNumber = String(req.body.mobileNumber ?? '').trim();
    const password = String(req.body.password ?? '').trim();
    const requestedRole = req.body.role === 'admin' ? 'admin' : 'user';

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    let role: 'user' | 'admin' | 'superadmin' = requestedRole;
    let approvalStatus: 'pending' | 'approved' | 'rejected' = 'approved';

    if (requestedRole === 'admin') {
      if (!mobileNumber) {
        return res.status(400).json({ message: 'Mobile number is required for admin registration.' });
      }

      const superadminCount = await UserModel.countDocuments({ role: 'superadmin' });

      if (superadminCount === 0) {
        return res.status(403).json({
          message: 'Create the first superadmin directly in the database before accepting admin registrations.',
        });
      }

      role = 'admin';
      approvalStatus = 'pending';
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      name,
      email,
      mobileNumber,
      password: hashedPassword,
      role,
      approvalStatus,
    });

    const payload = userResponse(user);

    if (payload.role === 'admin' && payload.approvalStatus === 'pending') {
      return res.status(201).json({
        message: 'Registration submitted. A superadmin must approve your admin access.',
        user: payload,
      });
    }

    return res.status(201).json({
      token: generateToken(payload),
      user: payload,
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : 'Unable to create account.',
    });
  }
}

export async function login(req: Request, res: Response) {
  const email = String(req.body.email ?? '').trim().toLowerCase();
  const password = String(req.body.password ?? '').trim();

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const payload = userResponse(user);

  return res.json({
    token: generateToken(payload),
    user: payload,
  });
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  return res.json({
    user: req.user,
  });
}
