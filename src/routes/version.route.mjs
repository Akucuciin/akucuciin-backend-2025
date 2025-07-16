import { Router } from 'express';
import useRateLimiter from '../configs/rateLimiter.config.mjs';

const VersionRouter = Router();

VersionRouter.get('/api/version', useRateLimiter(5, 1), (req, res) => {
  res.json({
    version: '16.07.2025.23-09',
    status: 'stable[main-bump-packages]',
  });
});

export default VersionRouter;
