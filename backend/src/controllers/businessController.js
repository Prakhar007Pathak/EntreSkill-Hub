import Business from '../models/Business.js';
import Bookmark from '../models/Bookmark.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';


// @desc    Get all businesses with filters
// @route   GET /api/businesses
// @access  Public
export const getBusinesses = async (req, res) => {
    try {
        const {
            search,
            category,
            industry,
            difficulty,
            minInvestment,
            maxInvestment,
            marketDemand,
            featured,
            limit = 20,
            page = 1
        } = req.query;

        // Build query
        let query = { isActive: true };

        // Search in title, description, tags
        if (search) {
            query.$text = { $search: search };
        }

        if (category) {
            query.category = category;
        }

        if (industry) {
            query.industries = { $in: [industry] };
        }

        if (difficulty) {
            query.difficulty = difficulty;
        }

        if (minInvestment || maxInvestment) {
            query['investmentRange.min'] = {};
            if (minInvestment) query['investmentRange.min'].$gte = Number(minInvestment);
            if (maxInvestment) query['investmentRange.max'] = { $lte: Number(maxInvestment) };
        }

        if (marketDemand) {
            query.marketDemand = marketDemand;
        }

        if (featured === 'true') {
            query.featured = true;
        }

        // Execute query with pagination
        const businesses = await Business.find(query)
            .sort({ featured: -1, createdAt: -1 })
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
        console.error('Get Businesses Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching businesses'
        });
    }
};

// @desc    Get personalized recommendations
// @route   GET /api/businesses/recommendations
// @access  Private
export const getRecommendations = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user.onboardingData) {
            return res.status(400).json({
                success: false,
                message: 'Please complete onboarding first'
            });
        }

        const { industry, primarySkill } = user.onboardingData;

        // Find businesses matching user's profile
        const recommendations = await Business.find({
            isActive: true,
            $or: [
                { industries: { $in: industry } },
                { requiredSkills: { $in: [primarySkill] } }
            ]
        })
            .sort({ viabilityScore: -1, successRate: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: { recommendations }
        });
    } catch (error) {
        console.error('Recommendations Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting recommendations'
        });
    }
};

// @desc    Get single business by slug
// @route   GET /api/businesses/:slug
// @access  Public
export const getBusinessBySlug = async (req, res) => {
    try {
        const business = await Business.findOne({
            slug: req.params.slug,
            isActive: true
        });

        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }

        // Increment view count
        business.viewCount += 1;
        await business.save();

        // Check if user bookmarked this business
        let isBookmarked = false;
        if (req.user) {
            const bookmark = await Bookmark.findOne({
                userId: req.user.id,
                businessId: business._id
            });
            isBookmarked = !!bookmark;
        }

        res.status(200).json({
            success: true,
            data: {
                business,
                isBookmarked
            }
        });
    } catch (error) {
        console.error('Get Business Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching business'
        });
    }
};

// @desc    Bookmark a business or resource
// @route   POST /api/businesses/:id/bookmark
// @access  Private
export const toggleBookmark = async (req, res) => {
    try {
        const businessId = req.params.id;
        const userId = req.user.id;

        const business = await Business.findById(businessId);
        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }

        const existingBookmark = await Bookmark.findOne({
            userId,
            businessId,
            type: 'business'
        });

        if (existingBookmark) {
            await Bookmark.deleteOne({ _id: existingBookmark._id });
            business.bookmarkCount = Math.max(0, business.bookmarkCount - 1);
            await business.save();

            return res.status(200).json({
                success: true,
                message: 'Bookmark removed',
                data: { isBookmarked: false }
            });
        } else {
            await Bookmark.create({
                userId,
                businessId,
                type: 'business'
            });
            business.bookmarkCount += 1;
            await business.save();

            // Create notification
            await Notification.createNotification(
                userId,
                'bookmark_added',
                'Business Bookmarked! 🔖',
                `You bookmarked "${business.title}"`,
                {
                    icon: '🔖',
                    link: `/business/${business.slug}`,
                    metadata: { businessId: business._id }
                }
            );

            return res.status(200).json({
                success: true,
                message: 'Business bookmarked',
                data: { isBookmarked: true }
            });
        }
    } catch (error) {
        console.error('Bookmark Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling bookmark'
        });
    }
};

// @desc    Get user's bookmarked businesses
// @route   GET /api/businesses/user/bookmarks
// @access  Private
export const getBookmarks = async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({
            userId: req.user.id,
            type: 'business'
        })
            .populate('businessId')
            .sort({ createdAt: -1 });

        const businesses = bookmarks
            .filter(b => b.businessId)
            .map(b => b.businessId);

        res.status(200).json({
            success: true,
            data: { businesses }
        });
    } catch (error) {
        console.error('Get Bookmarks Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookmarks'
        });
    }
};