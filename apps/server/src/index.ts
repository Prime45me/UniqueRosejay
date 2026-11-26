import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './lib/http.js';
import { healthRouter } from './routes/health.js';
import { storeRouter } from './store/routes.js';

const app = express();

// The Next.js server proxies browser requests and forwards the visitor's address in
// X-Forwarded-For. Trust that header only from a loopback proxy, so rate limits apply per visitor.
app.set('trust proxy', 'loopback');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

app.disable('x-powered-by');
app.use(helmet());
// Only configured origins may send credentialed requests (cookies). Requests without an Origin
// header (server-to-server, curl, Next.js server components) are allowed.
app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || env.corsOrigins.includes(origin));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
// The Store has its own per-route limits (browse / cart / order); everything else keeps the default.
app.use('/api', (req, res, next) => (req.path.startsWith('/store/') ? next() : apiLimiter(req, res, next)));
app.use('/api', healthRouter);
app.use('/api/store', storeRouter);

app.get('/', (_req, res) => {
  res.json({
    name: 'UniqueRosejay API',
    status: 'running',
    version: '0.1.0'
  });
});

app.use('/api', notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`UniqueRosejay server running on http://localhost:${env.PORT}`);
});
