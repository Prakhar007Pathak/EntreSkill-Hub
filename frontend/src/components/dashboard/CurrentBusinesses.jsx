import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp, CheckSquare, Flag, ArrowRight,
    Sparkles, Clock
} from 'lucide-react';

const CurrentBusinesses = ({ businesses = [] }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Running Businesses
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {businesses.length} active
                </span>
            </div>

            {/* Business List */}
            {businesses.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                >
                    <div className="text-5xl mb-4">🚀</div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        No active businesses yet!
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-5">
                        Start a roadmap to track your business journey
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/businesses')}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
                    >
                        <Sparkles size={16} />
                        Explore Business Ideas
                    </motion.button>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {businesses.map((business, index) => (
                            <motion.div
                                key={business._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.08 }}
                                onClick={() => navigate(`/business/${business.slug}`)}
                                className="group p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition-all hover:shadow-md bg-gray-50/50 dark:bg-gray-700/30"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Business Icon */}
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                                        {business.icon || '💼'}
                                    </div>

                                    {/* Business Info */}
                                    <div className="flex-1 min-w-0">
                                        {/* Title & Arrow */}
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {business.title}
                                            </h4>
                                            <ArrowRight
                                                size={16}
                                                className="text-gray-400 group-hover:text-blue-500 flex-shrink-0 transition-colors"
                                            />
                                        </div>

                                        {/* Stats Row */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <Flag size={11} />
                                                <span>{business.totalStages} Stages</span>
                                            </div>
                                            <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <CheckSquare size={11} />
                                                <span>
                                                    {business.completedTasks}/{business.totalTasks} Tasks
                                                </span>
                                            </div>
                                            <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <Clock size={11} />
                                                <span>Stage {business.currentStage}</span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${business.progress}%` }}
                                                    transition={{ duration: 1, delay: index * 0.1 }}
                                                    className={`h-full rounded-full ${business.progress === 100
                                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                                        : 'bg-gradient-to-r from-blue-500 to-purple-600'
                                                        }`}
                                                />
                                            </div>
                                            <span className={`text-xs font-bold flex-shrink-0 ${business.progress === 100
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-blue-600 dark:text-blue-400'
                                                }`}>
                                                {business.progress}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stage Progress Details */}
                                {business.stages && business.stages.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex gap-1.5">
                                            {business.stages.map((stage) => {
                                                const stagePercent = stage.totalTasks > 0
                                                    ? Math.round((stage.completedTasks / stage.totalTasks) * 100)
                                                    : 0;
                                                const isActive = stage.stageNumber === business.currentStage;
                                                const isComplete = stagePercent === 100;

                                                return (
                                                    <div
                                                        key={stage.stageNumber}
                                                        className="flex-1"
                                                        title={`${stage.title}: ${stage.completedTasks}/${stage.totalTasks}`}
                                                    >
                                                        <div className={`h-1.5 rounded-full ${isComplete
                                                            ? 'bg-green-500'
                                                            : isActive
                                                                ? 'bg-blue-500'
                                                                : stagePercent > 0
                                                                    ? 'bg-blue-300 dark:bg-blue-700'
                                                                    : 'bg-gray-200 dark:bg-gray-700'
                                                            }`}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                                            {business.stages.find(s => s.stageNumber === business.currentStage)?.title || 'In Progress'}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* View All Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/businesses')}
                        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 dark:hover:border-blue-600 dark:hover:text-blue-400 transition-all font-semibold text-sm flex items-center justify-center gap-2"
                    >
                        <Sparkles size={16} />
                        Explore More Business Ideas
                    </motion.button>
                </div>
            )}
        </motion.div>
    );
};

export default CurrentBusinesses;