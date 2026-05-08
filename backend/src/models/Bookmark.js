import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // ─── TYPE OF BOOKMARK ─────────────────────────────────
    type: {
        type: String,
        enum: ['business', 'resource'],
        required: true
    },
    // ─── BUSINESS BOOKMARK ────────────────────────────────
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        default: null
    },
    // ─── RESOURCE BOOKMARK ────────────────────────────────
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
        default: null
    }
}, {
    timestamps: true
});

// ✅ FIXED: Updated indexes to be sparse and only when field exists
bookmarkSchema.index(
    { userId: 1, businessId: 1 },
    {
        unique: true,
        sparse: true,
        partialFilterExpression: { businessId: { $type: 'objectId' } }
    }
);

bookmarkSchema.index(
    { userId: 1, resourceId: 1 },
    {
        unique: true,
        sparse: true,
        partialFilterExpression: { resourceId: { $type: 'objectId' } }
    }
);

// ✅ FIXED: Remove `next` callback - use async/await instead
bookmarkSchema.pre('save', async function () {
    // Validation: ensure at least one ID is present
    if (!this.businessId && !this.resourceId) {
        throw new Error('Either businessId or resourceId must be provided');
    }

    // Validation: cannot have both
    if (this.businessId && this.resourceId) {
        throw new Error('Cannot bookmark both business and resource at once');
    }
});

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

export default Bookmark;