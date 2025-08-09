import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import messageRoutes from './routes/messages';
import { initDb } from './config/db';
import { startScheduler } from './scheduler';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';

async function startServer() {
  await initDb();
  const app = express();

  app.use(cors({
    origin: FRONTEND,
    methods: ['GET','POST','PUT','DELETE','OPTIONS']
  }));
  app.use(express.json());

  app.use(authRoutes);
  app.use(messageRoutes);

  // Health
  app.get('/health', (req, res) => res.json({ ok: true }));

  // start scheduler
  startScheduler();

  app.listen(PORT, () => {
    console.log(`Backend listening on ${PORT}`);
    console.log(`OAuth redirect should be ${process.env.SLACK_REDIRECT_URI}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start', err);
  process.exit(1);
});
