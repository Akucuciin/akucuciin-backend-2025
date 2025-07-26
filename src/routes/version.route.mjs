import { Router } from 'express';
import useRateLimiter from '../configs/rateLimiter.config.mjs';

const VersionRouter = Router();

VersionRouter.get('/api/version', useRateLimiter(5, 1), (req, res) => {
  res.json({
    version: '26.07.2025.21-24',
    status: 'stable[main] - gacha voucher event active',
  });
});

export default VersionRouter;
