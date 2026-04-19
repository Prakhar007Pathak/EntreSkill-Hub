import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['video', 'article', 'checklist', 'template', 'guide'],
        required: true
    },
    category: {
        type: String,
        enum: [
            'Business Basics',
            'Marketing',
            'Finance',
            'Legal',
            'Technology',
            'Sales',
            'Operations',
            'Mindset'
        ],
        required: true
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
    },
    duration: {
        type: String,
    },
    thumbnail: {
        type: String,
        default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'
    },
    resourceUrl: {
        type: String
    },
    content: {
        type: String
    },
    checklistItems: [String],
    tags: [String],
    relatedBusinesses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business'
    }],
    instructor: {
        name: String,
        avatar: String,
        bio: String
    },

    // ─── WHO UPLOADED IT ─────────────────────────────────
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
        // null = admin curated/seeded
        // ObjectId = mentor who uploaded it
    },
    isAdminCurated: {
        type: Boolean,
        default: false
        // true = seeded/created by admin team
        // false = uploaded by mentor
    },

    // ─── APPROVAL SYSTEM ─────────────────────────────────
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
        // pending = waiting for admin review
        // approved = visible to all users
        // rejected = not visible, mentor notified
    },
    rejectionReason: {
        type: String,
        default: null
        // filled when admin rejects
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
        // which admin approved it
    },
    approvedAt: {
        type: Date,
        default: null
        // when it was approved
    },

    // ─── EXISTING FLAGS ───────────────────────────────────
    featured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    viewCount: {
        type: Number,
        default: 0
    },
    completionCount: {
        type: Number,
        default: 0
    },
    estimatedPoints: {
        type: Number,
        default: 10
    }
}, {
    timestamps: true
});

// Index for search
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;