import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getDashboard, getUsers, getProperties, getEnquiries, getReports,
  getVerifications, updateVerification, updateReport,
} from '../controllers/admin.controller.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/properties', getProperties);
router.get('/enquiries', getEnquiries);
router.get('/reports', getReports);
router.get('/verifications', getVerifications);
router.put('/verifications/:id', updateVerification);
router.put('/reports/:id', updateReport);

export default router;
