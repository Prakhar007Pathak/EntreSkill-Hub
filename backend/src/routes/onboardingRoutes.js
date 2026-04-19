import express from 'express';
import { submitOnboarding, getOnboardingStatus } from '../controllers/onboardingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, submitOnboarding);
router.get('/status', protect, getOnboardingStatus);

export default router;