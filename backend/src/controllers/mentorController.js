import User from '../models/User.js';
import MentorSession from '../models/MentorSession.js';
import MentorConnection from '../models/MentorConnection.js';
import MentorAvailabilitySlot from '../models/MentorAvailabilitySlot.js';
import Progress from '../models/Progress.js';
import Notification from '../models/Notification.js';
import Resource from '../models/Resource.js';
import { v4 as uuidv4 } from 'uuid';

// ─── Helper ────────────────────────────────────────────────
const checkMentorApproved = (user, res) => {
    if (user.mentorVerificationStatus !== 'approved') {
        res.status(403).json({
            success: false,
            message: 'Your mentor account is pending approval'
        });
        return false;
    }
    return true;
};

// ═══════════════════════════════════════════════════════════
// ─── USER SIDE ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

export const getMentors = async (req, res) => {
    try {
        const {
            search, expertise, industry,
            language, sessionType,
            page = 1, limit = 12
        } = req.query;

        let query = {
            role: 'mentor',
            mentorVerificationStatus: 'approved',
            mentorOnboardingCompleted: true,
            isActive: true
        };

        if (search) query.$text = { $search: search };
        if (expertise) query['mentorProfile.primaryExpertise'] = { $in: [expertise] };
        if (industry) query['mentorProfile.industries'] = { $in: [industry] };
        if (language) query['mentorProfile.languages'] = { $in: [language] };
        if (sessionType === 'qa') query['mentorProfile.sessionTypes.qa'] = true;
        if (sessionType === 'video_call') query['mentorProfile.sessionTypes.videoCall'] = true;

        const mentors = await User.find(query)
            .select('fullName email profilePicture mentorSlug mentorProfile location createdAt')
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
        res.status(500).json({ success: false, message: 'Error fetching mentors' });
    }
};

export const getMentorBySlug = async (req, res) => {
    try {
        const mentor = await User.findOne({
            mentorSlug: req.params.mentorSlug,
            role: 'mentor',
            mentorVerificationStatus: 'approved'
        }).select('fullName email profilePicture mentorSlug mentorProfile location createdAt');

        if (!mentor) {
            return res.status(404).json({ success: false, message: 'Mentor not found' });
        }

        let isConnected = false;
        if (req.user) {
            const connection = await MentorConnection.findOne({
                userId: req.user.id,
                mentorId: mentor._id,
                status: 'connected'
            });
            isConnected = !!connection;
        }

        const availableSlots = await MentorAvailabilitySlot.find({
            mentorId: mentor._id,
            isBooked: false,
            date: { $gte: new Date() }
        }).sort({ date: 1 }).limit(10);

        res.status(200).json({
            success: true,
            data: { mentor, isConnected, availableSlots }
        });
    } catch (error) {
        console.error('Get Mentor Error:', error);
        res.status(500).json({ success: false, message: 'Error fetching mentor' });
    }
};

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
            return res.status(404).json({ success: false, message: 'Mentor not found' });
        }

        const existing = await MentorConnection.findOne({ userId, mentorId });

        if (existing) {
            if (existing.status === 'connected') {
                existing.status = 'disconnected';
                await existing.save();

                await User.findByIdAndUpdate(mentorId, {
                    $inc: { 'mentorProfile.totalMentees': -1 }
                });

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
                existing.status = 'connected';
                existing.connectedAt = new Date();
                await existing.save();
            }
        } else {
            await MentorConnection.create({ userId, mentorId });
        }

        await User.findByIdAndUpdate(mentorId, {
            $inc: { 'mentorProfile.totalMentees': 1 }
        });

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
        res.status(500).json({ success: false, message: 'Error connecting with mentor' });
    }
};

