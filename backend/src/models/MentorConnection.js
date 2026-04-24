import mongoose from 'mongoose';

const mentorConnectionSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['connected', 'disconnected'],
        default: 'connected'
    },
    connectedAt: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});

// Prevent duplicate connections
mentorConnectionSchema.index(
    { userId: 1, mentorId: 1 },
    { unique: true }
);

mentorConnectionSchema.index({ mentorId: 1 });
mentorConnectionSchema.index({ userId: 1 });

const MentorConnection = mongoose.model('MentorConnection', mentorConnectionSchema);
export default MentorConnection;