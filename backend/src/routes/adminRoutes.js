import express from 'express';
import {
    getAdminStats,
    getAllUsers,
    toggleUserStatus,
    getAllMentors,
    approveMentor,
    rejectMentor,
    getMentorDetail,
    toggleMentorStatus, // ✅ ADD THIS IMPORT
    getAdminResources,
    adminApproveResource,
    adminRejectResource,
    adminToggleFeatured,
    adminDeleteResource,
    getAdminBusinesses,
    toggleBusinessStatus,
    adminLogin
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// ─── PUBLIC ───────────────────────────────────────────────
router.post('/login', adminLogin);

// ─── PROTECTED ADMIN ROUTES ───────────────────────────────
router.get('/stats', protect, restrictTo('admin'), getAdminStats);

// Users
router.get('/users', protect, restrictTo('admin'), getAllUsers);
router.put('/users/:userId/toggle-status', protect, restrictTo('admin'), toggleUserStatus);

// Mentors
router.get('/mentors', protect, restrictTo('admin'), getAllMentors);
router.get('/mentors/:mentorId', protect, restrictTo('admin'), getMentorDetail);
router.put('/mentors/:mentorId/approve', protect, restrictTo('admin'), approveMentor);
router.put('/mentors/:mentorId/reject', protect, restrictTo('admin'), rejectMentor);
router.put('/mentors/:mentorId/toggle-status', protect, restrictTo('admin'), toggleMentorStatus); // ✅ ALREADY ADDED

// Resources
router.get('/resources', protect, restrictTo('admin'), getAdminResources);
router.put('/resources/:id/approve', protect, restrictTo('admin'), adminApproveResource);
router.put('/resources/:id/reject', protect, restrictTo('admin'), adminRejectResource);
router.put('/resources/:id/feature', protect, restrictTo('admin'), adminToggleFeatured);
router.delete('/resources/:id', protect, restrictTo('admin'), adminDeleteResource);

// Businesses
router.get('/businesses', protect, restrictTo('admin'), getAdminBusinesses);
router.put('/businesses/:id/toggle', protect, restrictTo('admin'), toggleBusinessStatus);

export default router;