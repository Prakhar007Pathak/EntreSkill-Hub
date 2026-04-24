import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: [true, 'Please provide your full name'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'mentor', 'admin'],
        default: 'user'
    },
    phone: {
        type: String,
        required: [true, 'Please provide your phone number'],
        trim: true
    },
    profilePicture: {
        type: String,
        default: ''
    },
    location: {
        city: String,
        state: String,
        country: String
    },

    // ─── USER ONBOARDING ──────────────────────────────────
    onboardingData: {
        status: {
            type: String,
            enum: [
                "Student (High School/Undergrad)",
                "Postgraduate Student",
                "Working Professional (Full-time)",
                "Freelancer / Gig Worker",
                "Founder / Self-employed",
                "Career Switcher",
                "Recent Graduate",
                "Researcher / Academic",
                "Homemaker / Re-entering Workforce"
            ]
        },
        education: {
            type: String,
            enum: [
                "High School Diploma",
                "Associate Degree",
                "Bachelor's Degree",
                "Master's Degree",
                "PhD / Doctorate",
                "Bootcamp Graduate",
                "Self-Taught Expert",
                "Professional Certification Holder"
            ]
        },
        field: { type: String, trim: true },
        skills: [String],
        tools: [String],
        proficiency: {
            type: String,
            enum: ["Beginner", "Intermediate", "Expert"],
            default: "Intermediate"
        },
        industry: [String],
        budget: { type: Number, default: 0, min: 0 },
        budgetCurrency: { type: String, default: 'INR' },
        commitment: { type: Number, default: 20, min: 1, max: 168 }
    },
    onboardingCompleted: {
        type: Boolean,
        default: false
    },

    // ─── MENTOR PROFILE ───────────────────────────────────
    mentorSlug: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true
    },
    mentorOnboardingCompleted: {
        type: Boolean,
        default: false
    },
    mentorVerificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    mentorRejectionReason: {
        type: String,
        default: null
    },
    mentorProfile: {

        // Step 1 - Professional Identity
        headline: {
            type: String,
            trim: true
            // e.g. "Serial Entrepreneur & Digital Marketing Expert"
        },
        yearsOfExperience: {
            type: Number,
            min: 0
        },
        currentRole: {
            type: String,
            trim: true
        },
        linkedinUrl: {
            type: String,
            trim: true
        },
        websiteUrl: {
            type: String,
            trim: true
        },

        // Step 2 - Expertise
        primaryExpertise: [String],
        industries: [String],
        skills: [String],
        tools: [String],

        // Step 3 - Mentorship Details
        bio: {
            type: String,
            trim: true,
            maxlength: [1000, 'Bio cannot exceed 1000 characters']
        },
        targetMentees: {
            type: String,
            trim: true
            // "Who do you want to help?"
        },
        sessionTypes: {
            qa: { type: Boolean, default: false },
            videoCall: { type: Boolean, default: false }
        },
        availableDays: [String],
        hoursPerWeek: { type: Number, min: 0, max: 168 },
        languages: [String],

        // Step 4 - Credentials
        achievements: [String],
        businessesBuilt: [String],
        notableClients: [String],
        trustStatement: {
            type: String,
            trim: true
        },

        // Stats (auto-updated)
        totalMentees: { type: Number, default: 0 },
        totalSessions: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        totalReviews: { type: Number, default: 0 }
    },

    // ─── COMMON ───────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    lastActive: { type: Date, default: Date.now }

}, {
    timestamps: true
});

// ─── Password Hashing ─────────────────────────────────────
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// ─── Auto-generate mentorSlug ─────────────────────────────
userSchema.pre('save', function (next) {
    if (this.role === 'mentor' && !this.mentorSlug) {
        const base = this.fullName
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');
        const suffix = Math.random().toString(36).substring(2, 7);
        this.mentorSlug = `${base}-${suffix}`;
    }
    next();
});

userSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
    }
});

// ─── Indexes ──────────────────────────────────────────────
userSchema.index({ role: 1, mentorVerificationStatus: 1 });
// userSchema.index({ mentorSlug: 1 });
userSchema.index({
    'mentorProfile.headline': 'text',
    'mentorProfile.bio': 'text',
    'mentorProfile.skills': 'text',
    'mentorProfile.industries': 'text',
    fullName: 'text'
});

const User = mongoose.model('User', userSchema);
export default User;