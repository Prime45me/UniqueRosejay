import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { healthRouter } from './routes/health.js';

const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', apiLimiter);
app.use('/api', healthRouter);

app.get('/', (_req, res) => {
  res.json({
    name: 'UniqueRosejay API',
    status: 'running',
    version: '0.1.0'
  });
});

app.listen(env.PORT, () => {
  console.log(`UniqueRosejay server running on http://localhost:${env.PORT}`);
});
