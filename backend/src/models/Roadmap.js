import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    type: {
        type: String,
        enum: ['checklist', 'video', 'document', 'link', 'action'],
        default: 'checklist'
    },
    resourceUrl: String,
    estimatedTime: String, // e.g., "2 hours"
    isOptional: {
        type: Boolean,
        default: false
    },
    tips: [String],
    order: Number
});

const stageSchema = new mongoose.Schema({
    stageNumber: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    duration: String, // e.g., "Week 1-2"
    icon: String,
    tasks: [taskSchema],
    milestoneReward: {
        badge: String,
        points: Number
    }
});

const roadmapSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    totalDuration: String, // e.g., "12-16 weeks"
    stages: [stageSchema],
    prerequisites: [String],
    outcomes: [String],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Roadmap = mongoose.model('Roadmap', roadmapSchema);

export default Roadmap;