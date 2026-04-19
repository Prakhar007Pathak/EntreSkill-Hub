import User from '../models/User.js';

// @desc    Submit onboarding data
// @route   POST /api/onboarding
// @access  Private
export const submitOnboarding = async (req, res) => {
    try {
        const {
            status,
            education,
            field,
            skills,
            tools,
            proficiency,
            industry,
            budget,
            commitment
        } = req.body;

        // Validation
        if (!status || !education || !skills || skills.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please complete all required fields'
            });
        }

        // Update user profile
        const user = await User.findById(req.user.id);

        user.onboardingData = {
            status,
            education,
            field,
            skills,
            tools,
            proficiency,
            industry,
            budget: parseInt(budget) || 0,
            commitment: parseInt(commitment) || 0
        };

        user.onboardingCompleted = true;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Onboarding completed successfully!',
            data: { user }
        });

    } catch (error) {
        console.error('Onboarding Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving onboarding data'
        });
    }
};

// @desc    Get onboarding status
// @route   GET /api/onboarding/status
// @access  Private
export const getOnboardingStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: {
                completed: user.onboardingCompleted,
                data: user.onboardingData || null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching onboarding status'
        });
    }
};