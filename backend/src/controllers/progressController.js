import Progress from '../models/Progress.js';
import UserProgress from '../models/UserProgress.js';
import Roadmap from '../models/Roadmap.js';
import Notification from '../models/Notification.js';

// @desc    Get user dashboard data
// @route   GET /api/progress
// @access  Private
export const getProgress = async (req, res) => {
    try {
        let progress = await Progress.findOne({ userId: req.user.id });

        if (!progress) {
            progress = await Progress.initializeForUser(req.user.id);
        }

        // ─── Get all active roadmaps ───────────────────────
        const userRoadmaps = await UserProgress.find({
            userId: req.user.id
        })
            .populate({
                path: 'roadmapId',
                populate: {
                    path: 'businessId',
                    select: 'title slug icon category'
                }
            })
            .populate('businessId', 'title slug icon category')
            .sort({ updatedAt: -1 });

        // ─── Calculate overall progress ────────────────────
        let totalTasks = 0;
        let completedTasks = 0;
        let completedBusinesses = [];
        let activeBusinesses = [];

        for (const userRoadmap of userRoadmaps) {
            if (!userRoadmap.roadmapId) continue;

            const roadmap = userRoadmap.roadmapId;
            const roadmapTotalTasks = roadmap.stages?.reduce(
                (sum, stage) => sum + stage.tasks.length, 0
            ) || 0;
            const roadmapCompletedTasks = userRoadmap.completedTasks?.length || 0;
            const roadmapProgress = roadmapTotalTasks > 0
                ? Math.round((roadmapCompletedTasks / roadmapTotalTasks) * 100)
                : 0;

            totalTasks += roadmapTotalTasks;
            completedTasks += roadmapCompletedTasks;

            const businessData = {
                _id: userRoadmap._id,
                businessId: userRoadmap.businessId?._id,
                title: userRoadmap.businessId?.title || roadmap.businessId?.title,
                slug: userRoadmap.businessId?.slug || roadmap.businessId?.slug,
                icon: userRoadmap.businessId?.icon || roadmap.businessId?.icon,
                category: userRoadmap.businessId?.category || roadmap.businessId?.category,
                roadmapId: roadmap._id,
                roadmapTitle: roadmap.title,
                totalStages: roadmap.stages?.length || 0,
                totalTasks: roadmapTotalTasks,
                completedTasks: roadmapCompletedTasks,
                progress: roadmapProgress,
                currentStage: userRoadmap.currentStage || 1,
                startedAt: userRoadmap.startedAt,
                stages: roadmap.stages?.map(stage => ({
                    stageNumber: stage.stageNumber,
                    title: stage.title,
                    icon: stage.icon,
                    totalTasks: stage.tasks.length,
                    completedTasks: stage.tasks.filter(task =>
                        userRoadmap.completedTasks?.some(
                            ct => ct.taskId === task._id.toString()
                        )
                    ).length
                })) || []
            };

            if (roadmapProgress === 100) {
                completedBusinesses.push(businessData);
            } else {
                activeBusinesses.push(businessData);
            }
        }

        // ─── Overall progress calculation ──────────────────
        const overallProgress = totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0;

        // ─── Update streak ─────────────────────────────────
        progress.updateStreak();

        // ─── Stats ─────────────────────────────────────────
        const stats = {
            businessesStarted: userRoadmaps.length,
            resourcesCompleted: progress.stats?.resourcesCompleted || 0,
            mentorsConnected: progress.stats?.mentorsConnected || 0,
            mentorSessions: progress.stats?.mentorSessions || 0,
            completedBusinesses: completedBusinesses.length
        };

        // ─── Recent Activity ───────────────────────────────
        const recentActivity = progress.recentActivity || [];

        await progress.save();

        res.status(200).json({
            success: true,
            data: {
                progress: {
                    stats,
                    streak: progress.streak,
                    overallProgress,
                    totalTasks,
                    completedTasks,
                    activeBusinesses,
                    completedBusinesses,
                    recentActivity
                }
            }
        });
    } catch (error) {
        console.error('Get Progress Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching progress data'
        });
    }
};

// @desc    Update progress stats
// @route   PUT /api/progress/stats
// @access  Private
export const updateStats = async (req, res) => {
    try {
        const { type, value } = req.body;

        let progress = await Progress.findOne({ userId: req.user.id });
        if (!progress) {
            progress = await Progress.initializeForUser(req.user.id);
        }

        switch (type) {
            case 'bookmark':
                progress.stats.businessesBookmarked =
                    (progress.stats.businessesBookmarked || 0) + (value || 1);
                break;
            case 'resource':
                progress.stats.resourcesCompleted =
                    (progress.stats.resourcesCompleted || 0) + (value || 1);
                break;
            case 'mentor_connected':
                progress.stats.mentorsConnected =
                    (progress.stats.mentorsConnected || 0) + (value || 1);
                break;
            case 'session':
                progress.stats.mentorSessions =
                    (progress.stats.mentorSessions || 0) + (value || 1);
                break;
        }

        // Add to recent activity
        progress.recentActivity.unshift({
            action: `${type} updated`,
            icon: type,
            timestamp: new Date()
        });

        if (progress.recentActivity.length > 10) {
            progress.recentActivity = progress.recentActivity.slice(0, 10);
        }

        await progress.save();

        res.status(200).json({
            success: true,
            data: { progress }
        });
    } catch (error) {
        console.error('Update Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating progress'
        });
    }
};

// @desc    Mark task as complete (dashboard tasks)
// @route   PUT /api/progress/task/:taskId
// @access  Private
export const completeTask = async (req, res) => {
    try {
        const progress = await Progress.findOne({ userId: req.user.id });

        const task = progress.nextActions.id(req.params.taskId);
        if (task) {
            task.completed = true;
            await progress.save();

            // Create notification
            await Notification.createNotification(
                req.user.id,
                'task_completed',
                'Task Completed! ✅',
                `You completed: ${task.task}`,
                { icon: '✅' }
            );

            res.status(200).json({
                success: true,
                data: { progress }
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error completing task'
        });
    }
};