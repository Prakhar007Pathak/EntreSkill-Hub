import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, X, BookOpen, Video, CheckSquare,
    FileText, Star, Clock, Award, TrendingUp, Sparkles,
    ChevronDown, CheckCircle2, Play, ExternalLink,
    Zap, Target, Users, Bookmark
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import resourceService from '../services/resourceService';
import Navbar from '../components/dashboard/Navbar';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import bookmarkService from '../services/bookmarkService';

// ─── Resource Type Config ───────────────────────────────────────────
const typeConfig = {
    video: {
        icon: Video,
        label: 'Video',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        badge: 'bg-red-500'
    },
    article: {
        icon: FileText,
        label: 'Article',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        badge: 'bg-blue-500'
    },
    checklist: {
        icon: CheckSquare,
        label: 'Checklist',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        badge: 'bg-green-500'
    },
    guide: {
        icon: BookOpen,
        label: 'Guide',
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        badge: 'bg-purple-500'
    },
    template: {
        icon: FileText,
        label: 'Template',
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        badge: 'bg-orange-500'
    }
};

const levelConfig = {
    Beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

const categoryIcons = {
    'Business Basics': '🏢',
    'Marketing': '📣',
    'Finance': '💰',
    'Legal': '⚖️',
    'Technology': '💻',
    'Sales': '🤝',
    'Operations': '⚙️',
    'Mindset': '🧠'
};

// ─── Resource Card Component ────────────────────────────────────────
const ResourceCard = ({ resource, onComplete, index }) => {
    const [completing, setCompleting] = useState(false);
    const [showChecklist, setShowChecklist] = useState(false);
    const [checkedItems, setCheckedItems] = useState([]);
    const [isBookmarked, setIsBookmarked] = useState(resource.isBookmarked || false);
    const [bookmarking, setBookmarking] = useState(false);
    const navigate = useNavigate();

    const TypeIcon = typeConfig[resource.type]?.icon || BookOpen;
    const typeColor = typeConfig[resource.type]?.color || '';
    const typeBadge = typeConfig[resource.type]?.badge || 'bg-gray-500';

    const handleComplete = async (e) => {
        e.stopPropagation();
        if (resource.isCompleted || completing) return;

        setCompleting(true);
        try {
            await onComplete(resource._id);
        } finally {
            setCompleting(false);
        }
    };

    const handleBookmark = async (e) => {
        e.stopPropagation();
        setBookmarking(true);
        try {
            const response = await bookmarkService.toggleResourceBookmark(resource._id);
            const newState = response.data.isBookmarked;
            setIsBookmarked(newState);
            toast.success(newState ? 'Resource bookmarked! 🔖' : 'Bookmark removed!');
        } catch (error) {
            toast.error('Failed to bookmark');
        } finally {
            setBookmarking(false);
        }
    };

    const toggleChecklistItem = (index) => {
        setCheckedItems(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 group flex flex-col"
        >
            {/* Thumbnail */}
            <div className="relative overflow-hidden h-44">
                <img
                    src={resource.thumbnail}
                    alt={resource.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400';
                    }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Type Badge */}
                <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 ${typeBadge} text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg`}>
                        <TypeIcon size={12} />
                        {typeConfig[resource.type]?.label}
                    </span>
                </div>

                {/* Featured Badge */}
                {resource.featured && (
                    <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1">
                            <Star size={10} className="fill-yellow-900" />
                            Featured
                        </span>
                    </div>
                )}

                {/* Completed Overlay */}
                {resource.isCompleted && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                        <div className="bg-green-500 rounded-full p-3 shadow-xl">
                            <CheckCircle2 size={28} className="text-white" />
                        </div>
                    </div>
                )}

                {/* Play button for videos */}
                {resource.type === 'video' && !resource.isCompleted && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/90 rounded-full p-4 shadow-xl">
                            <Play size={24} className="text-blue-600 fill-blue-600" />
                        </div>
                    </div>
                )}

                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3">
                    <span className="px-2 py-1 bg-black/60 text-white text-xs rounded-lg flex items-center gap-1">
                        <Clock size={10} />
                        {resource.duration}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">

                {/* Category & Level */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm">
                        {categoryIcons[resource.category] || '📌'}
                    </span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {resource.category}
                    </span>
                    <span className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-full ${levelConfig[resource.level]}`}>
                        {resource.level}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-snug">
                    {resource.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
                    {resource.description}
                </p>

                {/* Instructor */}
                {resource.instructor?.name && (
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {resource.instructor.name[0]}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            {resource.instructor.name}
                        </span>
                    </div>
                )}

                {/* Points Badge */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <Zap size={12} className="text-blue-500" />
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            +{resource.estimatedPoints} pts
                        </span>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                        <Users size={12} className="text-gray-500" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {resource.completionCount} completed
                        </span>
                    </div>
                </div>

                {/* Checklist Preview */}
                {resource.type === 'checklist' && resource.checklistItems?.length > 0 && (
                    <div className="mb-4">
                        <button
                            onClick={() => setShowChecklist(!showChecklist)}
                            className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <CheckSquare size={16} className="text-green-500" />
                                {checkedItems.length}/{resource.checklistItems.length} items
                            </span>
                            <motion.div animate={{ rotate: showChecklist ? 180 : 0 }}>
                                <ChevronDown size={16} />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {showChecklist && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                        {resource.checklistItems.map((item, idx) => (
                                            <label
                                                key={idx}
                                                className="flex items-start gap-2.5 cursor-pointer group/item"
                                                onClick={() => toggleChecklistItem(idx)}
                                            >
                                                <div className={`flex-shrink-0 w-4 h-4 mt-0.5 rounded border-2 flex items-center justify-center transition-all ${checkedItems.includes(idx)
                                                    ? 'bg-green-500 border-green-500'
                                                    : 'border-gray-300 dark:border-gray-600 group-hover/item:border-green-400'
                                                    }`}>
                                                    {checkedItems.includes(idx) && (
                                                        <CheckCircle2 size={10} className="text-white" />
                                                    )}
                                                </div>
                                                <span className={`text-xs leading-relaxed ${checkedItems.includes(idx)
                                                    ? 'line-through text-gray-400 dark:text-gray-500'
                                                    : 'text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {item}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto">
                    {/* View Resource */}
                    {/* Bookmark Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBookmark}
                        disabled={bookmarking}
                        className={`p-2.5 rounded-xl transition-all border-2 ${isBookmarked
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400'
                            : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 hover:border-blue-300'
                            }`}
                    >
                        <Bookmark size={15} className={isBookmarked ? 'fill-blue-600 dark:fill-blue-400' : ''} />
                    </motion.button>

                    {/* View Detail Button */}
                    <button
                        onClick={() => navigate(`/resources/${resource.slug}`)}
                        className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-1.5"
                    >
                        <ExternalLink size={14} />
                        View
                    </button>

                    {/* Complete Button */}
                    <motion.button
                        whileHover={{ scale: resource.isCompleted ? 1 : 1.02 }}
                        whileTap={{ scale: resource.isCompleted ? 1 : 0.98 }}
                        onClick={handleComplete}
                        disabled={resource.isCompleted || completing}
                        className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${resource.isCompleted
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-default'
                            : completing
                                ? 'bg-blue-400 text-white cursor-wait'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
                            }`}
                    >
                        {resource.isCompleted ? (
                            <>
                                <CheckCircle2 size={14} />
                                Completed
                            </>
                        ) : completing ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                >
                                    <Zap size={14} />
                                </motion.div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={14} />
                                Mark Done
                            </>
                        )}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

// ─── Main Page ──────────────────────────────────────────────────────
const LearningResources = () => {
    const [resources, setResources] = useState([]);
    const [featuredResources, setFeaturedResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [completedCount, setCompletedCount] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);

    const [filters, setFilters] = useState({
        search: '',
        type: '',
        category: '',
        level: ''
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
    });

    // Dark mode
    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedMode);
        if (savedMode) document.documentElement.classList.add('dark');
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', newMode.toString());
    };

    // Fetch resources
    useEffect(() => {
        fetchResources();
    }, [filters, pagination.page, activeTab]);

    // Fetch featured on mount
    useEffect(() => {
        fetchFeatured();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                page: pagination.page,
                limit: pagination.limit
            };

            // Apply tab filter
            if (activeTab !== 'all') {
                params.type = activeTab;
            }

            // Remove empty params
            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
            });

            const response = await resourceService.getResources(params);
            setResources(response.data.resources);
            setPagination(prev => ({
                ...prev,
                total: response.data.pagination.total,
                pages: response.data.pagination.pages
            }));

            // Count completed
            const completed = response.data.resources.filter(r => r.isCompleted).length;
            setCompletedCount(completed);

        } catch (error) {
            toast.error('Failed to load resources');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFeatured = async () => {
        try {
            const response = await resourceService.getFeaturedResources();
            setFeaturedResources(response.data.resources);
        } catch (error) {
            console.error('Failed to load featured:', error);
        }
    };

    const handleComplete = async (resourceId) => {
        try {
            const response = await resourceService.completeResource(resourceId);
            const { points, totalPoints: newTotal } = response.data;

            // Confetti!
            confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#8b5cf6', '#10b981']
            });

            toast.success(`Resource completed! +${points} points 🎉`, {
                duration: 3000,
                icon: '🎓'
            });

            setTotalPoints(newTotal);

            // Update resource in list
            setResources(prev =>
                prev.map(r =>
                    r._id === resourceId ? { ...r, isCompleted: true } : r
                )
            );

            // Update featured too
            setFeaturedResources(prev =>
                prev.map(r =>
                    r._id === resourceId ? { ...r, isCompleted: true } : r
                )
            );

            setCompletedCount(prev => prev + 1);
        } catch (error) {
            if (error.response?.data?.message === 'Resource already completed') {
                toast.error('Already completed!');
            } else {
                toast.error('Failed to mark as complete');
            }
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({ search: '', type: '', category: '', level: '' });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

    const tabs = [
        { id: 'all', label: 'All', icon: Sparkles },
        { id: 'video', label: 'Videos', icon: Video },
        { id: 'article', label: 'Articles', icon: FileText },
        { id: 'checklist', label: 'Checklists', icon: CheckSquare },
        { id: 'guide', label: 'Guides', icon: BookOpen },
    ];

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* ── Header ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                            Learning Resources 🎓
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {pagination.total}+ curated resources to help you build and grow your business
                        </p>
                    </motion.div>

                    {/* ── Stats Bar ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    >
                        {[
                            { icon: BookOpen, label: 'Total Resources', value: pagination.total, color: 'from-blue-500 to-cyan-500' },
                            { icon: CheckCircle2, label: 'Completed', value: completedCount, color: 'from-green-500 to-emerald-500' },
                            { icon: Zap, label: 'Points Earned', value: `${totalPoints}+`, color: 'from-purple-500 to-pink-500' },
                            { icon: TrendingUp, label: 'Categories', value: 8, color: 'from-orange-500 to-red-500' },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + i * 0.05 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4"
                            >
                                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
                                    <stat.icon size={22} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* ── Featured Section ── */}
                    {featuredResources.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-8"
                        >
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-6 text-white">
                                <div className="flex items-center gap-3 mb-5">
                                    <Star size={24} className="fill-yellow-300 text-yellow-300" />
                                    <div>
                                        <h2 className="text-xl font-bold">Featured Resources</h2>
                                        <p className="text-sm opacity-90">Hand-picked by our experts</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {featuredResources.slice(0, 3).map((resource, index) => {
                                        const TypeIcon = typeConfig[resource.type]?.icon || BookOpen;
                                        return (
                                            <motion.div
                                                key={resource._id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.3 + index * 0.1 }}
                                                className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all"
                                            >
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <TypeIcon size={18} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs opacity-75 mb-0.5">{resource.category}</p>
                                                        <h3 className="font-bold text-sm line-clamp-2 leading-snug">
                                                            {resource.title}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1 text-xs opacity-80">
                                                        <Clock size={11} />
                                                        {resource.duration}
                                                    </div>
                                                    {resource.isCompleted ? (
                                                        <span className="flex items-center gap-1 text-xs bg-green-400/30 text-green-200 px-2 py-0.5 rounded-full">
                                                            <CheckCircle2 size={11} />
                                                            Done
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                                            +{resource.estimatedPoints} pts
                                                        </span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Type Tabs ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-6"
                    >
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {tabs.map((tab) => (
                                <motion.button
                                    key={tab.id}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setPagination(prev => ({ ...prev, page: 1 }));
                                    }}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                        }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── Search & Filter Bar ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="mb-6 flex flex-col sm:flex-row gap-3"
                    >
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Search resources, topics, skills..."
                                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all text-gray-900 dark:text-white text-sm"
                            />
                        </div>

                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="relative px-5 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:border-blue-500 transition-all flex items-center gap-2 text-sm"
                        >
                            <Filter size={16} />
                            Filters
                            {activeFiltersCount > 0 && (
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>
                    </motion.div>

                    {/* ── Filter Panel ── */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 overflow-hidden"
                            >
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                            Filter Resources
                                        </h3>
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                                        >
                                            Clear All
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {/* Category */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Category
                                            </label>
                                            <select
                                                value={filters.category}
                                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                                className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-blue-500 text-sm"
                                            >
                                                <option value="">All Categories</option>
                                                {Object.keys(categoryIcons).map(cat => (
                                                    <option key={cat} value={cat}>
                                                        {categoryIcons[cat]} {cat}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Level */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Level
                                            </label>
                                            <select
                                                value={filters.level}
                                                onChange={(e) => handleFilterChange('level', e.target.value)}
                                                className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-blue-500 text-sm"
                                            >
                                                <option value="">All Levels</option>
                                                <option value="Beginner">🟢 Beginner</option>
                                                <option value="Intermediate">🟡 Intermediate</option>
                                                <option value="Advanced">🔴 Advanced</option>
                                            </select>
                                        </div>

                                        {/* Type */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Type
                                            </label>
                                            <select
                                                value={filters.type}
                                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                                className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-blue-500 text-sm"
                                            >
                                                <option value="">All Types</option>
                                                <option value="video">🎥 Video</option>
                                                <option value="article">📄 Article</option>
                                                <option value="checklist">✅ Checklist</option>
                                                <option value="guide">📖 Guide</option>
                                                <option value="template">📋 Template</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Results Count ── */}
                    <div className="mb-5 flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing <span className="font-bold text-gray-900 dark:text-white">{resources.length}</span> of <span className="font-bold text-gray-900 dark:text-white">{pagination.total}</span> resources
                        </p>
                        {activeFiltersCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                            >
                                <X size={14} />
                                Clear {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
                            </button>
                        )}
                    </div>

                    {/* ── Resource Grid ── */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <LoadingSkeleton key={i} className="h-96" />
                            ))}
                        </div>
                    ) : resources.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20"
                        >
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                No resources found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Try adjusting your filters or search terms
                            </p>
                            <button
                                onClick={clearFilters}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                Clear Filters
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {resources.map((resource, index) => (
                                <ResourceCard
                                    key={resource._id}
                                    resource={resource}
                                    onComplete={handleComplete}
                                    index={index}
                                />
                            ))}
                        </motion.div>
                    )}

                    {/* ── Pagination ── */}
                    {pagination.pages > 1 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-10 flex items-center justify-center gap-2"
                        >
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                disabled={pagination.page === 1}
                                className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Previous
                            </button>

                            {[...Array(pagination.pages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                                    className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${pagination.page === i + 1
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                        : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-500'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                                disabled={pagination.page === pagination.pages}
                                className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                Next
                            </button>
                        </motion.div>
                    )}

                    {/* ── Bottom CTA ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white text-center"
                    >
                        <Award size={40} className="mx-auto mb-4 text-yellow-300" />
                        <h2 className="text-2xl font-bold mb-2">Keep Learning, Keep Growing!</h2>
                        <p className="opacity-90 mb-6">
                            Complete resources to earn points and unlock new levels
                        </p>
                        <div className="flex items-center justify-center gap-8">
                            <div>
                                <p className="text-3xl font-black">{completedCount}</p>
                                <p className="text-sm opacity-80">Completed</p>
                            </div>
                            <div className="w-px h-12 bg-white/30" />
                            <div>
                                <p className="text-3xl font-black">{pagination.total - completedCount}</p>
                                <p className="text-sm opacity-80">Remaining</p>
                            </div>
                            <div className="w-px h-12 bg-white/30" />
                            <div>
                                <p className="text-3xl font-black">{totalPoints}</p>
                                <p className="text-sm opacity-80">Points Earned</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default LearningResources;