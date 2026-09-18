import { Router } from 'express';
import { authenticate, requireTenant } from '../middleware/auth.js';
import {
  getProfile, updateProfile, getPreferences, updatePreferences,
  getSaved, saveProperty, unsaveProperty, getEnquiries, createEnquiry,
} from '../controllers/tenant.controller.js';

const router = Router();

router.use(authenticate, requireTenant);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.get('/saved', getSaved);
router.post('/saved/:propertyId', saveProperty);
router.delete('/saved/:propertyId', unsaveProperty);
router.get('/enquiries', getEnquiries);
router.post('/enquiries', createEnquiry);

export default router;
