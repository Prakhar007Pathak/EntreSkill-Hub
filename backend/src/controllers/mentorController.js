import User from '../models/User.js';
import MentorSession from '../models/MentorSession.js';
import MentorConnection from '../models/MentorConnection.js';
import MentorAvailabilitySlot from '../models/MentorAvailabilitySlot.js';
import Progress from '../models/Progress.js';
import Notification from '../models/Notification.js';
import { v4 as uuidv4 } from 'uuid';

// ─── USER SIDE ────────────────────────────────────────────

// @desc    Get all approved mentors with filters
// @route   GET /api/mentors
// @access  Private (users)
export const getMentors = async (req, res) => {
    try {
        const {
            search,
            expertise,
            industry,
            language,
            sessionType,
            page = 1,
            limit = 12
        } = req.query;

        let query = {
            role: 'mentor',
            mentorVerificationStatus: 'approved',
            mentorOnboardingCompleted: true,
            isActive: true
        };

        if (search) {
            query.$text = { $search: search };
        }
        if (expertise) {
            query['mentorProfile.primaryExpertise'] = { $in: [expertise] };
        }
        if (industry) {
            query['mentorProfile.industries'] = { $in: [industry] };
        }
        if (language) {
            query['mentorProfile.languages'] = { $in: [language] };
        }
        if (sessionType === 'qa') {
            query['mentorProfile.sessionTypes.qa'] = true;
        }
        if (sessionType === 'video_call') {
            query['mentorProfile.sessionTypes.videoCall'] = true;
        }

        const mentors = await User.find(query)
            .select('-password -onboardingData -__v')
            .sort({ 'mentorProfile.averageRating': -1, createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                mentors,
                pagination: {
                    total,
                    page: Number(page),
                    pages: Math.ceil(total / Number(limit)),
                    limit: Number(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get Mentors Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching mentors'
        });
    }
};

// @desc    Get single mentor by slug
// @route   GET /api/mentors/:mentorSlug
// @access  Private
export const getMentorBySlug = async (req, res) => {
    try {
        const mentor = await User.findOne({
            mentorSlug: req.params.mentorSlug,
            role: 'mentor',
            mentorVerificationStatus: 'approved'
        }).select('-password -onboardingData -__v');

        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor not found'
            });
        }

        // Check if current user is connected to this mentor
        let isConnected = false;
        if (req.user) {
            const connection = await MentorConnection.findOne({
                userId: req.user.id,
                mentorId: mentor._id,
                status: 'connected'
            });
            isConnected = !!connection;
        }

        // Get mentor's available slots
        const availableSlots = await MentorAvailabilitySlot.find({
            mentorId: mentor._id,
            isBooked: false,
            date: { $gte: new Date() }
        }).sort({ date: 1 }).limit(10);

        res.status(200).json({
            success: true,
            data: {
                mentor,
                isConnected,
                availableSlots
            }
        });
    } catch (error) {
        console.error('Get Mentor Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching mentor'
        });
    }
};

