import 'dotenv/config';
import express from 'express';
import prisma from './lib/prisma.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
