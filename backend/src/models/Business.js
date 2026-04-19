import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
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
    tagline: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Technology', 'Service', 'Product', 'Digital',
            'Creative', 'Consulting', 'E-commerce', 'Food & Beverage'
        ]
    },
    industries: [{
        type: String
        // Removed enum - allow any industry from onboarding
    }],
    requiredSkills: [{
        type: String
        // Removed enum - allow any skill from onboarding
    }],
    investmentRange: {
        min: {
            type: Number,
            required: true
        },
        max: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: 'USD'
        }
    },
    timeCommitment: {
        type: String,
        required: true,
        enum: ['5-10 hrs/week', '10-20 hrs/week', '20-40 hrs/week', 'Full-time (40+ hrs)']
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Moderate', 'Hard'],
        default: 'Moderate'
    },
    viabilityScore: {
        type: Number,
        min: 1,
        max: 10,
        default: 7
    },
    competitionLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    successRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 65
    },
    marketDemand: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Trending'],
        default: 'Medium'
    },
    expectedROI: {
        timeline: String,
        percentage: Number
    },
    pros: [String],
    cons: [String],
    thumbnail: {
        type: String,
        default: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400'
    },
    icon: {
        type: String,
        default: '💼'
    },
    tags: [String],
    isActive: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    viewCount: {
        type: Number,
        default: 0
    },
    bookmarkCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for search
businessSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Business = mongoose.model('Business', businessSchema);

export default Business;