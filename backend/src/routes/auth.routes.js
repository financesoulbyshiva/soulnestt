import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  registerTenant, registerOwner, login, loginAdmin, me, logout,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/register/tenant', registerTenant);
router.post('/register/owner', registerOwner);
router.post('/login', login);
router.post('/login/admin', loginAdmin);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

export default router;
