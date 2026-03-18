import cors from 'cors';
import express from 'express';
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import roomRoutes from './routes/roomRoutes';
import { isAllowedOrigin } from './config/env';

export const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS.'));
    },
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.json({
    message: 'Room Finder API is running.',
    endpoints: ['/api/auth', '/api/rooms', '/api/admin'],
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    updatedAt: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/admin', adminRoutes);
