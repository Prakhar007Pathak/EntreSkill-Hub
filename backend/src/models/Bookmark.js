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
        default: 'business'
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

// Prevent duplicate bookmarks
bookmarkSchema.index(
    { userId: 1, businessId: 1 },
    { unique: true, sparse: true }
);
bookmarkSchema.index(
    { userId: 1, resourceId: 1 },
    { unique: true, sparse: true }
);

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

export default Bookmark;