// @desc    Connect with a mentor
// @route   POST /api/mentors/:mentorId/connect
// @access  Private (users)
export const connectMentor = async (req, res) => {
    try {
        const { mentorId } = req.params;
        const userId = req.user.id;

        const mentor = await User.findOne({
            _id: mentorId,
            role: 'mentor',
            mentorVerificationStatus: 'approved'
        });

        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor not found'
            });
        }

        // Check existing connection
        const existing = await MentorConnection.findOne({ userId, mentorId });

        if (existing) {
            if (existing.status === 'connected') {
                // Disconnect
                existing.status = 'disconnected';
                await existing.save();

                // Update mentor stats
                await User.findByIdAndUpdate(mentorId, {
                    $inc: { 'mentorProfile.totalMentees': -1 }
                });

                // Update user progress stats
                const progress = await Progress.findOne({ userId });
                if (progress) {
                    progress.stats.mentorsConnected = Math.max(
                        0,
                        (progress.stats.mentorsConnected || 0) - 1
                    );
                    await progress.save();
                }

                return res.status(200).json({
                    success: true,
                    message: 'Disconnected from mentor',
                    data: { isConnected: false }
                });
            } else {
                // Reconnect
                existing.status = 'connected';
                existing.connectedAt = new Date();
                await existing.save();
            }
        } else {
            // New connection
            await MentorConnection.create({ userId, mentorId });
        }

        // Update mentor stats
        await User.findByIdAndUpdate(mentorId, {
            $inc: { 'mentorProfile.totalMentees': 1 }
        });

        // Update user progress
        const progress = await Progress.findOne({ userId });
        if (progress) {
            progress.stats.mentorsConnected =
                (progress.stats.mentorsConnected || 0) + 1;
            progress.recentActivity.unshift({
                action: `Connected with mentor ${mentor.fullName}`,
                icon: 'mentor_connected',
                timestamp: new Date()
            });
            if (progress.recentActivity.length > 10) {
                progress.recentActivity = progress.recentActivity.slice(0, 10);
            }
            await progress.save();
        }

        // Notification to user
        await Notification.createNotification(
            userId,
            'mentor_connected',
            'Mentor Connected! 🎓',
            `You are now connected with ${mentor.fullName}`,
            {
                icon: '🎓',
                link: `/mentors/${mentor.mentorSlug}`,
                metadata: { mentorId: mentor._id }
            }
        );

        res.status(200).json({
            success: true,
            message: `Connected with ${mentor.fullName}!`,
            data: { isConnected: true }
        });
    } catch (error) {
        console.error('Connect Mentor Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error connecting with mentor'
        });
    }
};

// @desc    Request a session with mentor
// @route   POST /api/mentors/:mentorId/sessions/request
// @access  Private (users)
export const requestSession = async (req, res) => {
    try {
        const { mentorId } = req.params;
        const { type, topic, message, preferredTimes } = req.body;
        const userId = req.user.id;

        if (!type || !topic) {
            return res.status(400).json({
                success: false,
                message: 'Session type and topic are required'
            });
        }

        const mentor = await User.findOne({
            _id: mentorId,
            role: 'mentor',
            mentorVerificationStatus: 'approved'
        });

        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: 'Mentor not found'
            });
        }

        const session = await MentorSession.create({
            mentorId,
            userId,
            type,
            bookingType: 'session_request',
            status: 'requested',
            topic,
            message,
            preferredTimes: preferredTimes || []
        });

        // Notification to mentor
        await Notification.createNotification(
            mentorId,
            'mentor_session',
            'New Session Request! 📅',
            `${req.user.fullName} requested a ${type === 'qa' ? 'Q&A' : 'Video Call'} session`,
            {
                icon: '📅',
                link: `/mentor/dashboard`,
                metadata: { sessionId: session._id, userId }
            }
        );

        res.status(201).json({
            success: true,
            message: 'Session requested! Waiting for mentor approval.',
            data: { session }
        });
    } catch (error) {
        console.error('Request Session Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error requesting session'
        });
    }
};