export const requestSession = async (req, res) => {
    try {
        const { mentorId } = req.params;
        const { type, topic, message, preferredTimes } = req.body;
        const userId = req.user.id;

        if (!['qa', 'video_call'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Session type must be qa or video_call'
            });
        }

        if (!topic) {
            return res.status(400).json({
                success: false,
                message: 'Topic is required'
            });
        }

        const mentor = await User.findOne({
            _id: mentorId,
            role: 'mentor',
            mentorVerificationStatus: 'approved'
        });

        if (!mentor) {
            return res.status(404).json({ success: false, message: 'Mentor not found' });
        }

        if (type === 'qa' && !mentor.mentorProfile?.sessionTypes?.qa) {
            return res.status(400).json({
                success: false,
                message: 'This mentor does not offer Q&A sessions'
            });
        }

        if (type === 'video_call' && !mentor.mentorProfile?.sessionTypes?.videoCall) {
            return res.status(400).json({
                success: false,
                message: 'This mentor does not offer Video Call sessions'
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
        res.status(500).json({ success: false, message: 'Error requesting session' });
    }
};

export const bookSlot = async (req, res) => {
    try {
        const { slotId } = req.params;
        const { type, topic, message } = req.body;
        const userId = req.user.id;

        const slot = await MentorAvailabilitySlot.findById(slotId);
        if (!slot || slot.isBooked) {
            return res.status(400).json({ success: false, message: 'Slot not available' });
        }

        // Fix: validate session type properly
        let finalType = type;
        if (slot.sessionType === 'both') {
            if (!type || !['qa', 'video_call'].includes(type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Please specify session type: qa or video_call'
                });
            }
            finalType = type;
        } else {
            finalType = slot.sessionType;
        }

        const scheduledAt = new Date(slot.date);
        const [hours, minutes] = slot.startTime.split(':');
        scheduledAt.setHours(Number(hours), Number(minutes));

        // Fix: Jitsi only for video calls
        let jitsiRoomId = null;
        let jitsiRoomUrl = null;
        if (finalType === 'video_call') {
            jitsiRoomId = `entreSkill-${uuidv4().split('-')[0]}`;
            jitsiRoomUrl = `https://meet.jit.si/${jitsiRoomId}`;
        }

        const session = await MentorSession.create({
            mentorId: slot.mentorId,
            userId,
            type: finalType,
            bookingType: 'slot_booking',
            status: 'scheduled',
            topic: topic || 'Session',
            message,
            scheduledAt,
            duration: slot.duration,
            jitsiRoomId,
            jitsiRoomUrl
        });

        slot.isBooked = true;
        slot.bookedBy = userId;
        slot.sessionId = session._id;
        await slot.save();

        const progress = await Progress.findOne({ userId });
        if (progress) {
            progress.stats.mentorSessions =
                (progress.stats.mentorSessions || 0) + 1;
            await progress.save();
        }

        await User.findByIdAndUpdate(slot.mentorId, {
            $inc: { 'mentorProfile.totalSessions': 1 }
        });

        await Notification.createNotification(
            userId,
            'mentor_session',
            'Session Booked! 📅',
            `Your session is scheduled for ${scheduledAt.toLocaleDateString()}`,
            { icon: '📅', metadata: { sessionId: session._id } }
        );

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
        res.status(500).json({ success: false, message: 'Error booking slot' });
    }
};

export const getUserSessions = async (req, res) => {
    try {
        let query = { userId: req.user.id };
        if (req.params.sessionId) {
            query._id = req.params.sessionId;
        }

        const sessions = await MentorSession.find(query)
            .populate('mentorId', 'fullName mentorSlug mentorProfile.headline profilePicture')
            .populate('userId', 'fullName email profilePicture')
            .sort({ createdAt: -1 });

        if (req.params.sessionId) {
            if (!sessions.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Session not found'
                });
            }
            return res.status(200).json({
                success: true,
                data: { session: sessions[0] }
            });
        }

        res.status(200).json({
            success: true,
            data: { sessions }
        });
    } catch (error) {
        console.error('Get User Sessions Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sessions'
        });
    }
};

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

// ═══════════════════════════════════════════════════════════
// ─── MENTOR SIDE ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════

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
            // Preserve existing stats
            totalMentees: user.mentorProfile?.totalMentees || 0,
            totalSessions: user.mentorProfile?.totalSessions || 0,
            averageRating: user.mentorProfile?.averageRating || 0,
            totalReviews: user.mentorProfile?.totalReviews || 0
        };

        user.mentorOnboardingCompleted = true;
        user.mentorVerificationStatus = 'pending';
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Mentor profile submitted! Pending admin verification.',
            data: { user }
        });
    } catch (error) {
        console.error('Mentor Onboarding Error:', error);
        res.status(500).json({ success: false, message: 'Error saving mentor profile' });
    }
};

