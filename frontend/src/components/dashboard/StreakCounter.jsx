import { motion } from 'framer-motion';
import { Flame, Trophy, Zap } from 'lucide-react';

const StreakCounter = ({ current, longest }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden"
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Flame className="text-yellow-300" size={24} />
                        <h3 className="text-lg font-bold">Your Streak</h3>
                    </div>
                    <Zap size={20} className="text-yellow-300" />
                </div>

                {/* Current Streak */}
                <div className="text-center mb-4">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                        className="text-6xl font-black mb-2"
                    >
                        {current}
                    </motion.div>
                    <p className="text-sm opacity-90">Days in a row! 🔥</p>
                </div>

                {/* Divider */}
                <div className="border-t border-white/20 my-4"></div>

                {/* Longest Streak */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Trophy size={18} className="text-yellow-300" />
                        <span className="text-sm">Personal Best:</span>
                    </div>
                    <span className="text-xl font-bold">{longest} days</span>
                </div>

                {/* Motivational Text */}
                <div className="mt-4 p-3 bg-white/10 rounded-lg">
                    <p className="text-xs text-center">
                        {current === 0 && "Start your streak today! 💪"}
                        {current > 0 && current < 7 && "Keep it up! You're building momentum! 🚀"}
                        {current >= 7 && current < 30 && "Amazing! You're on fire! 🔥"}
                        {current >= 30 && "Legendary! You're unstoppable! 👑"}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default StreakCounter;