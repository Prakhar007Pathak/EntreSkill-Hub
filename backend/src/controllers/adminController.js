import User from '../models/User.js';
import Resource from '../models/Resource.js';
import Business from '../models/Business.js';
import MentorSession from '../models/MentorSession.js';
import MentorConnection from '../models/MentorConnection.js';
import Progress from '../models/Progress.js';
import Notification from '../models/Notification.js';
import { generateToken } from '../utils/jwt.js';

// ─── Helper: Check Admin ──────────────────────────────────
const checkAdmin = (user, res) => {
    if (user.role !== 'admin') {
        res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
        return false;
    }
    return true;
};

// ═══════════════════════════════════════════════════════════
// ─── DASHBOARD STATS ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
export const getAdminStats = async (req, res) => {
    try {
        if (!checkAdmin(req.user, res)) return;

        const [
            totalUsers,
            totalMentors,
            pendingMentors,
            approvedMentors,
            rejectedMentors,
            totalResources,
            pendingResources,
            approvedResources,
            totalBusinesses,
            totalSessions,
            completedSessions
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'mentor' }),
            User.countDocuments({
                role: 'mentor',
                mentorOnboardingCompleted: true,
                mentorVerificationStatus: 'pending'
            }),
            User.countDocuments({
                role: 'mentor',
                mentorVerificationStatus: 'approved'
            }),
            User.countDocuments({
                role: 'mentor',
                mentorVerificationStatus: 'rejected'
            }),
            Resource.countDocuments(),
            Resource.countDocuments({ status: 'pending' }),
            Resource.countDocuments({ status: 'approved' }),
            Business.countDocuments(),
            MentorSession.countDocuments(),
            MentorSession.countDocuments({ status: 'completed' })
        ]);

        // Recent signups (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentSignups = await User.countDocuments({
            createdAt: { $gte: sevenDaysAgo },
            role: 'user'
        });

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    users: {
                        total: totalUsers,
                        recentSignups
                    },
                    mentors: {
                        total: totalMentors,
                        pending: pendingMentors,
                        approved: approvedMentors,
                        rejected: rejectedMentors
                    },
                    resources: {
                        total: totalResources,
                        pending: pendingResources,
                        approved: approvedResources
                    },
                    businesses: {
                        total: totalBusinesses
                    },
                    sessions: {
                        total: totalSessions,
                        completed: completedSessions
                    }
                }
            }
        });
    } catch (error) {
        console.error('Admin Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stats'
        });
    }
};

// ═══════════════════════════════════════════════════════════
// ─── USER MANAGEMENT ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
    try {
        if (!checkAdmin(req.user, res)) return;

        const {
            search, role, page = 1, limit = 20
        } = req.query;

        let query = { role: { $ne: 'admin' } };
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password -mentorProfile -onboardingData')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    page: Number(page),
                    pages: Math.ceil(total / Number(limit)),
                    limit: Number(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:userId/toggle-status
// @access  Private (Admin)
export const toggleUserStatus = async (req, res) => {
    try {
        if (!checkAdmin(req.user, res)) return;

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot modify admin accounts'
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            data: { isActive: user.isActive }
        });
    } catch (error) {
        console.error('Toggle User Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user status'
        });
    }
};

// ═══════════════════════════════════════════════════════════
// ─── MENTOR MANAGEMENT ───────────────────────────────────
// ═══════════════════════════════════════════════════════════

// @desc    Get all mentors with filters
// @route   GET /api/admin/mentors
// @access  Private (Admin)
export const getAllMentors = async (req, res) => {
    try {
        if (!checkAdmin(req.user, res)) return;

        const {
            status,
            search,
            page = 1,
            limit = 20
        } = req.query;

        let query = { role: 'mentor' };
        if (status) query.mentorVerificationStatus = status;
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { 'mentorProfile.headline': { $regex: search, $options: 'i' } }
            ];
        }

        const mentors = await User.find(query)
            .select('-password -onboardingData')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await User.countDocuments(query);

        // Count by status
        const pendingCount = await User.countDocuments({
            role: 'mentor',
            mentorOnboardingCompleted: true,
            mentorVerificationStatus: 'pending'
        });
        const approvedCount = await User.countDocuments({
            role: 'mentor',
            mentorVerificationStatus: 'approved'
        });
        const rejectedCount = await User.countDocuments({
            role: 'mentor',
            mentorVerificationStatus: 'rejected'
        });

        res.status(200).json({
            success: true,
            data: {
                mentors,
                counts: {
                    pending: pendingCount,
                    approved: approvedCount,
                    rejected: rejectedCount
                },
                pagination: {
                    total,
                    page: Number(page),
                    pages: Math.ceil(total / Number(limit)),
                    limit: Number(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get All Mentors Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching mentors'
        });
    }
};

// @desc    Approve a mentor
// @route   PUT /api/admin/mentors/:mentorId/approve
// @access  Private (Admin)
export const approveMentor = async (req, res) => {
    try {
        if (!checkAdmin(req.user, res)) return;

        const mentor = await User.findOne({
            _id: req.params.mentorId,
            role: 'mentor'
        });

        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor not found'
            });
        }

        mentor.mentorVerificationStatus = 'approved';
        mentor.mentorRejectionReason = null;
        await mentor.save();

        // Notify mentor
        await Notification.createNotification(
            mentor._id,
            'mentor_approved',
            'Account Approved! 🎉',
            'Congratulations! Your mentor profile has been approved. You can now access your dashboard.',
            {
                icon: '🎉',
                link: '/mentor/dashboard'
            }
        );

        res.status(200).json({
            success: true,
            message: `${mentor.fullName}'s mentor account approved!`,
            data: { mentor }
        });
    } catch (error) {
        console.error('Approve Mentor Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving mentor'
        });
    }
};