export const getMentorSessions = async (req, res) => {
    try {
        if (!checkMentorApproved(req.user, res)) return;

        let query = { mentorId: req.user.id };

        if (req.params.sessionId) {
            query._id = req.params.sessionId;
        } else if (req.query.status) {
            query.status = req.query.status;
        }

        const sessions = await MentorSession.find(query)
            .populate('userId', 'fullName email profilePicture phone')
            .sort({ createdAt: -1 });

        if (req.params.sessionId) {
            if (!sessions.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Session not found'
                });
            }
            return res.status(200).json({
                success: true,
                data: { session: sessions[0] }
            });
        }

        res.status(200).json({
            success: true,
            data: { sessions }
        });
    } catch (error) {
        console.error('Get Mentor Sessions Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sessions'
        });
    }
};

export const respondToSession = async (req, res) => {
    try {
        if (!checkMentorApproved(req.user, res)) return;

        const { action, scheduledAt, rejectionReason } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Action must be approve or reject'
            });
        }

        if (action === 'approve' && !scheduledAt) {
            return res.status(400).json({
                success: false,
                message: 'scheduledAt is required when approving'
            });
        }

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

            // Jitsi only for video calls
            if (session.type === 'video_call') {
                const jitsiRoomId = `entreSkill-${uuidv4().split('-')[0]}`;
                session.jitsiRoomId = jitsiRoomId;
                session.jitsiRoomUrl = `https://meet.jit.si/${jitsiRoomId}`;
            }

            const progress = await Progress.findOne({ userId: session.userId });
            if (progress) {
                progress.stats.mentorSessions =
                    (progress.stats.mentorSessions || 0) + 1;
                await progress.save();
            }

            await User.findByIdAndUpdate(req.user.id, {
                $inc: { 'mentorProfile.totalSessions': 1 }
            });

            await Notification.createNotification(
                session.userId,
                'mentor_session',
                'Session Approved! ✅',
                `Your session is scheduled for ${new Date(scheduledAt).toLocaleDateString()}`,
                { icon: '✅', metadata: { sessionId: session._id } }
            );
        } else {
            session.status = 'rejected';
            session.rejectionReason = rejectionReason || 'Mentor is unavailable';

            await Notification.createNotification(
                session.userId,
                'mentor_session',
                'Session Request Update',
                `Your session was not approved. Reason: ${session.rejectionReason}`,
                { icon: '❌', metadata: { sessionId: session._id } }
            );
        }

        await session.save();

        res.status(200).json({
            success: true,
            message: action === 'approve' ? 'Session approved!' : 'Session rejected.',
            data: { session }
        });
    } catch (error) {
        console.error('Respond Session Error:', error);
        res.status(500).json({ success: false, message: 'Error responding to session' });
    }
};

export const addAvailabilitySlot = async (req, res) => {
    try {
        if (!checkMentorApproved(req.user, res)) return;

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
        res.status(500).json({ success: false, message: 'Error adding slot' });
    }
};

export const getMentorSlots = async (req, res) => {
    try {
        if (!checkMentorApproved(req.user, res)) return;

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
        res.status(500).json({ success: false, message: 'Error fetching slots' });
    }
};

