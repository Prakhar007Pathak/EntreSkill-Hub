import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    Bookmark, Search, X, TrendingUp, DollarSign,
    Clock, Star, ArrowRight, Sparkles, Filter,
    Trash2, ExternalLink, Target, Award,
    Video, FileText, BookOpen, CheckSquare, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import bookmarkService from '../services/bookmarkService';
import Navbar from '../components/dashboard/Navbar';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

// ─── Tab Config ─────────────────────────────────────────────────────
const tabs = [
    { id: 'all', label: 'All', icon: Layers },
    { id: 'business', label: 'Ideas', icon: Sparkles },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'article', label: 'Articles', icon: FileText },
    { id: 'checklist', label: 'Checklists', icon: CheckSquare },
    { id: 'guide', label: 'Guides', icon: BookOpen },
];

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

// ─── Business Bookmark Card ──────────────────────────────────────────
const BusinessBookmarkCard = ({ business, onRemove, index }) => {
    const [removing, setRemoving] = useState(false);

    const difficultyColors = {
        Easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        Moderate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        Hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };

    const handleRemove = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setRemoving(true);
        try {
            await onRemove(business._id, 'business');
        } finally {
            setRemoving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 group flex flex-col"
        >
            {/* Top Color Bar */}
            <div className={`h-1.5 w-full ${business.difficulty === 'Easy'
                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                : business.difficulty === 'Moderate'
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    : 'bg-gradient-to-r from-red-400 to-pink-500'
                }`}
            />

            <div className="p-5 flex flex-col flex-1">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                        {business.icon}
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleRemove}
                        disabled={removing}
                        className="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 rounded-xl transition-all border border-red-100 dark:border-red-800"
                    >
                        <Trash2 size={15} />
                    </motion.button>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full">
                        💡 Idea
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${difficultyColors[business.difficulty]}`}>
                        {business.difficulty}
                    </span>
                    {business.marketDemand === 'Trending' && (
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold rounded-full">
                            🔥 Trending
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 leading-snug">
                    {business.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
                    {business.tagline}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-1.5">
                        <DollarSign size={12} className="text-green-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                            ${business.investmentRange?.min}-{business.investmentRange?.max}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <TrendingUp size={12} className="text-purple-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                            {business.successRate}% success
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto">
                    <Link
                        to={`/business/${business.slug}`}
                        className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-1"
                    >
                        <ExternalLink size={12} />
                        Details
                    </Link>
                    <Link
                        to={`/roadmap/${business.slug}`}
                        className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-xs hover:shadow-lg transition-all flex items-center justify-center gap-1"
                    >
                        <Target size={12} />
                        Roadmap
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

// ─── Resource Bookmark Card ──────────────────────────────────────────
const ResourceBookmarkCard = ({ resource, onRemove, index }) => {
    const [removing, setRemoving] = useState(false);
    const navigate = useNavigate();
    const TypeIcon = typeConfig[resource.type]?.icon || BookOpen;
    const typeBadge = typeConfig[resource.type]?.badge || 'bg-gray-500';

    const handleRemove = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setRemoving(true);
        try {
            await onRemove(resource._id, 'resource');
        } finally {
            setRemoving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 group flex flex-col"
        >
            {/* Thumbnail */}
            <div className="relative h-36 overflow-hidden">
                <img
                    src={resource.thumbnail}
                    alt={resource.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Type Badge */}
                <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 ${typeBadge} text-white text-xs font-bold rounded-full flex items-center gap-1`}>
                        <TypeIcon size={10} />
                        {typeConfig[resource.type]?.label}
                    </span>
                </div>

                {/* Remove Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleRemove}
                    disabled={removing}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                >
                    <Trash2 size={12} />
                </motion.button>

                {/* Duration */}
                <div className="absolute bottom-2 right-2">
                    <span className="px-2 py-0.5 bg-black/60 text-white text-xs rounded-lg flex items-center gap-1">
                        <Clock size={10} />
                        {resource.duration}
                    </span>
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
                {/* Category */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                    {resource.category}
                </p>

                {/* Title */}
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-snug flex-1">
                    {resource.title}
                </h3>

                {/* Level */}
                <span className={`self-start px-2 py-0.5 text-xs font-bold rounded-full mb-3 ${resource.level === 'Beginner'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : resource.level === 'Intermediate'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {resource.level}
                </span>

                {/* View Button */}
                <button
                    onClick={() => navigate(`/resources/${resource.slug}`)}
                    className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-xs hover:shadow-lg transition-all flex items-center justify-center gap-1.5 mt-auto"
                >
                    <ExternalLink size={12} />
                    View Resource
                </button>
            </div>
        </motion.div>
    );
};

// ─── Main Bookmarks Page ─────────────────────────────────────────────
const Bookmarks = () => {
    const [allBookmarks, setAllBookmarks] = useState({ businesses: [], resources: [] });
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');

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

    // Fetch all bookmarks
    useEffect(() => {
        fetchAllBookmarks();
    }, []);

    const fetchAllBookmarks = async () => {
        try {
            setLoading(true);
            const data = await bookmarkService.getAllBookmarks();
            setAllBookmarks({
                businesses: data.businesses,
                resources: data.resources
            });
        } catch (error) {
            toast.error('Failed to load bookmarks');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBookmark = async (itemId, type) => {
        try {
            if (type === 'business') {
                await bookmarkService.toggleBusinessBookmark(itemId);
                setAllBookmarks(prev => ({
                    ...prev,
                    businesses: prev.businesses.filter(b => b._id !== itemId)
                }));
            } else {
                await bookmarkService.toggleResourceBookmark(itemId);
                setAllBookmarks(prev => ({
                    ...prev,
                    resources: prev.resources.filter(r => r._id !== itemId)
                }));
            }
            toast.success('Bookmark removed!', { icon: '🗑️' });
        } catch (error) {
            toast.error('Failed to remove bookmark');
        }
    };

    // Filter logic
    const getFilteredItems = () => {
        const searchLower = search.toLowerCase();

        const filteredBusinesses = allBookmarks.businesses.filter(b =>
            b.title?.toLowerCase().includes(searchLower) ||
            b.tagline?.toLowerCase().includes(searchLower)
        );

        const filteredResources = allBookmarks.resources.filter(r =>
            r.title?.toLowerCase().includes(searchLower) ||
            r.description?.toLowerCase().includes(searchLower)
        );

        switch (activeTab) {
            case 'all':
                return { businesses: filteredBusinesses, resources: filteredResources };
            case 'business':
                return { businesses: filteredBusinesses, resources: [] };
            case 'video':
                return { businesses: [], resources: filteredResources.filter(r => r.type === 'video') };
            case 'article':
                return { businesses: [], resources: filteredResources.filter(r => r.type === 'article') };
            case 'checklist':
                return { businesses: [], resources: filteredResources.filter(r => r.type === 'checklist') };
            case 'guide':
                return { businesses: [], resources: filteredResources.filter(r => r.type === 'guide') };
            default:
                return { businesses: filteredBusinesses, resources: filteredResources };
        }
    };

    const filtered = getFilteredItems();
    const totalFiltered = filtered.businesses.length + filtered.resources.length;
    const totalBookmarks = allBookmarks.businesses.length + allBookmarks.resources.length;

    // Tab counts
    const tabCounts = {
        all: totalBookmarks,
        business: allBookmarks.businesses.length,
        video: allBookmarks.resources.filter(r => r.type === 'video').length,
        article: allBookmarks.resources.filter(r => r.type === 'article').length,
        checklist: allBookmarks.resources.filter(r => r.type === 'checklist').length,
        guide: allBookmarks.resources.filter(r => r.type === 'guide').length,
    };

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
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Bookmark size={22} className="text-white fill-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-heading font-bold text-gray-900 dark:text-white">
                                    My Bookmarks 🔖
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {totalBookmarks} item{totalBookmarks !== 1 ? 's' : ''} saved
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Stats Bar ── */}
                    {totalBookmarks > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                        >
                            {[
                                { icon: Layers, label: 'Total Saved', value: totalBookmarks, color: 'from-blue-500 to-cyan-500' },
                                { icon: Sparkles, label: 'Business Ideas', value: allBookmarks.businesses.length, color: 'from-purple-500 to-pink-500' },
                                { icon: Video, label: 'Videos', value: allBookmarks.resources.filter(r => r.type === 'video').length, color: 'from-red-500 to-orange-500' },
                                { icon: FileText, label: 'Articles & Guides', value: allBookmarks.resources.filter(r => r.type === 'article' || r.type === 'guide').length, color: 'from-green-500 to-emerald-500' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 + i * 0.05 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4"
                                >
                                    <div className={`w-11 h-11 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
                                        <stat.icon size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {stat.value}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            {stat.label}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* ── Tabs ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6"
                    >
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {tabs.map((tab) => (
                                <motion.button
                                    key={tab.id}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                        }`}
                                >
                                    <tab.icon size={15} />
                                    {tab.label}
                                    {tabCounts[tab.id] > 0 && (
                                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id
                                            ? 'bg-white/20 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {tabCounts[tab.id]}
                                        </span>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── Search ── */}
                    {totalBookmarks > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="mb-6 flex gap-3"
                        >
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search your bookmarks..."
                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all text-gray-900 dark:text-white text-sm"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            <Link to="/businesses">
                                <button className="px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2">
                                    <Sparkles size={16} />
                                    Explore More
                                </button>
                            </Link>
                        </motion.div>
                    )}

                    {/* ── Results Count ── */}
                    {totalBookmarks > 0 && (
                        <div className="mb-5">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Showing <span className="font-bold text-gray-900 dark:text-white">{totalFiltered}</span> of <span className="font-bold text-gray-900 dark:text-white">{totalBookmarks}</span> bookmarks
                            </p>
                        </div>
                    )}

                    {/* ── Content ── */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <LoadingSkeleton key={i} className="h-72" />
                            ))}
                        </div>
                    ) : totalBookmarks === 0 ? (
                        // ── Empty State ──
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20"
                        >
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="text-8xl mb-6"
                            >
                                🔖
                            </motion.div>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                No bookmarks yet!
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                                Start exploring business ideas and resources, then bookmark the ones you love!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link to="/businesses">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all flex items-center gap-2"
                                    >
                                        <Sparkles size={20} />
                                        Explore Ideas
                                    </motion.button>
                                </Link>
                                <Link to="/resources">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold text-lg hover:shadow-xl transition-all flex items-center gap-2"
                                    >
                                        <BookOpen size={20} />
                                        Browse Resources
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>
                    ) : totalFiltered === 0 ? (
                        // ── No Results ──
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-16"
                        >
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                No matches found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Try different search terms or switch tabs
                            </p>
                            <button
                                onClick={() => setSearch('')}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                            >
                                Clear Search
                            </button>
                        </motion.div>
                    ) : (
                        // ── Bookmarks Grid ──
                        <AnimatePresence>
                            <div className="space-y-8">
                                {/* Business Ideas */}
                                {filtered.businesses.length > 0 && (
                                    <div>
                                        {activeTab === 'all' && (
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                <Sparkles size={18} className="text-blue-500" />
                                                Business Ideas
                                                <span className="text-sm font-normal text-gray-500">
                                                    ({filtered.businesses.length})
                                                </span>
                                            </h2>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filtered.businesses.map((business, index) => (
                                                <BusinessBookmarkCard
                                                    key={business._id}
                                                    business={business}
                                                    onRemove={handleRemoveBookmark}
                                                    index={index}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Resources */}
                                {filtered.resources.length > 0 && (
                                    <div>
                                        {activeTab === 'all' && (
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                <BookOpen size={18} className="text-purple-500" />
                                                Resources
                                                <span className="text-sm font-normal text-gray-500">
                                                    ({filtered.resources.length})
                                                </span>
                                            </h2>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filtered.resources.map((resource, index) => (
                                                <ResourceBookmarkCard
                                                    key={resource._id}
                                                    resource={resource}
                                                    onRemove={handleRemoveBookmark}
                                                    index={index}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </AnimatePresence>
                    )}

                    {/* ── Bottom CTA ── */}
                    {totalBookmarks > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white"
                        >
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">
                                        Ready to start your journey? 🚀
                                    </h2>
                                    <p className="opacity-90">
                                        Pick one of your saved ideas and follow the roadmap!
                                    </p>
                                </div>
                                <div className="flex gap-3 flex-shrink-0">
                                    <Link to="/resources">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-5 py-3 bg-white/10 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center gap-2 text-sm"
                                        >
                                            <BookOpen size={16} />
                                            Browse Resources
                                        </motion.button>
                                    </Link>
                                    <Link to="/dashboard">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-5 py-3 bg-white text-blue-600 rounded-xl font-bold hover:shadow-xl transition-all flex items-center gap-2 text-sm"
                                        >
                                            Dashboard
                                            <ArrowRight size={16} />
                                        </motion.button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Bookmarks;