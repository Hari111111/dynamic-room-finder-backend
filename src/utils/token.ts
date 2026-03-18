import jwt from 'jsonwebtoken';
import { env } from '../config/env';

type TokenPayload = {
  id: string;
  role: 'user' | 'admin' | 'superadmin';
  name: string;
  email: string;
};

export function generateToken(payload: TokenPayload) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: '7d',
  });
}

export type { TokenPayload };