export const deleteSlot = async (req, res) => {
    try {
        if (!checkMentorApproved(req.user, res)) return;

        const slot = await MentorAvailabilitySlot.findOne({
            _id: req.params.slotId,
            mentorId: req.user.id
        });

        if (!slot) {
            return res.status(404).json({ success: false, message: 'Slot not found' });
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
        res.status(500).json({ success: false, message: 'Error deleting slot' });
    }
};

export const completeSession = async (req, res) => {
    try {
        if (!checkMentorApproved(req.user, res)) return;

        const { mentorNotes } = req.body;

        const session = await MentorSession.findOne({
            _id: req.params.sessionId,
            mentorId: req.user.id
        });

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        session.status = 'completed';
        session.completedAt = new Date();
        if (mentorNotes) session.mentorNotes = mentorNotes;
        await session.save();

        await Notification.createNotification(
            session.userId,
            'mentor_session',
            'Session Completed! 🎓',
            'Your mentorship session has been marked as completed.',
            { icon: '🎓', metadata: { sessionId: session._id } }
        );

        res.status(200).json({
            success: true,
            message: 'Session marked as completed!',
            data: { session }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error completing session' });
    }
};

export const getMentorStats = async (req, res) => {
    try {
        if (!checkMentorApproved(req.user, res)) return;

        const mentorId = req.user.id;

        const [
            totalSessions,
            pendingSessions,
            scheduledSessions,
            completedSessions,
            totalConnections,
            totalResources,      // ✅ FIXED: use uploadedBy field
            pendingResources     // ✅ FIXED: use uploadedBy field
        ] = await Promise.all([
            MentorSession.countDocuments({ mentorId }),
            MentorSession.countDocuments({ mentorId, status: 'requested' }),
            MentorSession.countDocuments({ mentorId, status: 'scheduled' }),
            MentorSession.countDocuments({ mentorId, status: 'completed' }),
            MentorConnection.countDocuments({ mentorId, status: 'connected' }),
            Resource.countDocuments({ uploadedBy: mentorId, status: 'approved' }),
            Resource.countDocuments({ uploadedBy: mentorId, status: 'pending' })
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
        res.status(500).json({ success: false, message: 'Error fetching mentor stats' });
    }
};

// ─── Q&A INTERACTION ──────────────────────────────────────

export const addQuestionToSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { question } = req.body;
        const userId = req.user.id;

        if (!question || question.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Question cannot be empty'
            });
        }

        const session = await MentorSession.findOne({ _id: sessionId, userId });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found or you are not the owner'
            });
        }

        if (session.type !== 'qa') {
            return res.status(400).json({
                success: false,
                message: 'This is not a Q&A session'
            });
        }

        if (session.status !== 'scheduled') {
            return res.status(400).json({
                success: false,
                message: 'Q&A session must be scheduled to add questions'
            });
        }

        session.questions.push({
            question: question.trim(),
            answer: null,
            answeredAt: null
        });
        await session.save();

        const mentor = await User.findById(session.mentorId);
        if (mentor) {
            await Notification.createNotification(
                mentor._id,
                'new_question',
                'New Question in Q&A Session! 💬',
                `${req.user.fullName} asked a new question in session "${session.topic}".`,
                {
                    icon: '💬',
                    link: `/qa-room/${session._id}`
                }
            );
        }

        res.status(201).json({
            success: true,
            message: 'Question added successfully',
            data: { session }
        });
    } catch (error) {
        console.error('Add Question Error:', error);
        res.status(500).json({ success: false, message: 'Error adding question' });
    }
};

export const answerQuestionInSession = async (req, res) => {
    try {
        const { sessionId, questionIndex } = req.params;
        const { answer } = req.body;
        const mentorId = req.user.id;

        if (!answer || answer.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Answer cannot be empty'
            });
        }

        const session = await MentorSession.findOne({ _id: sessionId, mentorId });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found or you are not the mentor'
            });
        }

        if (session.type !== 'qa') {
            return res.status(400).json({
                success: false,
                message: 'This is not a Q&A session'
            });
        }

        if (session.status !== 'scheduled') {
            return res.status(400).json({
                success: false,
                message: 'Q&A session must be scheduled to answer questions'
            });
        }

        const idx = Number(questionIndex);

        if (idx < 0 || idx >= session.questions.length) {
            return res.status(400).json({
                success: false,
                message: 'Invalid question index'
            });
        }

        if (session.questions[idx].answer) {
            return res.status(400).json({
                success: false,
                message: 'Question already answered'
            });
        }

        session.questions[idx].answer = answer.trim();
        session.questions[idx].answeredAt = new Date();
        await session.save();

        const sessionUser = await User.findById(session.userId);
        if (sessionUser) {
            await Notification.createNotification(
                sessionUser._id,
                'question_answered',
                'Question Answered! ✅',
                `Your question in session "${session.topic}" was answered by ${req.user.fullName}.`,
                {
                    icon: '✅',
                    link: `/qa-room/${session._id}`
                }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Answer added successfully',
            data: { session }
        });
    } catch (error) {
        console.error('Answer Question Error:', error);
        res.status(500).json({ success: false, message: 'Error answering question' });
    }
};