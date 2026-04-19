import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Award, CheckCircle2, ArrowRight, Trophy } from 'lucide-react';

const CompletedBusinesses = ({ completedBusinesses = [] }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Trophy size={22} className="text-yellow-500" />
                    Completed Businesses
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {completedBusinesses.length} completed
                </span>
            </div>

            {/* Content */}
            {completedBusinesses.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                >
                    <div className="text-5xl mb-4">🏆</div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        No completions yet!
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Complete all tasks in a roadmap to see it here
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {completedBusinesses.map((business, index) => (
                            <motion.div
                                key={business._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => navigate(`/business/${business.slug}`)}
                                className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl cursor-pointer hover:shadow-md transition-all group"
                            >
                                {/* Icon */}
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
                                    {business.icon || '💼'}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                        {business.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <CheckCircle2 size={13} className="text-green-500" />
                                        <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                                            All {business.totalTasks} tasks completed!
                                        </span>
                                    </div>
                                </div>

                                {/* 100% Badge */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <div className="px-3 py-1.5 bg-green-500 text-white rounded-xl text-xs font-black">
                                        100%
                                    </div>
                                    <ArrowRight
                                        size={16}
                                        className="text-gray-400 group-hover:text-green-500 transition-colors"
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default CompletedBusinesses;