// @desc    Reject a mentor
// @route   PUT /api/admin/mentors/:mentorId/reject
// @access  Private (Admin)
export const rejectMentor = async (req, res) => {
    try {
        if (!checkAdmin(req.user, res)) return;

        const { reason } = req.body;

        const mentor = await User.findOne({
            _id: req.params.mentorId,
            role: 'mentor'
        });

        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor not found'
            });
        }

        mentor.mentorVerificationStatus = 'rejected';
        mentor.mentorRejectionReason = reason || 'Profile does not meet our requirements';
        await mentor.save();

        // Notify mentor
        await Notification.createNotification(
            mentor._id,
            'mentor_rejected',
            'Verification Update',
            `Your mentor application was not approved. Reason: ${mentor.mentorRejectionReason}`,
            {
                icon: '❌',
                link: '/mentor/pending'
            }
        );

        res.status(200).json({
            success: true,
            message: `Mentor verification rejected`,
            data: { mentor }
        });
    } catch (error) {
        console.error('Reject Mentor Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting mentor'
        });
    }
};

// @desc    Get single mentor full profile for admin review
// @route   GET /api/admin/mentors/:mentorId
// @access  Private (Admin)
export const getMentorDetail = async (req, res) => {
    try {
        if (!checkAdmin(req.user, res)) return;

        const mentor = await User.findOne({
            _id: req.params.mentorId,
            role: 'mentor'
        }).select('-password');

        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor not found'
            });
        }

        // Get mentor's sessions count
        const sessionCount = await MentorSession.countDocuments({
            mentorId: mentor._id
        });
        const connectionCount = await MentorConnection.countDocuments({
            mentorId: mentor._id,
            status: 'connected'
        });

        res.status(200).json({
            success: true,
            data: {
                mentor,
                stats: {
                    sessions: sessionCount,
                    connections: connectionCount
                }
            }
        });
    } catch (error) {
        console.error('Get Mentor Detail Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching mentor details'
        });
    }
};


// @desc    Toggle mentor active status (deactivate/activate)
// @route   PUT /api/admin/mentors/:mentorId/toggle-status
// @access  Private (Admin)
export const toggleMentorStatus = async (req, res) => {
    try {
        if (!checkAdmin(req.user, res)) return;

        const mentor = await User.findOne({
            _id: req.params.mentorId,
            role: 'mentor'
        });

        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor not found'
            });
        }

        mentor.isActive = !mentor.isActive;
        await mentor.save();

        res.status(200).json({
            success: true,
            message: `Mentor ${mentor.isActive ? 'activated' : 'deactivated'} successfully`,
            data: { isActive: mentor.isActive }
        });
    } catch (error) {
        console.error('Toggle Mentor Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating mentor status'
        });
    }
};


// ═══════════════════════════════════════════════════════════
// ─── RESOURCE MANAGEMENT ─────────────────────────────────
// ═══════════════════════════════════════════════════════════

// @desc    Get all resources for admin
// @route   GET /api/admin/resources
// @access  Private (Admin)
export const getAdminResources = async (req, res) => {
    try {
        if (!checkAdmin(req.user, res)) return;

        const { status, type, page = 1, limit = 20 } = req.query;

        let query = {};
        if (status) query.status = status;
        if (type) query.type = type;

        const resources = await Resource.find(query)
            .populate('uploadedBy', 'fullName email profilePicture mentorSlug')
            .populate('approvedBy', 'fullName')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await Resource.countDocuments(query);
        const pendingCount = await Resource.countDocuments({ status: 'pending' });
        const approvedCount = await Resource.countDocuments({ status: 'approved' });
        const rejectedCount = await Resource.countDocuments({ status: 'rejected' });

        res.status(200).json({
            success: true,
            data: {
                resources,
                counts: {
                    total,
                    pending: pendingCount,
                    approved: approvedCount,
                    rejected: rejectedCount
                },
                pagination: {
                    total,
                    page: Number(page),
                    pages: Math.ceil(total / Number(limit)),
                    limit: Number(limit)
                }
            }
        });
    } catch (error) {
        console.error('Admin Get Resources Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching resources'
        });
    }
};

