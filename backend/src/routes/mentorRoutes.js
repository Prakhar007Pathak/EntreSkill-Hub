import express from 'express';
import {
    getMentors,
    getMentorBySlug,
    connectMentor,
    requestSession,
    bookSlot,
    getUserSessions,
    getConnectedMentors,
    addQuestionToSession,
    submitMentorOnboarding,
    getMentorSessions,
    respondToSession,
    addAvailabilitySlot,
    getMentorSlots,
    deleteSlot,
    completeSession,
    getMentorStats,
    answerQuestionInSession
} from '../controllers/mentorController.js';

import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════
// ─── USER SIDE ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

router.get('/', protect, getMentors);
router.get('/connected', protect, getConnectedMentors);

// ✅ FIXED: /sessions/my MUST come before /sessions/:sessionId
router.get('/sessions/my', protect, getUserSessions);
router.get('/sessions/:sessionId', protect, getUserSessions);

// ─── Q&A (User adds question) ──────────────────────────────
router.post('/sessions/:sessionId/question', protect, addQuestionToSession);

// ─── Booking ───────────────────────────────────────────────
router.post('/slots/:slotId/book', protect, bookSlot);
router.post('/:mentorId/connect', protect, connectMentor);
router.post('/:mentorId/sessions/request', protect, requestSession);

// ═══════════════════════════════════════════════════════════
// ─── MENTOR SIDE ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

router.post('/onboarding', protect, restrictTo('mentor'), submitMentorOnboarding);
router.get('/dashboard/stats', protect, restrictTo('mentor'), getMentorStats);

// ✅ FIXED: /dashboard/sessions MUST come before /dashboard/sessions/:sessionId
router.get('/dashboard/sessions', protect, restrictTo('mentor'), getMentorSessions);
router.get('/dashboard/sessions/:sessionId', protect, restrictTo('mentor'), getMentorSessions);

// ─── Slots ─────────────────────────────────────────────────
router.get('/slots', protect, restrictTo('mentor'), getMentorSlots);
router.post('/slots', protect, restrictTo('mentor'), addAvailabilitySlot);
router.delete('/slots/:slotId', protect, restrictTo('mentor'), deleteSlot);

// ─── Session Actions ───────────────────────────────────────
router.put('/sessions/:sessionId/respond', protect, restrictTo('mentor'), respondToSession);
router.put('/sessions/:sessionId/complete', protect, restrictTo('mentor'), completeSession);

// ─── Q&A (Mentor answers question) ────────────────────────
router.put(
    '/sessions/:sessionId/question/:questionIndex/answer',
    protect,
    restrictTo('mentor'),
    answerQuestionInSession
);

// ═══════════════════════════════════════════════════════════
// ─── DYNAMIC SLUG — ALWAYS LAST ───────────────────────────
// ═══════════════════════════════════════════════════════════

router.get('/:mentorSlug', protect, getMentorBySlug);

export default router;