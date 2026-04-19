import express from 'express';
import { getProgress, updateStats, completeTask } from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getProgress);
router.put('/stats', protect, updateStats);
router.put('/task/:taskId', protect, completeTask);

export default router;