// @desc    Admin approve resource
// @route   PUT /api/admin/resources/:id/approve
// @access  Private (Admin)
export const adminApproveResource = async (req, res) => {
    try {
        if (!checkAdmin(req.user, res)) return;

        const resource = await Resource.findById(req.params.id)
            .populate('uploadedBy', 'fullName');

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        resource.status = 'approved';
        resource.approvedBy = req.user.id;
        resource.approvedAt = new Date();
        resource.rejectionReason = null;
        await resource.save();

        // Notify mentor if uploaded by a mentor
        if (resource.uploadedBy) {
            await Notification.createNotification(
                resource.uploadedBy._id,
                'resource_approved',
                'Resource Approved! ✅',
                `Your resource "${resource.title}" has been approved and is now live!`,
                {
                    icon: '✅',
                    link: `/resources/${resource.slug}`
                }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Resource approved!',
            data: { resource }
        });
    } catch (error) {
        console.error('Admin Approve Resource Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving resource'
        });
    }
};

// @desc    Admin reject resource
// @route   PUT /api/admin/resources/:id/reject
// @access  Private (Admin)
export const adminRejectResource = async (req, res) => {
    try {
        if (!checkAdmin(req.user, res)) return;

        const { reason } = req.body;
        const resource = await Resource.findById(req.params.id)
            .populate('uploadedBy', 'fullName');

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        resource.status = 'rejected';
        resource.rejectionReason = reason || 'Does not meet quality standards';
        resource.approvedBy = null;
        resource.approvedAt = null;
        await resource.save();

        // Notify mentor
        if (resource.uploadedBy) {
            await Notification.createNotification(
                resource.uploadedBy._id,
                'resource_rejected',
                'Resource Not Approved',
                `Your resource "${resource.title}" was not approved. Reason: ${resource.rejectionReason}`,
                {
                    icon: '❌'
                }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Resource rejected.',
            data: { resource }
        });
    } catch (error) {
        console.error('Admin Reject Resource Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting resource'
        });
    }
};

// @desc    Admin toggle resource featured
// @route   PUT /api/admin/resources/:id/feature
// @access  Private (Admin)
export const adminToggleFeatured = async (req, res) => {
    try {
        if (!checkAdmin(req.user, res)) return;

        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        resource.featured = !resource.featured;
        await resource.save();

        res.status(200).json({
            success: true,
            message: `Resource ${resource.featured ? 'featured' : 'unfeatured'}!`,
            data: { featured: resource.featured }
        });
    } catch (error) {
        console.error('Admin Toggle Featured Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating resource'
        });
    }
};

// @desc    Admin delete resource
// @route   DELETE /api/admin/resources/:id
// @access  Private (Admin)
export const adminDeleteResource = async (req, res) => {
    try {
        if (!checkAdmin(req.user, res)) return;

        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        await resource.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Resource deleted successfully'
        });
    } catch (error) {
        console.error('Admin Delete Resource Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting resource'
        });
    }
};

// ═══════════════════════════════════════════════════════════
// ─── BUSINESS MANAGEMENT ─────────────────────────────────
// ═══════════════════════════════════════════════════════════

// @desc    Get all businesses for admin
// @route   GET /api/admin/businesses
// @access  Private (Admin)
export const getAdminBusinesses = async (req, res) => {
    try {
        if (!checkAdmin(req.user, res)) return;

        const { search, isActive, page = 1, limit = 20 } = req.query;

        let query = {};
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        const businesses = await Business.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await Business.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                businesses,
                pagination: {
                    total,
                    page: Number(page),
                    pages: Math.ceil(total / Number(limit)),
                    limit: Number(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get Admin Businesses Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching businesses'
        });
    }
};

// @desc    Toggle business active status
// @route   PUT /api/admin/businesses/:id/toggle
// @access  Private (Admin)
export const toggleBusinessStatus = async (req, res) => {
    try {
        if (!checkAdmin(req.user, res)) return;

        const business = await Business.findById(req.params.id);
        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }

        business.isActive = !business.isActive;
        await business.save();

        res.status(200).json({
            success: true,
            message: `Business ${business.isActive ? 'activated' : 'deactivated'}`,
            data: { isActive: business.isActive }
        });
    } catch (error) {
        console.error('Toggle Business Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating business'
        });
    }
};

// ═══════════════════════════════════════════════════════════
// ─── ADMIN AUTH (Create admin via script or this route) ──
// ═══════════════════════════════════════════════════════════

// @desc    Admin login (same as user login but checks admin role)
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const user = await User.findOne({
            email,
            role: 'admin'
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        user.lastActive = Date.now();
        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Admin login successful',
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        console.error('Admin Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in'
        });
    }
};