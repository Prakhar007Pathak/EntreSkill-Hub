import mongoose from 'mongoose';

const mentorSessionSchema = new mongoose.Schema({

    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // ─── SESSION TYPE ─────────────────────────────────────
    type: {
        type: String,
        enum: ['qa', 'video_call'],
        required: true
    },

    // ─── BOOKING TYPE ─────────────────────────────────────
    bookingType: {
        type: String,
        enum: ['slot_booking', 'session_request'],
        required: true
        // slot_booking = user picked mentor's slot
        // session_request = user sent request, mentor approves
    },

    // ─── STATUS ───────────────────────────────────────────
    status: {
        type: String,
        enum: ['requested', 'scheduled', 'completed', 'cancelled', 'rejected'],
        default: 'requested'
    },

    // ─── TOPIC & MESSAGE ──────────────────────────────────
    topic: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        trim: true
        // User's message to mentor when requesting
    },

    // ─── SCHEDULING ───────────────────────────────────────
    preferredTimes: [Date],
    // User's preferred times (for session_request type)

    scheduledAt: {
        type: Date,
        default: null
        // Final confirmed time (set when approved/scheduled)
    },
    duration: {
        type: Number,
        default: 60
        // in minutes
    },

    // ─── VIDEO CALL ───────────────────────────────────────
    jitsiRoomId: {
        type: String,
        default: null
        // auto-generated when session is scheduled
    },
    jitsiRoomUrl: {
        type: String,
        default: null
    },

    // ─── Q&A ─────────────────────────────────────────────
    questions: [{
        question: String,
        answer: String,
        answeredAt: Date
    }],

    // ─── REJECTION ────────────────────────────────────────
    rejectionReason: {
        type: String,
        default: null
    },

    // ─── COMPLETION ───────────────────────────────────────
    completedAt: {
        type: Date,
        default: null
    },
    mentorNotes: {
        type: String,
        default: null
        // mentor's private notes after session
    },

    // ─── REVIEW (after session) ───────────────────────────
    review: {
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        reviewedAt: Date
    }

}, {
    timestamps: true
});

// ─── Indexes ──────────────────────────────────────────────
mentorSessionSchema.index({ mentorId: 1, status: 1 });
mentorSessionSchema.index({ userId: 1, status: 1 });
mentorSessionSchema.index({ scheduledAt: 1 });

const MentorSession = mongoose.model('MentorSession', mentorSessionSchema);
export default MentorSession;