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
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// ─── PUBLIC / USER ROUTES ─────────────────────────────────
// Static routes FIRST
router.get('/featured', protect, getFeaturedResources);
router.get('/user/completed', protect, getCompletedResources);
router.get('/user/bookmarks', protect, getResourceBookmarks);

// ─── MENTOR ROUTES ────────────────────────────────────────
router.post('/upload', protect, restrictTo('mentor', 'admin'), uploadResource);
router.get('/mentor/my-resources', protect, restrictTo('mentor'), getMentorResources);

// ─── ADMIN ROUTES ─────────────────────────────────────────
router.get('/admin/all', protect, restrictTo('admin'), adminGetAllResources);
router.put('/admin/:id/approve', protect, restrictTo('admin'), approveResource);
router.put('/admin/:id/reject', protect, restrictTo('admin'), rejectResource);
router.put('/admin/:id/feature', protect, restrictTo('admin'), toggleFeatured);

// ─── GENERAL ROUTES ───────────────────────────────────────
router.get('/', protect, getResources);
router.get('/:slug', protect, getResourceBySlug);
router.post('/:id/complete', protect, completeResource);
router.post('/:id/bookmark', protect, toggleResourceBookmark);

export default router;