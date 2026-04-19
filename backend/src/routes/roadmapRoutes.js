import express from 'express';
import {
    getRoadmapByBusiness,
    startRoadmap,
    completeTask,
    addNote,
    getUserRoadmaps
} from '../controllers/roadmapController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/:businessSlug', getRoadmapByBusiness);

// Protected routes
router.get('/user/active', protect, getUserRoadmaps);
router.post('/:roadmapId/start', protect, startRoadmap);
router.post('/:roadmapId/task/:taskId/complete', protect, completeTask);
router.post('/:roadmapId/stage/:stageNumber/note', protect, addNote);

export default router;