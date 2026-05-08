import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'roadmap_milestone',    // completed a stage
            'roadmap_started',      // started a new roadmap
            'roadmap_completed',    // completed entire roadmap
            'resource_new',         // new resource available
            'resource_completed',   // completed a resource
            'resource_approved',    // ✅ ADDED: mentor's resource approved
            'resource_rejected',    // ✅ ADDED: mentor's resource rejected
            'mentor_connected',     // connected with mentor
            'mentor_session',       // mentor session booked
            'mentor_approved',      // ✅ ADDED: mentor account approved
            'mentor_rejected',      // ✅ ADDED: mentor account rejected
            'new_question',         // ✅ ADDED: new Q&A question
            'question_answered',    // ✅ ADDED: Q&A question answered
            'task_completed',       // completed a task
            'bookmark_added',       // bookmarked something
            'system'                // general system notification
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: '🔔'
    },
    link: {
        type: String,
        default: null
        // where to go when clicked
        // e.g., '/roadmap/social-media-agency'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
        // extra data like businessId, resourceId etc
    }
}, {
    timestamps: true
});

// Index for fast queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function (
    userId, type, title, message, options = {}
) {
    const notification = await this.create({
        userId,
        type,
        title,
        message,
        icon: options.icon || '🔔',
        link: options.link || null,
        metadata: options.metadata || {}
    });
    return notification;
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;