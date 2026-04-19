import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Bookmark,
    Share2,
    TrendingUp,
    DollarSign,
    Clock,
    Target,
    AlertCircle,
    CheckCircle2,
    Users,
    Calendar,
    Award,
    ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import businessService from '../services/businessService';
import Navbar from '../components/dashboard/Navbar';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const BusinessDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [business, setBusiness] = useState(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedMode);
        if (savedMode) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', newMode.toString());
    };

    useEffect(() => {
        fetchBusiness();
    }, [slug]);

    const fetchBusiness = async () => {
        try {
            setLoading(true);
            const response = await businessService.getBusiness(slug);
            setBusiness(response.data.business);
            setIsBookmarked(response.data.isBookmarked);
        } catch (error) {
            toast.error('Business not found');
            navigate('/businesses');
        } finally {
            setLoading(false);
        }
    };

    const handleBookmark = async () => {
        try {
            await businessService.toggleBookmark(business._id);
            setIsBookmarked(!isBookmarked);
            toast.success(isBookmarked ? 'Bookmark removed' : 'Business bookmarked!');
        } catch (error) {
            toast.error('Failed to bookmark');
        }
    };

    const handleShare = async () => {
        try {
            await navigator.share({
                title: business.title,
                text: business.tagline,
                url: window.location.href
            });
        } catch (error) {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className={darkMode ? 'dark' : ''}>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                    <div className="max-w-5xl mx-auto px-4 py-8">
                        <LoadingSkeleton className="h-96" />
                    </div>
                </div>
            </div>
        );
    }

    if (!business) return null;

    const difficultyColors = {
        Easy: 'bg-green-100 text-green-700 border-green-300',
        Moderate: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        Hard: 'bg-red-100 text-red-700 border-red-300'
    };

    const demandColors = {
        Low: 'bg-gray-100 text-gray-700',
        Medium: 'bg-blue-100 text-blue-700',
        High: 'bg-orange-100 text-orange-700',
        Trending: 'bg-purple-100 text-purple-700'
    };

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Back Button */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate('/businesses')}
                        className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Businesses
                    </motion.button>

                    {/* Header Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-6 border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex flex-col md:flex-row md:items-start gap-6">

                            {/* Icon */}
                            <div className="flex-shrink-0">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center text-5xl shadow-lg">
                                    {business.icon}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {business.featured && (
                                        <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
                                            ⭐ FEATURED
                                        </span>
                                    )}
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${difficultyColors[business.difficulty]}`}>
                                        {business.difficulty}
                                    </span>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${demandColors[business.marketDemand]}`}>
                                        {business.marketDemand === 'Trending' && '🔥 '}
                                        {business.marketDemand}
                                    </span>
                                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                        {business.category}
                                    </span>
                                </div>

                                <h1 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-3">
                                    {business.title}
                                </h1>
                                <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                                    {business.tagline}
                                </p>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={handleBookmark}
                                        className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${isBookmarked
                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        <Bookmark size={20} className={isBookmarked ? 'fill-white' : ''} />
                                        {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                                    </button>

                                    <button
                                        onClick={handleShare}
                                        className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center gap-2"
                                    >
                                        <Share2 size={20} />
                                        Share
                                    </button>

                                    <Link to={`/roadmap/${business.slug}`}>
                                        <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                                            View Roadmap
                                            <ExternalLink size={18} />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
                    >
                        {/* Investment */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-3">
                                <DollarSign size={24} className="text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Investment</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                ${business.investmentRange.min}-{business.investmentRange.max}
                            </p>
                        </div>

                        {/* Time */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-3">
                                <Clock size={24} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Time</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {business.timeCommitment}
                            </p>
                        </div>

                        {/* Success Rate */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-3">
                                <TrendingUp size={24} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Success Rate</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {business.successRate}%
                            </p>
                        </div>

                        {/* Viability */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-3">
                                <Award size={24} className="text-orange-600 dark:text-orange-400" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Viability</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {business.viabilityScore}/10
                            </p>
                        </div>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">

                        {/* Left Column */}
                        <div className="md:col-span-2 space-y-6">

                            {/* Description */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    About This Business
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {business.description}
                                </p>
                            </motion.div>

                            {/* Pros & Cons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="grid md:grid-cols-2 gap-6"
                            >
                                {/* Pros */}
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pros</h3>
                                    </div>
                                    <ul className="space-y-3">
                                        {business.pros.map((pro, index) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                                <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                                                <span>{pro}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Cons */}
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border-2 border-red-200 dark:border-red-800">
                                    <div className="flex items-center gap-2 mb-4">
                                        <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cons</h3>
                                    </div>
                                    <ul className="space-y-3">
                                        {business.cons.map((con, index) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                                                <span className="text-red-600 dark:text-red-400 mt-1">✗</span>
                                                <span>{con}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="space-y-6">

                            {/* ROI */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white"
                            >
                                <Target size={32} className="mb-4" />
                                <h3 className="text-lg font-bold mb-2">Expected ROI</h3>
                                <p className="text-3xl font-black mb-1">
                                    {business.expectedROI.percentage}%
                                </p>
                                <p className="text-sm opacity-90">
                                    in {business.expectedROI.timeline}
                                </p>
                            </motion.div>

                            {/* Required Skills */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
                            >
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                    Required Skills
                                </h3>
                                <div className="space-y-2">
                                    {business.requiredSkills.map((skill, index) => (
                                        <div
                                            key={index}
                                            className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800"
                                        >
                                            {skill}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Industries */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
                            >
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                    Industries
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {business.industries.map((industry, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium"
                                        >
                                            {industry}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Competition */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
                            >
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                    Competition Level
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full ${business.competitionLevel === 'Low'
                                                ? 'bg-green-500 w-1/3'
                                                : business.competitionLevel === 'Medium'
                                                    ? 'bg-yellow-500 w-2/3'
                                                    : 'bg-red-500 w-full'
                                                }`}
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {business.competitionLevel}
                                    </span>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white text-center"
                    >
                        <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
                        <p className="text-lg mb-6 opacity-90">
                            Follow our step-by-step roadmap to launch your business successfully
                        </p>
                        <Link to={`/roadmap/${business.slug}`}>
                            <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all hover:scale-105">
                                View Complete Roadmap →
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default BusinessDetail;