import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, color = 'blue', delay = 0, suffix = '' }) => {

    const colorClasses = {
        blue: 'from-blue-500 to-cyan-500',
        purple: 'from-purple-500 to-pink-500',
        green: 'from-green-500 to-emerald-500',
        orange: 'from-orange-500 to-red-500',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden group"
        >
            {/* Background gradient on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

            <div className="relative z-10">
                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="text-white" size={24} />
                </div>

                {/* Value */}
                <div className="mb-1">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                        {value}
                    </span>
                    {suffix && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                            {suffix}
                        </span>
                    )}
                </div>

                {/* Label */}
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {label}
                </p>
            </div>

            {/* Decorative circle */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${colorClasses[color]} rounded-full opacity-10`} />
        </motion.div>
    );
};

export default StatCard;