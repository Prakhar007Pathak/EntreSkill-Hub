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
        trim: true
    },
    profilePicture: {
        type: String,
        default: 'https://ui-avatars.com/api/?name=User&background=3B82F6&color=fff'
    },
    location: {
        city: String,
        state: String,
        country: String
    },

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
        field: {
            type: String,
            trim: true
            // NOT required during registration - filled in onboarding
        },
        skills: [String],
        tools: [String],
        proficiency: {
            type: String,
            enum: ["Beginner", "Intermediate", "Expert"],
            default: "Intermediate"
        },
        industry: [String],
        budget: {
            type: Number,
            default: 0,
            min: 0
        },
        budgetCurrency: {
            type: String,
            default: 'INR'
        },
        commitment: {
            type: Number,
            default: 20,
            min: 1,
            max: 168
        }
    },

    onboardingCompleted: {
        type: Boolean,
        default: false
    },

    isActive: {
        type: Boolean,
        default: true
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
    }
});

const User = mongoose.model('User', userSchema);

export default User;