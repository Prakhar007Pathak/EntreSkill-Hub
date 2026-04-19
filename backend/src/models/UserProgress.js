import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roadmapId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Roadmap',
        required: true
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    currentStage: {
        type: Number,
        default: 1
    },
    completedTasks: [{
        taskId: String,
        completedAt: Date
    }],
    overallProgress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date,
    notes: [{
        stageNumber: Number,
        note: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Compound index to prevent duplicate progress entries
userProgressSchema.index({ userId: 1, roadmapId: 1 }, { unique: true });

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

export default UserProgress;