// @desc    Book an available slot
// @route   POST /api/mentors/slots/:slotId/book
// @access  Private (users)
export const bookSlot = async (req, res) => {
    try {
        const { slotId } = req.params;
        const { type, topic, message } = req.body;
        const userId = req.user.id;

        const slot = await MentorAvailabilitySlot.findById(slotId);
        if (!slot || slot.isBooked) {
            return res.status(400).json({
                success: false,
                message: 'Slot not available'
            });
        }

        // Create session from slot
        const scheduledAt = new Date(slot.date);
        const [hours, minutes] = slot.startTime.split(':');
        scheduledAt.setHours(Number(hours), Number(minutes));

        // Generate Jitsi room
        const jitsiRoomId = `entreSkill-${uuidv4().split('-')[0]}`;
        const jitsiRoomUrl = `https://meet.jit.si/${jitsiRoomId}`;

        const session = await MentorSession.create({
            mentorId: slot.mentorId,
            userId,
            type: type || slot.sessionType,
            bookingType: 'slot_booking',
            status: 'scheduled',
            topic,
            message,
            scheduledAt,
            duration: slot.duration,
            jitsiRoomId,
            jitsiRoomUrl
        });

        // Mark slot as booked
        slot.isBooked = true;
        slot.bookedBy = userId;
        slot.sessionId = session._id;
        await slot.save();

        // Update user progress
        const progress = await Progress.findOne({ userId });
        if (progress) {
            progress.stats.mentorSessions =
                (progress.stats.mentorSessions || 0) + 1;
            await progress.save();
        }

        // Update mentor stats
        await User.findByIdAndUpdate(slot.mentorId, {
            $inc: { 'mentorProfile.totalSessions': 1 }
        });

        // Notification to user
        await Notification.createNotification(
            userId,
            'mentor_session',
            'Session Booked! 📅',
            `Your session is scheduled for ${scheduledAt.toLocaleDateString()}`,
            {
                icon: '📅',
                metadata: { sessionId: session._id }
            }
        );

        // Notification to mentor
        await Notification.createNotification(
            slot.mentorId,
            'mentor_session',
            'New Session Booked! 📅',
            `A user booked your slot on ${scheduledAt.toLocaleDateString()}`,
            {
                icon: '📅',
                link: `/mentor/dashboard`,
                metadata: { sessionId: session._id }
            }
        );

        res.status(201).json({
            success: true,
            message: 'Session booked successfully!',
            data: { session }
        });
    } catch (error) {
        console.error('Book Slot Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error booking slot'
        });
    }
};

// @desc    Get user's sessions
// @route   GET /api/mentors/sessions/my
// @access  Private (users)
export const getUserSessions = async (req, res) => {
    try {
        const sessions = await MentorSession.find({ userId: req.user.id })
            .populate('mentorId', 'fullName mentorSlug mentorProfile.headline profilePicture')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: { sessions }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching sessions'
        });
    }
};

// @desc    Get user's connected mentors
// @route   GET /api/mentors/connected
// @access  Private (users)
export const getConnectedMentors = async (req, res) => {
    try {
        const connections = await MentorConnection.find({
            userId: req.user.id,
            status: 'connected'
        }).populate(
            'mentorId',
            'fullName mentorSlug mentorProfile profilePicture mentorVerificationStatus'
        );

        const mentors = connections.map(c => c.mentorId);

        res.status(200).json({
            success: true,
            data: { mentors }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching connected mentors'
        });
    }
};

// ─── MENTOR SIDE ──────────────────────────────────────────

// @desc    Submit mentor onboarding
// @route   POST /api/mentors/onboarding
// @access  Private (mentors)
export const submitMentorOnboarding = async (req, res) => {
    try {
        const {
            headline, yearsOfExperience, currentRole,
            linkedinUrl, websiteUrl,
            primaryExpertise, industries, skills, tools,
            bio, targetMentees, sessionTypes,
            availableDays, hoursPerWeek, languages,
            achievements, businessesBuilt, notableClients, trustStatement
        } = req.body;

        if (req.user.role !== 'mentor') {
            return res.status(403).json({
                success: false,
                message: 'Only mentors can submit mentor onboarding'
            });
        }

        if (!headline || !bio || !primaryExpertise?.length) {
            return res.status(400).json({
                success: false,
                message: 'Headline, bio and expertise are required'
            });
        }

        const user = await User.findById(req.user.id);

        user.mentorProfile = {
            headline,
            yearsOfExperience: Number(yearsOfExperience) || 0,
            currentRole,
            linkedinUrl,
            websiteUrl,
            primaryExpertise: primaryExpertise || [],
            industries: industries || [],
            skills: skills || [],
            tools: tools || [],
            bio,
            targetMentees,
            sessionTypes: {
                qa: sessionTypes?.qa || false,
                videoCall: sessionTypes?.videoCall || false
            },
            availableDays: availableDays || [],
            hoursPerWeek: Number(hoursPerWeek) || 0,
            languages: languages || [],
            achievements: achievements || [],
            businessesBuilt: businessesBuilt || [],
            notableClients: notableClients || [],
            trustStatement,
            totalMentees: 0,
            totalSessions: 0,
            averageRating: 0,
            totalReviews: 0
        };

        user.mentorOnboardingCompleted = true;
        user.mentorVerificationStatus = 'pending';

        await user.save();

        // Update localStorage user data response
        res.status(200).json({
            success: true,
            message: 'Mentor profile submitted! Pending admin verification.',
            data: { user }
        });
    } catch (error) {
        console.error('Mentor Onboarding Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error saving mentor profile'
        });
    }
};

