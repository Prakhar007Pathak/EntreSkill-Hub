import mongoose from 'mongoose';

const mentorAvailabilitySlotSchema = new mongoose.Schema({

    mentorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
        // e.g. "10:00"
    },
    endTime: {
        type: String,
        required: true
        // e.g. "11:00"
    },
    duration: {
        type: Number,
        default: 60
        // minutes
    },
    sessionType: {
        type: String,
        enum: ['qa', 'video_call', 'both'],
        default: 'both'
    },
    isBooked: {
        type: Boolean,
        default: false
    },
    bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MentorSession',
        default: null
    }

}, {
    timestamps: true
});

mentorAvailabilitySlotSchema.index({ mentorId: 1, date: 1 });
mentorAvailabilitySlotSchema.index({ mentorId: 1, isBooked: 1 });

const MentorAvailabilitySlot = mongoose.model(
    'MentorAvailabilitySlot',
    mentorAvailabilitySlotSchema
);
export default MentorAvailabilitySlot;