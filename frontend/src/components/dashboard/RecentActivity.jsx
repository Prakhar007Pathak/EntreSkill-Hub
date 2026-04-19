import { motion } from 'framer-motion';
import {
    Bookmark, PlayCircle, Users, Award,
    CheckCircle, Target, Zap, Bell
} from 'lucide-react';

const RecentActivity = ({ activities }) => {
    const getIconConfig = (type) => {
        switch (type) {
            case 'bookmark':
                return {
                    icon: Bookmark,
                    bg: 'bg-blue-100 dark:bg-blue-900/30',
                    color: 'text-blue-500'
                };
            case 'resource':
                return {
                    icon: PlayCircle,
                    bg: 'bg-green-100 dark:bg-green-900/30',
                    color: 'text-green-500'
                };
            case 'session':
                return {
                    icon: Users,
                    bg: 'bg-purple-100 dark:bg-purple-900/30',
                    color: 'text-purple-500'
                };
            case 'badge':
                return {
                    icon: Award,
                    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
                    color: 'text-yellow-500'
                };
            case 'task_completed':
                return {
                    icon: CheckCircle,
                    bg: 'bg-green-100 dark:bg-green-900/30',
                    color: 'text-green-500'
                };
            case 'roadmap_started':
                return {
                    icon: Target,
                    bg: 'bg-blue-100 dark:bg-blue-900/30',
                    color: 'text-blue-500'
                };
            case 'mentor_connected':
                return {
                    icon: Users,
                    bg: 'bg-purple-100 dark:bg-purple-900/30',
                    color: 'text-purple-500'
                };
            default:
                return {
                    icon: Zap,
                    bg: 'bg-gray-100 dark:bg-gray-700',
                    color: 'text-gray-500'
                };
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString();
    };

    // Group activities by date
    const groupByDate = (activities) => {
        const groups = {};
        activities.forEach(activity => {
            const date = new Date(activity.timestamp);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let label;
            if (date.toDateString() === today.toDateString()) {
                label = 'Today';
            } else if (date.toDateString() === yesterday.toDateString()) {
                label = 'Yesterday';
            } else {
                label = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
            }

            if (!groups[label]) groups[label] = [];
            groups[label].push(activity);
        });
        return groups;
    };

    const grouped = groupByDate(activities || []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
        >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Recent Activity
            </h3>

            {activities?.length === 0 || !activities ? (
                <div className="text-center py-8">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        No activity yet
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        Start exploring to see your activity here
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([dateLabel, dateActivities]) => (
                        <div key={dateLabel}>
                            {/* Date Label */}
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    {dateLabel}
                                </span>
                                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                            </div>

                            {/* Activities */}
                            <div className="space-y-3">
                                {dateActivities.map((activity, index) => {
                                    const config = getIconConfig(activity.icon);
                                    const IconComponent = config.icon;

                                    return (
                                        <motion.div
                                            key={activity._id || index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-start gap-3"
                                        >
                                            {/* Icon */}
                                            <div className={`flex-shrink-0 w-9 h-9 ${config.bg} rounded-xl flex items-center justify-center`}>
                                                <IconComponent size={16} className={config.color} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 pt-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                                    {activity.action}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {getTimeAgo(activity.timestamp)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default RecentActivity;