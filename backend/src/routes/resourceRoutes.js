import express from 'express';
import {
    getResources,
    getResourceBySlug,
    completeResource,
    getFeaturedResources,
    getCompletedResources,
    uploadResource,
    getMentorResources,
    adminGetAllResources,
    approveResource,
    rejectResource,
    toggleFeatured,
    toggleResourceBookmark,
    getResourceBookmarks
} from '../controllers/resourceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ─── USER ROUTES ──────────────────────────────────────────
router.get('/', protect, getResources);
router.get('/featured', protect, getFeaturedResources);
router.get('/user/completed', protect, getCompletedResources);
router.get('/user/bookmarks', protect, getResourceBookmarks);
router.get('/:slug', protect, getResourceBySlug);
router.post('/:id/complete', protect, completeResource);
router.post('/:id/bookmark', protect, toggleResourceBookmark);

// ─── MENTOR ROUTES ────────────────────────────────────────
router.post('/upload', protect, uploadResource);
router.get('/mentor/my-resources', protect, getMentorResources);

// ─── ADMIN ROUTES ─────────────────────────────────────────
router.get('/admin/all', protect, adminGetAllResources);
router.put('/admin/:id/approve', protect, approveResource);
router.put('/admin/:id/reject', protect, rejectResource);
router.put('/admin/:id/feature', protect, toggleFeatured);

export default router;