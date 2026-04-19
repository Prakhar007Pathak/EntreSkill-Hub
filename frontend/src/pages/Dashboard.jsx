import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
    Bookmark,
    GraduationCap,
    Users,
    LogOut,
    Sparkles,
    ArrowRight,
    Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

// Components
import Navbar from '../components/dashboard/Navbar';
import StatCard from '../components/dashboard/StatCard';
import ProgressRing from '../components/dashboard/ProgressRing';
import StreakCounter from '../components/dashboard/StreakCounter';
import CurrentBusinesses from '../components/dashboard/CurrentBusinesses';
import CompletedBusinesses from '../components/dashboard/CompletedBusinesses';
import RecentActivity from '../components/dashboard/RecentActivity';
import { CardSkeleton } from '../components/common/LoadingSkeleton';

// Services
import progressService from '../services/progressService';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [progressData, setProgressData] = useState(null);

    // Load dark mode
    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedMode);
        if (savedMode) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    // Fetch progress data
    useEffect(() => {
        fetchProgressData();
    }, []);

    const fetchProgressData = async () => {
        try {
            setLoading(true);
            const response = await progressService.getProgress();
            setProgressData(response.data.progress);
        } catch (error) {
            toast.error('Failed to load dashboard data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', newMode.toString());
    };

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully!');
        navigate('/login');
    };

    // Loading State
    if (loading) {
        return (
            <div className={darkMode ? 'dark' : ''}>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {[...Array(4)].map((_, i) => (
                                <CardSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const stats = progressData?.stats || {};
    const streak = progressData?.streak || {};
    const activeBusinesses = progressData?.activeBusinesses || [];
    const completedBusinesses = progressData?.completedBusinesses || [];
    const recentActivity = progressData?.recentActivity || [];
    const overallProgress = progressData?.overallProgress || 0;

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">

                {/* Navbar */}
                <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* ── Welcome Section ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                                    Hello, {user?.fullName?.split(' ')[0]}! 👋
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Welcome to your entrepreneurship hub — track, learn, and grow.
                                </p>
                            </div>

                            <div className="mt-4 md:mt-0 flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleLogout}
                                    className="px-4 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 flex items-center gap-2"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Stats Grid ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            icon={Sparkles}
                            label="Business Ideas"
                            value={stats.businessesStarted || 0}
                            color="blue"
                            delay={0.1}
                        />
                        <StatCard
                            icon={GraduationCap}
                            label="Resources Completed"
                            value={stats.resourcesCompleted || 0}
                            color="green"
                            delay={0.2}
                        />
                        <StatCard
                            icon={Users}
                            label="Mentors Connected"
                            value={stats.mentorsConnected || 0}
                            color="purple"
                            delay={0.3}
                        />
                        <StatCard
                            icon={Calendar}
                            label="Mentor Sessions"
                            value={stats.mentorSessions || 0}
                            color="orange"
                            delay={0.4}
                        />
                    </div>

                    {/* ── Main Grid Layout ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                        {/* Left Column */}
                        <div className="lg:col-span-1 space-y-6">
                            <ProgressRing
                                percentage={overallProgress}
                                label="Overall Progress"
                                activeBusinesses={activeBusinesses}
                            />
                            <StreakCounter
                                current={streak.current || 0}
                                longest={streak.longest || 0}
                            />
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <CurrentBusinesses
                                businesses={activeBusinesses}
                            />
                            <RecentActivity
                                activities={recentActivity}
                            />
                        </div>
                    </div>

                    {/* ── Completed Businesses ── */}
                    <div className="mb-8">
                        <CompletedBusinesses
                            completedBusinesses={completedBusinesses}
                        />
                    </div>

                    {/* ── Quick Actions Grid ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {/* Explore Business Ideas */}
                        <Link to="/businesses">
                            <motion.div
                                whileHover={{ y: -8 }}
                                className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white cursor-pointer shadow-lg hover:shadow-2xl transition-all"
                            >
                                <Sparkles size={32} className="mb-4" />
                                <h3 className="text-xl font-bold mb-2">Explore Ideas</h3>
                                <p className="text-sm opacity-90 mb-4">
                                    Discover 500+ business ideas tailored to your skills
                                </p>
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    Get Started <ArrowRight size={16} />
                                </div>
                            </motion.div>
                        </Link>

                        {/* My Bookmarks */}
                        <Link to="/bookmarks">
                            <motion.div
                                whileHover={{ y: -8 }}
                                className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white cursor-pointer shadow-lg hover:shadow-2xl transition-all"
                            >
                                <Bookmark size={32} className="mb-4" />
                                <h3 className="text-xl font-bold mb-2">My Bookmarks</h3>
                                <p className="text-sm opacity-90 mb-4">
                                    View all your saved business ideas and resources
                                </p>
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    View Bookmarks <ArrowRight size={16} />
                                </div>
                            </motion.div>
                        </Link>

                        {/* Learning Resources */}
                        <Link to="/resources">
                            <motion.div
                                whileHover={{ y: -8 }}
                                className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white cursor-pointer shadow-lg hover:shadow-2xl transition-all"
                            >
                                <GraduationCap size={32} className="mb-4" />
                                <h3 className="text-xl font-bold mb-2">Learn & Grow</h3>
                                <p className="text-sm opacity-90 mb-4">
                                    Access free courses, videos, and resources
                                </p>
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    Start Learning <ArrowRight size={16} />
                                </div>
                            </motion.div>
                        </Link>
                    </motion.div>

                    {/* ── Footer Info ── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-8 text-center"
                    >
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Member since {new Date(user?.createdAt).toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;