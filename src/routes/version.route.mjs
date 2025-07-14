import { Router } from 'express';
import useRateLimiter from '../configs/rateLimiter.config.mjs';

const VersionRouter = Router();

VersionRouter.get('/api/version', useRateLimiter(5, 1), (req, res) => {
  res.json({
    version: '14.07.2025.16-35',
    status: 'stable',
  });
});

export default VersionRouter;