// @desc    Get mentor's own sessions
// @route   GET /api/mentors/dashboard/sessions
// @access  Private (mentors)
export const getMentorSessions = async (req, res) => {
    try {
        if (req.user.role !== 'mentor') {
            return res.status(403).json({
                success: false,
                message: 'Mentor access required'
            });
        }

        const { status } = req.query;
        let query = { mentorId: req.user.id };
        if (status) query.status = status;

        const sessions = await MentorSession.find(query)
            .populate('userId', 'fullName email profilePicture phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: { sessions }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching sessions'
        });
    }
};

// @desc    Approve or reject session request
// @route   PUT /api/mentors/sessions/:sessionId/respond
// @access  Private (mentors)
export const respondToSession = async (req, res) => {
    try {
        const { action, scheduledAt, rejectionReason } = req.body;
        // action: 'approve' | 'reject'

        const session = await MentorSession.findOne({
            _id: req.params.sessionId,
            mentorId: req.user.id
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        if (action === 'approve') {
            session.status = 'scheduled';
            session.scheduledAt = new Date(scheduledAt);

            // Generate Jitsi room for video calls
            if (session.type === 'video_call') {
                const jitsiRoomId = `entreSkill-${uuidv4().split('-')[0]}`;
                session.jitsiRoomId = jitsiRoomId;
                session.jitsiRoomUrl = `https://meet.jit.si/${jitsiRoomId}`;
            }

            // Update user progress
            const progress = await Progress.findOne({ userId: session.userId });
            if (progress) {
                progress.stats.mentorSessions =
                    (progress.stats.mentorSessions || 0) + 1;
                await progress.save();
            }

            // Update mentor stats
            await User.findByIdAndUpdate(req.user.id, {
                $inc: { 'mentorProfile.totalSessions': 1 }
            });

            // Notify user
            await Notification.createNotification(
                session.userId,
                'mentor_session',
                'Session Approved! ✅',
                `Your session request was approved. Scheduled for ${new Date(scheduledAt).toLocaleDateString()}`,
                {
                    icon: '✅',
                    metadata: { sessionId: session._id }
                }
            );

        } else if (action === 'reject') {
            session.status = 'rejected';
            session.rejectionReason = rejectionReason || 'Mentor is unavailable';

            // Notify user
            await Notification.createNotification(
                session.userId,
                'mentor_session',
                'Session Request Update',
                `Your session request was not approved. Reason: ${session.rejectionReason}`,
                {
                    icon: '❌',
                    metadata: { sessionId: session._id }
                }
            );
        }

        await session.save();

        res.status(200).json({
            success: true,
            message: action === 'approve'
                ? 'Session approved!'
                : 'Session rejected.',
            data: { session }
        });
    } catch (error) {
        console.error('Respond Session Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error responding to session'
        });
    }
};

// @desc    Add availability slot
// @route   POST /api/mentors/slots
// @access  Private (mentors)
export const addAvailabilitySlot = async (req, res) => {
    try {
        if (req.user.role !== 'mentor') {
            return res.status(403).json({
                success: false,
                message: 'Mentor access required'
            });
        }

        const { date, startTime, endTime, duration, sessionType } = req.body;

        if (!date || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: 'Date, start time and end time are required'
            });
        }

        const slot = await MentorAvailabilitySlot.create({
            mentorId: req.user.id,
            date: new Date(date),
            startTime,
            endTime,
            duration: Number(duration) || 60,
            sessionType: sessionType || 'both'
        });

        res.status(201).json({
            success: true,
            message: 'Availability slot added!',
            data: { slot }
        });
    } catch (error) {
        console.error('Add Slot Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding slot'
        });
    }
};

