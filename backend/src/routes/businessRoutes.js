import express from 'express';
import {
    getBusinesses,
    getRecommendations,
    getBusinessBySlug,
    toggleBookmark,
    getBookmarks
} from '../controllers/businessController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getBusinesses);
router.get('/:slug', getBusinessBySlug);

// Protected routes
router.get('/user/recommendations', protect, getRecommendations);
router.get('/user/bookmarks', protect, getBookmarks);
router.post('/:id/bookmark', protect, toggleBookmark);

export default router;