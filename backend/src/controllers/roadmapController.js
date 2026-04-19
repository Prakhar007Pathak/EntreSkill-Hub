import Roadmap from '../models/Roadmap.js';
import UserProgress from '../models/UserProgress.js';
import Business from '../models/Business.js';
import Notification from '../models/Notification.js';


// @desc    Get roadmap by business slug
// @route   GET /api/roadmaps/:businessSlug
// @access  Public
export const getRoadmapByBusiness = async (req, res) => {
    try {
        const business = await Business.findOne({
            slug: req.params.businessSlug,
            isActive: true
        });

        if (!business) {
            return res.status(404).json({
                success: false,
                message: 'Business not found'
            });
        }

        const roadmap = await Roadmap.findOne({
            businessId: business._id,
            isActive: true
        }).populate('businessId');

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: 'Roadmap not found for this business'
            });
        }

        // Get user progress if authenticated
        let userProgress = null;
        if (req.user) {
            userProgress = await UserProgress.findOne({
                userId: req.user.id,
                roadmapId: roadmap._id
            });
        }

        res.status(200).json({
            success: true,
            data: {
                roadmap,
                userProgress
            }
        });
    } catch (error) {
        console.error('Get Roadmap Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching roadmap'
        });
    }
};

// @desc    Start/Resume roadmap progress
// @route   POST /api/roadmaps/:roadmapId/start
// @access  Private
export const startRoadmap = async (req, res) => {
    try {
        const roadmap = await Roadmap.findById(req.params.roadmapId);

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: 'Roadmap not found'
            });
        }

        // Check if already started
        let userProgress = await UserProgress.findOne({
            userId: req.user.id,
            roadmapId: roadmap._id
        });

        if (userProgress) {
            return res.status(200).json({
                success: true,
                message: 'Roadmap already in progress',
                data: { userProgress }
            });
        }

        // Create new progress
        userProgress = await UserProgress.create({
            userId: req.user.id,
            roadmapId: roadmap._id,
            businessId: roadmap.businessId,
            currentStage: 1,
            completedTasks: [],
            overallProgress: 0
        });

        // Get business details for notification
        const business = await Business.findById(roadmap.businessId);

        // Create notification
        await Notification.createNotification(
            req.user.id,
            'roadmap_started',
            'Roadmap Started! 🚀',
            `You started the roadmap for "${business?.title || 'your business'}"`,
            {
                icon: '🚀',
                link: `/roadmap/${business?.slug}`,
                metadata: { businessId: business?._id, roadmapId: roadmap._id }
            }
        );

        res.status(201).json({
            success: true,
            message: 'Roadmap started successfully!',
            data: { userProgress }
        });
    } catch (error) {
        console.error('Start Roadmap Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error starting roadmap'
        });
    }
};

// @desc    Mark task as complete
// @route   POST /api/roadmaps/:roadmapId/task/:taskId/complete
// @access  Private
export const completeTask = async (req, res) => {
    try {
        const { roadmapId, taskId } = req.params;

        const roadmap = await Roadmap.findById(roadmapId);
        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: 'Roadmap not found'
            });
        }

        let userProgress = await UserProgress.findOne({
            userId: req.user.id,
            roadmapId
        });

        if (!userProgress) {
            return res.status(404).json({
                success: false,
                message: 'Please start the roadmap first'
            });
        }

        // Check if task already completed
        const alreadyCompleted = userProgress.completedTasks.some(
            task => task.taskId === taskId
        );

        if (alreadyCompleted) {
            return res.status(400).json({
                success: false,
                message: 'Task already completed'
            });
        }

        // Add to completed tasks
        userProgress.completedTasks.push({
            taskId,
            completedAt: new Date()
        });

        // Calculate total tasks and completed percentage
        let totalTasks = 0;
        roadmap.stages.forEach(stage => {
            totalTasks += stage.tasks.length;
        });

        const completedCount = userProgress.completedTasks.length;
        userProgress.overallProgress = Math.round((completedCount / totalTasks) * 100);

        await userProgress.save();

        // Create notification
        await Notification.createNotification(
            req.user.id,
            'task_completed',
            'Task Completed! ✅',
            `Great job completing a task! Keep going!`,
            {
                icon: '✅',
                metadata: { taskId, roadmapId }
            }
        );

        // Check if stage completed
        const currentStageData = roadmap.stages.find(
            s => s.stageNumber === userProgress.currentStage
        );
        if (currentStageData) {
            const stageTaskIds = currentStageData.tasks.map(t => t._id.toString());
            const allStageDone = stageTaskIds.every(id =>
                userProgress.completedTasks.some(ct => ct.taskId === id)
            );

            if (allStageDone) {
                // Stage completed notification
                await Notification.createNotification(
                    req.user.id,
                    'roadmap_milestone',
                    `Stage ${userProgress.currentStage} Completed! 🏆`,
                    `You completed "${currentStageData.title}"! Move to the next stage!`,
                    {
                        icon: '🏆',
                        metadata: { stageNumber: userProgress.currentStage }
                    }
                );

                // Update current stage
                if (userProgress.currentStage < roadmap.stages.length) {
                    userProgress.currentStage += 1;
                    await userProgress.save();
                }
            }
        }

        // Check if entire roadmap completed
        if (userProgress.overallProgress === 100) {
            const business = await Business.findById(userProgress.businessId);
            await Notification.createNotification(
                req.user.id,
                'roadmap_completed',
                'Roadmap Completed! 🎉',
                `Congratulations! You completed the roadmap for "${business?.title}"!`,
                {
                    icon: '🎉',
                    link: `/business/${business?.slug}`,
                    metadata: { businessId: business?._id }
                }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Task completed! 🎉',
            data: { userProgress }
        });
    } catch (error) {
        console.error('Complete Task Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error completing task'
        });
    }
};

// @desc    Add note to stage
// @route   POST /api/roadmaps/:roadmapId/stage/:stageNumber/note
// @access  Private
export const addNote = async (req, res) => {
    try {
        const { roadmapId, stageNumber } = req.params;
        const { note } = req.body;

        let userProgress = await UserProgress.findOne({
            userId: req.user.id,
            roadmapId
        });

        if (!userProgress) {
            return res.status(404).json({
                success: false,
                message: 'Please start the roadmap first'
            });
        }

        userProgress.notes.push({
            stageNumber: Number(stageNumber),
            note
        });

        await userProgress.save();

        res.status(200).json({
            success: true,
            message: 'Note added successfully',
            data: { userProgress }
        });
    } catch (error) {
        console.error('Add Note Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding note'
        });
    }
};

// @desc    Get user's active roadmaps
// @route   GET /api/roadmaps/user/active
// @access  Private
export const getUserRoadmaps = async (req, res) => {
    try {
        const userRoadmaps = await UserProgress.find({ userId: req.user.id })
            .populate('roadmapId')
            .populate('businessId')
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            data: { roadmaps: userRoadmaps }
        });
    } catch (error) {
        console.error('Get User Roadmaps Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching roadmaps'
        });
    }
};