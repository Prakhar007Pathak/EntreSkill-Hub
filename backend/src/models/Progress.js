import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    stats: {
        businessesBookmarked: { type: Number, default: 0 },
        resourcesCompleted: { type: Number, default: 0 },
        mentorsConnected: { type: Number, default: 0 },
        mentorSessions: { type: Number, default: 0 },
    },
    streak: {
        current: { type: Number, default: 0 },
        longest: { type: Number, default: 0 },
        lastActiveDate: { type: Date, default: Date.now }
    },
    completedResources: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource'
    }],
    recentActivity: [{
        action: String,
        timestamp: { type: Date, default: Date.now },
        icon: String
    }],
    nextActions: [{
        task: String,
        urgent: Boolean,
        completed: Boolean
    }]
}, {
    timestamps: true
});

// Auto-create progress when user registers
progressSchema.statics.initializeForUser = async function (userId) {
    const progress = await this.create({
        userId,
        stats: {
            businessesBookmarked: 0,
            resourcesCompleted: 0,
            mentorsConnected: 0,
            mentorSessions: 0
        },
        nextActions: [
            { task: 'Complete your profile', urgent: true, completed: false },
            { task: 'Explore business ideas', urgent: false, completed: false },
            { task: 'Start your first roadmap', urgent: false, completed: false },
            { task: 'Find a mentor', urgent: false, completed: false },
        ]
    });
    return progress;
};

// Update streak
progressSchema.methods.updateStreak = function () {
    const now = new Date();
    const lastActive = new Date(this.streak.lastActiveDate);
    const daysDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) return;
    else if (daysDiff === 1) {
        this.streak.current += 1;
        if (this.streak.current > this.streak.longest) {
            this.streak.longest = this.streak.current;
        }
    } else {
        this.streak.current = 1;
    }

    this.streak.lastActiveDate = now;
};

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;