import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'room-finder-dev-secret',
  adminInviteCode: process.env.ADMIN_INVITE_CODE || '',
  clientOrigins: process.env.CLIENT_ORIGINS || 'http://localhost:3000,http://localhost:5173',
};

export const allowedOrigins = env.clientOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export function isAllowedOrigin(origin: string | undefined) {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const url = new URL(origin);
    const isLocalHost = ['localhost', '127.0.0.1'].includes(url.hostname);

    if (isLocalHost) {
      return true;
    }
  } catch (_error) {
    return false;
  }

  return false;
}
