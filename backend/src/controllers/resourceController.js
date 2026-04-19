import Resource from '../models/Resource.js';
import Progress from '../models/Progress.js';
import Bookmark from '../models/Bookmark.js';
import Notification from '../models/Notification.js';

// @desc    Get all resources with filters
// @route   GET /api/resources
// @access  Private (Users see only approved)
export const getResources = async (req, res) => {
    try {
        const {
            search,
            type,
            category,
            level,
            featured,
            page = 1,
            limit = 12
        } = req.query;

        // ✅ Users only see APPROVED resources
        let query = {
            isActive: true,
            status: 'approved'
        };

        if (search) {
            query.$text = { $search: search };
        }

        if (type) query.type = type;
        if (category) query.category = category;
        if (level) query.level = level;
        if (featured === 'true') query.featured = true;

        const resources = await Resource.find(query)
            .populate('uploadedBy', 'fullName email profilePicture')
            .populate('approvedBy', 'fullName')
            .sort({ featured: -1, createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await Resource.countDocuments(query);

        // Get user's completed resources
        let completedResourceIds = [];
        if (req.user) {
            const progress = await Progress.findOne({ userId: req.user.id });
            if (progress) {
                completedResourceIds = progress.completedResources || [];
            }
        }

        // Add isCompleted flag to each resource
        const resourcesWithStatus = resources.map(resource => ({
            ...resource.toObject(),
            isCompleted: completedResourceIds
                .map(id => id.toString())
                .includes(resource._id.toString())
        }));

        res.status(200).json({
            success: true,
            data: {
                resources: resourcesWithStatus,
                pagination: {
                    total,
                    page: Number(page),
                    pages: Math.ceil(total / Number(limit)),
                    limit: Number(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get Resources Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching resources'
        });
    }
};

// @desc    Get single resource by slug
// @route   GET /api/resources/:slug
// @access  Private
export const getResourceBySlug = async (req, res) => {
    try {
        const resource = await Resource.findOne({
            slug: req.params.slug,
            isActive: true,
            status: 'approved' // ✅ Only approved resources
        })
            .populate('uploadedBy', 'fullName email profilePicture')
            .populate('approvedBy', 'fullName');

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        // Increment view count
        resource.viewCount += 1;
        await resource.save();

        // Check if user completed this resource
        let isCompleted = false;
        if (req.user) {
            const progress = await Progress.findOne({ userId: req.user.id });
            if (progress && progress.completedResources) {
                isCompleted = progress.completedResources
                    .map(id => id.toString())
                    .includes(resource._id.toString());
            }
        }

        res.status(200).json({
            success: true,
            data: {
                resource,
                isCompleted
            }
        });
    } catch (error) {
        console.error('Get Resource Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching resource'
        });
    }
};

// @desc    Mark resource as completed
// @route   POST /api/resources/:id/complete
// @access  Private
export const completeResource = async (req, res) => {
    try {
        const resource = await Resource.findOne({
            _id: req.params.id,
            status: 'approved' // ✅ Only approved resources
        });

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        // Get user progress
        let progress = await Progress.findOne({ userId: req.user.id });
        if (!progress) {
            progress = await Progress.initializeForUser(req.user.id);
        }

        // Initialize completedResources array if not exists
        if (!progress.completedResources) {
            progress.completedResources = [];
        }

        // Check if already completed
        const alreadyCompleted = progress.completedResources
            .map(id => id.toString())
            .includes(resource._id.toString());

        if (alreadyCompleted) {
            return res.status(400).json({
                success: false,
                message: 'Resource already completed'
            });
        }

        // Mark as completed
        progress.completedResources.push(resource._id);
        progress.stats.resourcesCompleted += 1;
        progress.stats.totalPoints += resource.estimatedPoints || 10;

        // Update level
        progress.stats.currentLevel = Math.floor(progress.stats.totalPoints / 100) + 1;

        // Add to recent activity
        progress.recentActivity.unshift({
            action: `Completed "${resource.title}"`,
            icon: 'resource',
            timestamp: new Date()
        });

        // Keep only last 10 activities
        if (progress.recentActivity.length > 10) {
            progress.recentActivity = progress.recentActivity.slice(0, 10);
        }

        await progress.save();

        // Increment resource completion count
        resource.completionCount += 1;
        await resource.save();

        res.status(200).json({
            success: true,
            message: `Resource completed! +${resource.estimatedPoints} points 🎉`,
            data: {
                points: resource.estimatedPoints,
                totalPoints: progress.stats.totalPoints,
                currentLevel: progress.stats.currentLevel
            }
        });
    } catch (error) {
        console.error('Complete Resource Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error completing resource'
        });
    }
};

// @desc    Get featured resources
// @route   GET /api/resources/featured
// @access  Private
export const getFeaturedResources = async (req, res) => {
    try {
        const resources = await Resource.find({
            isActive: true,
            featured: true,
            status: 'approved' // ✅ Only approved resources
        })
            .populate('uploadedBy', 'fullName profilePicture')
            .limit(6);

        res.status(200).json({
            success: true,
            data: { resources }
        });
    } catch (error) {
        console.error('Get Featured Resources Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching featured resources'
        });
    }
};

// @desc    Get user's completed resources
// @route   GET /api/resources/user/completed
// @access  Private
export const getCompletedResources = async (req, res) => {
    try {
        const progress = await Progress.findOne({ userId: req.user.id })
            .populate('completedResources');

        const completedResources = progress?.completedResources || [];

        res.status(200).json({
            success: true,
            data: { completedResources }
        });
    } catch (error) {
        console.error('Get Completed Resources Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching completed resources'
        });
    }
};

// ─── MENTOR FUNCTIONS (Ready for Mentor Dashboard) ────────────────

// @desc    Mentor uploads a new resource
// @route   POST /api/resources/upload
// @access  Private (Mentor only)
export const uploadResource = async (req, res) => {
    try {
        const {
            title, slug, description, type,
            category, level, duration,
            thumbnail, resourceUrl, content,
            checklistItems, tags, estimatedPoints
        } = req.body;

        // Check if mentor
        if (req.user.role !== 'mentor' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only mentors can upload resources'
            });
        }

        // Check slug unique
        const existing = await Resource.findOne({ slug });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'A resource with this slug already exists'
            });
        }

        const resource = await Resource.create({
            title,
            slug,
            description,
            type,
            category,
            level,
            duration,
            thumbnail,
            resourceUrl,
            content,
            checklistItems: checklistItems || [],
            tags: tags || [],
            estimatedPoints: estimatedPoints || 10,
            uploadedBy: req.user.id,
            isAdminCurated: false,
            status: 'pending', // ✅ Needs admin approval
            instructor: {
                name: req.user.fullName,
                bio: req.user.mentorProfile?.bio || ''
            }
        });

        res.status(201).json({
            success: true,
            message: 'Resource uploaded! Pending admin approval.',
            data: { resource }
        });
    } catch (error) {
        console.error('Upload Resource Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading resource'
        });
    }
};

