import { Router } from 'express';
import { login, getMe, getBrokers } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { loginSchema } from '../validators';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', authLimiter, validateBody(loginSchema), login);
router.get('/me', authenticate, getMe);
router.get('/brokers', authenticate, getBrokers);

export default router;
