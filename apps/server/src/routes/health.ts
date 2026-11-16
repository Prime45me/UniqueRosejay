import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'uniquerosejay-server',
    timestamp: new Date().toISOString()
  });
});
