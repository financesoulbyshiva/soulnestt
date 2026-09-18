import { Router } from 'express';
import { authenticate, requireOwner } from '../middleware/auth.js';
import {
  getProfile, updateProfile, getProperties, createProperty, getProperty,
  updateProperty, deleteProperty, publishProperty, pauseProperty,
  getEnquiries, updateEnquiry,
} from '../controllers/owner.controller.js';

const router = Router();

router.use(authenticate, requireOwner);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/properties', getProperties);
router.post('/properties', createProperty);
router.get('/properties/:id', getProperty);
router.put('/properties/:id', updateProperty);
router.delete('/properties/:id', deleteProperty);
router.post('/properties/:id/publish', publishProperty);
router.post('/properties/:id/pause', pauseProperty);
router.get('/enquiries', getEnquiries);
router.put('/enquiries/:id', updateEnquiry);

export default router;
