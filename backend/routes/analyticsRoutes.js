import express from 'express';
import { getOrganizerAnalytics } from '../controllers/analyticsController.js';
import { protect, organizer } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, organizer, getOrganizerAnalytics);

export default router;
