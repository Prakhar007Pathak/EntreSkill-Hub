import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import Progress from '../models/Progress.js';

// @desc    Register new user OR mentor
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { fullName, email, password, phone, role } = req.body;

        // Validate required fields
        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Prevent public admin registration
        const assignedRole = role === 'mentor' ? 'mentor' : 'user';

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user/mentor
        const user = await User.create({
            fullName,
            email,
            password,
            phone,
            role: assignedRole
        });

        // Initialize progress tracking (for users only)
        if (assignedRole === 'user') {
            await Progress.initializeForUser(user._id);
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: assignedRole === 'mentor'
                ? 'Mentor account created! Please complete your profile.'
                : 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    onboardingCompleted: user.onboardingCompleted,
                    mentorOnboardingCompleted: user.mentorOnboardingCompleted,
                    mentorVerificationStatus: user.mentorVerificationStatus
                },
                token
            }
        });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error registering user'
        });
    }
};

// @desc    Login user or mentor
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // ✅ UPDATE lastActive WITHOUT triggering pre-save hooks
        await User.findByIdAndUpdate(
            user._id,
            { lastActive: Date.now() },
            { timestamps: false }  // ✅ Prevents Mongoose from updating updatedAt
        );

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    onboardingCompleted: user.onboardingCompleted,
                    mentorOnboardingCompleted: user.mentorOnboardingCompleted,
                    mentorVerificationStatus: user.mentorVerificationStatus,
                    mentorSlug: user.mentorSlug
                },
                token
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in'
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: { user }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting user data'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { fullName, phone, location } = req.body;
        const user = await User.findById(req.user.id);

        if (fullName) user.fullName = fullName;
        if (phone) user.phone = phone;
        if (location) user.location = location;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};