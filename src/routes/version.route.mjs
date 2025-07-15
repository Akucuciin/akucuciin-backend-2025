import { Router } from 'express';
import useRateLimiter from '../configs/rateLimiter.config.mjs';

const VersionRouter = Router();

VersionRouter.get('/api/version', useRateLimiter(5, 1), (req, res) => {
  res.json({
    version: '15.07.2025.12-16',
    status: 'stable[main-bump-packages]',
  });
});

export default VersionRouter;
