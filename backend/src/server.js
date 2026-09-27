import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import prisma from './lib/prisma.js';
import authRoutes from './modules/auth/auth.routes.js';
import categorieRoutes from './modules/categories/categorie.routes.js';
import activityRoutes from './modules/activities/activity.routes.js';
import noteRoutes from './modules/notes/note.routes.js';
import reviewRoutes from './modules/reviews/review.routes.js';
import './queues/whatsapp.queue.js';

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/categories', categorieRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'UpLife backend is running',
    status: 'ok',
  });
});

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: 'connected',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: error.message,
    });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: 'Unable to fetch users',
      error: error.message,
    });
  }
});

app.post('/users', async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({
      message: 'Unable to create user',
      error: error.message,
    });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      message: 'Invalid JSON body. Use valid JSON with double quotes around keys and string values.',
    });
  }

  return next(error);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