// @desc    Get mentor's own uploaded resources
// @route   GET /api/resources/mentor/my-resources
// @access  Private (Mentor only)
export const getMentorResources = async (req, res) => {
    try {
        const resources = await Resource.find({
            uploadedBy: req.user.id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: { resources }
        });
    } catch (error) {
        console.error('Get Mentor Resources Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your resources'
        });
    }
};

// ─── ADMIN FUNCTIONS (Ready for Admin Panel) ─────────────────────

// @desc    Get all resources (any status) for admin
// @route   GET /api/resources/admin/all
// @access  Private (Admin only)
export const adminGetAllResources = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { status, page = 1, limit = 20 } = req.query;
        let query = {};
        if (status) query.status = status;

        const resources = await Resource.find(query)
            .populate('uploadedBy', 'fullName email profilePicture')
            .populate('approvedBy', 'fullName')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await Resource.countDocuments(query);

        // Count by status
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

// @desc    Admin approves a resource
// @route   PUT /api/resources/admin/:id/approve
// @access  Private (Admin only)
export const approveResource = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const resource = await Resource.findById(req.params.id);
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

        res.status(200).json({
            success: true,
            message: 'Resource approved successfully!',
            data: { resource }
        });
    } catch (error) {
        console.error('Approve Resource Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving resource'
        });
    }
};

// @desc    Admin rejects a resource
// @route   PUT /api/resources/admin/:id/reject
// @access  Private (Admin only)
export const rejectResource = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { reason } = req.body;

        const resource = await Resource.findById(req.params.id);
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

        res.status(200).json({
            success: true,
            message: 'Resource rejected.',
            data: { resource }
        });
    } catch (error) {
        console.error('Reject Resource Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting resource'
        });
    }
};

// @desc    Admin toggles featured status
// @route   PUT /api/resources/admin/:id/feature
// @access  Private (Admin only)
export const toggleFeatured = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

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
            data: { resource }
        });
    } catch (error) {
        console.error('Toggle Featured Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating resource'
        });
    }
};

// @desc    Toggle resource bookmark
// @route   POST /api/resources/:id/bookmark
// @access  Private
export const toggleResourceBookmark = async (req, res) => {
    try {
        const resourceId = req.params.id;
        const userId = req.user.id;

        const resource = await Resource.findById(resourceId);
        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        const existingBookmark = await Bookmark.findOne({
            userId,
            resourceId,
            type: 'resource'
        });

        if (existingBookmark) {
            await Bookmark.deleteOne({ _id: existingBookmark._id });

            return res.status(200).json({
                success: true,
                message: 'Resource bookmark removed',
                data: { isBookmarked: false }
            });
        } else {
            await Bookmark.create({
                userId,
                resourceId,
                type: 'resource'
            });

            // Create notification
            await Notification.createNotification(
                userId,
                'bookmark_added',
                'Resource Bookmarked! 🔖',
                `You bookmarked "${resource.title}"`,
                {
                    icon: '🔖',
                    link: `/resources/${resource.slug}`,
                    metadata: { resourceId: resource._id }
                }
            );

            return res.status(200).json({
                success: true,
                message: 'Resource bookmarked',
                data: { isBookmarked: true }
            });
        }
    } catch (error) {
        console.error('Resource Bookmark Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling resource bookmark'
        });
    }
};

// @desc    Get user's bookmarked resources
// @route   GET /api/resources/user/bookmarks
// @access  Private
export const getResourceBookmarks = async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({
            userId: req.user.id,
            type: 'resource'
        })
            .populate('resourceId')
            .sort({ createdAt: -1 });

        const resources = bookmarks
            .filter(b => b.resourceId)
            .map(b => ({
                ...b.resourceId.toObject(),
                isBookmarked: true
            }));

        res.status(200).json({
            success: true,
            data: { resources }
        });
    } catch (error) {
        console.error('Get Resource Bookmarks Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookmarked resources'
        });
    }
};