// @desc    Get mentor's own slots
// @route   GET /api/mentors/slots
// @access  Private (mentors)
export const getMentorSlots = async (req, res) => {
    try {
        if (req.user.role !== 'mentor') {
            return res.status(403).json({
                success: false,
                message: 'Mentor access required'
            });
        }

        const slots = await MentorAvailabilitySlot.find({
            mentorId: req.user.id,
            date: { $gte: new Date() }
        })
            .populate('bookedBy', 'fullName email')
            .sort({ date: 1 });

        res.status(200).json({
            success: true,
            data: { slots }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching slots'
        });
    }
};

// @desc    Delete an availability slot
// @route   DELETE /api/mentors/slots/:slotId
// @access  Private (mentors)
export const deleteSlot = async (req, res) => {
    try {
        const slot = await MentorAvailabilitySlot.findOne({
            _id: req.params.slotId,
            mentorId: req.user.id
        });

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: 'Slot not found'
            });
        }

        if (slot.isBooked) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete a booked slot'
            });
        }

        await slot.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Slot deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting slot'
        });
    }
};

// @desc    Complete a session
// @route   PUT /api/mentors/sessions/:sessionId/complete
// @access  Private (mentors)
export const completeSession = async (req, res) => {
    try {
        const { mentorNotes } = req.body;

        const session = await MentorSession.findOne({
            _id: req.params.sessionId,
            mentorId: req.user.id
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        session.status = 'completed';
        session.completedAt = new Date();
        if (mentorNotes) session.mentorNotes = mentorNotes;

        await session.save();

        // Notify user
        await Notification.createNotification(
            session.userId,
            'mentor_session',
            'Session Completed! 🎓',
            'Your mentorship session has been marked as completed.',
            {
                icon: '🎓',
                metadata: { sessionId: session._id }
            }
        );

        res.status(200).json({
            success: true,
            message: 'Session marked as completed!',
            data: { session }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error completing session'
        });
    }
};

// @desc    Get mentor dashboard stats
// @route   GET /api/mentors/dashboard/stats
// @access  Private (mentors)
export const getMentorStats = async (req, res) => {
    try {
        if (req.user.role !== 'mentor') {
            return res.status(403).json({
                success: false,
                message: 'Mentor access required'
            });
        }

        const mentorId = req.user.id;

        const [
            totalSessions,
            pendingSessions,
            scheduledSessions,
            completedSessions,
            totalConnections,
            totalResources,
            pendingResources
        ] = await Promise.all([
            MentorSession.countDocuments({ mentorId }),
            MentorSession.countDocuments({ mentorId, status: 'requested' }),
            MentorSession.countDocuments({ mentorId, status: 'scheduled' }),
            MentorSession.countDocuments({ mentorId, status: 'completed' }),
            MentorConnection.countDocuments({ mentorId, status: 'connected' }),
            // Resource counts will be added when we wire up resource model
            Promise.resolve(0),
            Promise.resolve(0)
        ]);

        const mentor = await User.findById(mentorId);

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalSessions,
                    pendingSessions,
                    scheduledSessions,
                    completedSessions,
                    totalConnections,
                    totalResources,
                    pendingResources,
                    averageRating: mentor.mentorProfile?.averageRating || 0,
                    totalReviews: mentor.mentorProfile?.totalReviews || 0
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching mentor stats'
        });
    }
};