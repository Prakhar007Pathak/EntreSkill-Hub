import { motion } from 'framer-motion';
import { Bookmark, TrendingUp, DollarSign, Clock, Users, Star } from 'lucide-react';
import { useState } from 'react';

const BusinessCard = ({ business, onBookmark, isBookmarked = false }) => {
    const [bookmarked, setBookmarked] = useState(isBookmarked);
    const [bookmarking, setBookmarking] = useState(false);

    const handleBookmark = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setBookmarking(true);
        try {
            await onBookmark(business._id);
            setBookmarked(!bookmarked);
        } catch (error) {
            console.error('Bookmark error:', error);
        } finally {
            setBookmarking(false);
        }
    };

    const difficultyColors = {
        Easy: 'bg-green-100 text-green-700 border-green-200',
        Moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        Hard: 'bg-red-100 text-red-700 border-red-200'
    };

    const demandColors = {
        Low: 'text-gray-600',
        Medium: 'text-blue-600',
        High: 'text-orange-600',
        Trending: 'text-purple-600'
    };

    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 group relative"
        >
            {/* Bookmark Button */}
            <button
                onClick={handleBookmark}
                disabled={bookmarking}
                className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:scale-110 transition-transform"
            >
                <Bookmark
                    size={20}
                    className={`${bookmarked
                        ? 'fill-blue-600 text-blue-600'
                        : 'text-gray-400 hover:text-blue-600'
                        } transition-colors`}
                />
            </button>

            {/* Featured Badge */}
            {business.featured && (
                <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-md">
                    ⭐ FEATURED
                </div>
            )}

            {/* Icon/Image */}
            <div className="p-6 pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform">
                    {business.icon}
                </div>

                {/* Title & Tagline */}
                <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {business.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {business.tagline}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Investment */}
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <DollarSign size={16} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Investment</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                ${business.investmentRange.min}-{business.investmentRange.max}
                            </p>
                        </div>
                    </div>

                    {/* Time Commitment */}
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
                            <p className="font-semibold text-gray-900 dark:text-white text-xs">
                                {business.timeCommitment}
                            </p>
                        </div>
                    </div>

                    {/* Success Rate */}
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <TrendingUp size={16} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Success</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {business.successRate}%
                            </p>
                        </div>
                    </div>

                    {/* Views */}
                    <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                            <Users size={16} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {business.viewCount}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-lg border ${difficultyColors[business.difficulty]}`}>
                        {business.difficulty}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${demandColors[business.marketDemand]}`}>
                        {business.marketDemand === 'Trending' && '🔥 '}
                        {business.marketDemand}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {business.category}
                    </span>
                </div>

                {/* Viability Score */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${business.viabilityScore * 10}%` }}
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {business.viabilityScore}/10
                        </span>
                    </div>
                </div>

                {/* View Details Button */}
                <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                    View Details →
                </button>
            </div>
        </motion.div>
    );
};

export default BusinessCard;