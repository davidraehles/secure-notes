/**
 * Main server file
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';
import * as logger from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Require ALLOWED_ORIGINS in production
if (!process.env.ALLOWED_ORIGINS && (!process.env.NODE_ENV || process.env.NODE_ENV === 'production')) {
  throw new Error('ALLOWED_ORIGINS environment variable is required in production');
}

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(origin => origin.length > 0)
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
