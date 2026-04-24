import express from 'express';
import {
    // User side
    getMentors,
    getMentorBySlug,
    connectMentor,
    requestSession,
    bookSlot,
    getUserSessions,
    getConnectedMentors,

    // Mentor side
    submitMentorOnboarding,
    getMentorSessions,
    respondToSession,
    addAvailabilitySlot,
    getMentorSlots,
    deleteSlot,
    completeSession,
    getMentorStats
} from '../controllers/mentorController.js';

import { protect } from '../middleware/auth.js';

const router = express.Router();

// ─── USER SIDE ROUTES ─────────────────────────────────────
router.get('/', protect, getMentors);
router.get('/connected', protect, getConnectedMentors);
router.get('/sessions/my', protect, getUserSessions);
router.get('/:mentorSlug', protect, getMentorBySlug);
router.post('/:mentorId/connect', protect, connectMentor);
router.post('/:mentorId/sessions/request', protect, requestSession);
router.post('/slots/:slotId/book', protect, bookSlot);

// ─── MENTOR SIDE ROUTES ───────────────────────────────────
router.post('/onboarding', protect, submitMentorOnboarding);
router.get('/dashboard/stats', protect, getMentorStats);
router.get('/dashboard/sessions', protect, getMentorSessions);
router.put('/sessions/:sessionId/respond', protect, respondToSession);
router.put('/sessions/:sessionId/complete', protect, completeSession);
router.post('/slots', protect, addAvailabilitySlot);
router.get('/slots', protect, getMentorSlots);
router.delete('/slots/:slotId', protect, deleteSlot);

export default router;