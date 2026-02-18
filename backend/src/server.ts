/**
 * Main server file
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// 🛡️ Sentinel: Ensure ALLOWED_ORIGINS is set in production
if (!process.env.ALLOWED_ORIGINS && (!process.env.NODE_ENV || process.env.NODE_ENV === 'production')) {
  throw new Error('ALLOWED_ORIGINS environment variable is required in production');
}

// 🛡️ Sentinel: Restrict CORS to specific origins for better security
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
    : ['http://localhost:5173', 'http://localhost:3000'],
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
  console.log(`Server running on port ${PORT}`);
});

