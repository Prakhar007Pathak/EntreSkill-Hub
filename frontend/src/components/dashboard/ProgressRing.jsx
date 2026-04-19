import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Target } from 'lucide-react';

const ProgressRing = ({ percentage, label, activeBusinesses = [] }) => {

    // Get current stage label dynamically from active businesses
    const getCurrentStageLabel = () => {
        if (!activeBusinesses || activeBusinesses.length === 0) {
            return 'No active roadmaps yet';
        }

        // Find the most recently updated business
        const activeBusiness = activeBusinesses[0];
        if (!activeBusiness) return 'Start your first roadmap!';

        const currentStageData = activeBusiness.stages?.find(
            s => s.stageNumber === activeBusiness.currentStage
        );

        if (currentStageData) {
            const stageProgress = activeBusiness.totalTasks > 0
                ? Math.round((activeBusiness.completedTasks / activeBusiness.totalTasks) * 100)
                : 0;
            return `${currentStageData.title} • ${stageProgress}%`;
        }

        return activeBusiness.title || 'Active Roadmap';
    };

    // Get milestone labels from active businesses stages
    const getMilestones = () => {
        if (!activeBusinesses || activeBusinesses.length === 0) {
            return [
                { label: 'Start First Roadmap', threshold: 0 },
                { label: 'Building Momentum', threshold: 25 },
                { label: 'Halfway Through', threshold: 50 },
                { label: 'Almost There', threshold: 75 },
                { label: 'All Complete!', threshold: 100 }
            ];
        }

        // Use stages from first active business
        const firstBusiness = activeBusinesses[0];
        if (firstBusiness?.stages && firstBusiness.stages.length > 0) {
            return firstBusiness.stages.map((stage, index) => ({
                label: stage.title,
                threshold: Math.round(((index) / firstBusiness.stages.length) * 100),
                completedTasks: stage.completedTasks,
                totalTasks: stage.totalTasks,
                stageNumber: stage.stageNumber
            }));
        }

        return [
            { label: 'Getting Started', threshold: 0 },
            { label: 'In Progress', threshold: 50 },
            { label: 'Completed!', threshold: 100 }
        ];
    };

    const milestones = getMilestones();
    const currentStageLabel = getCurrentStageLabel();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
        >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                {label}
            </h3>

            {/* Current stage label */}
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-5 px-2 line-clamp-1">
                {currentStageLabel}
            </p>

            {/* Progress Ring */}
            <div className="max-w-[180px] mx-auto mb-6">
                <CircularProgressbar
                    value={percentage}
                    text={`${percentage}%`}
                    styles={buildStyles({
                        rotation: 0.25,
                        strokeLinecap: 'round',
                        textSize: '18px',
                        pathTransitionDuration: 2,
                        pathColor: `url(#gradient)`,
                        textColor: '#3b82f6',
                        trailColor: '#e5e7eb',
                    })}
                />
                {/* Gradient Definition */}
                <svg style={{ height: 0 }}>
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Stage Milestones */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {milestones.map((milestone, index) => {
                    const isReached = percentage >= milestone.threshold;
                    const isCurrent = index === milestones.findIndex(
                        (m, i) => percentage >= m.threshold &&
                            (i === milestones.length - 1 || percentage < milestones[i + 1]?.threshold)
                    );

                    return (
                        <div
                            key={index}
                            className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${isReached
                                ? 'bg-green-50 dark:bg-green-900/20'
                                : 'bg-gray-50 dark:bg-gray-700/20'
                                } ${isCurrent ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''}`}
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isReached
                                    ? 'bg-green-500'
                                    : 'bg-gray-300 dark:bg-gray-600'
                                    }`}>
                                    {isReached && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`text-xs font-medium truncate ${isReached
                                    ? 'text-green-700 dark:text-green-400'
                                    : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {milestone.label}
                                </span>
                            </div>

                            {/* Stage progress if available */}
                            {milestone.totalTasks !== undefined && (
                                <span className={`text-xs font-bold flex-shrink-0 ml-2 ${isReached
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-400'
                                    }`}>
                                    {milestone.completedTasks}/{milestone.totalTasks}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default ProgressRing;