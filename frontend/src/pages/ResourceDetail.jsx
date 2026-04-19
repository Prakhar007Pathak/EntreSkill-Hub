import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
    ArrowLeft, Clock, Award, Zap, CheckCircle2,
    Video, FileText, BookOpen, CheckSquare, Users,
    Star, Share2, ExternalLink, Play, ChevronDown,
    TrendingUp, Target, Sparkles, Bookmark
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import resourceService from '../services/resourceService';
import bookmarkService from '../services/bookmarkService';
import Navbar from '../components/dashboard/Navbar';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

// ─── Type Config ────────────────────────────────────────────────────
const typeConfig = {
    video: {
        icon: Video,
        label: 'Video',
        color: 'from-red-500 to-pink-500',
        lightColor: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    },
    article: {
        icon: FileText,
        label: 'Article',
        color: 'from-blue-500 to-cyan-500',
        lightColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    },
    checklist: {
        icon: CheckSquare,
        label: 'Checklist',
        color: 'from-green-500 to-emerald-500',
        lightColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    },
    guide: {
        icon: BookOpen,
        label: 'Guide',
        color: 'from-purple-500 to-violet-500',
        lightColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    },
    template: {
        icon: FileText,
        label: 'Template',
        color: 'from-orange-500 to-red-500',
        lightColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    }
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

// ─── Extract YouTube ID ─────────────────────────────────────────────
const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
};

// ─── Video Player Component ─────────────────────────────────────────
const VideoPlayer = ({ resource }) => {
    const [playing, setPlaying] = useState(false);
    const youtubeId = getYouTubeId(resource.resourceUrl);

    // Check if it's a real YouTube URL or a fake one
    const isFakeUrl = !youtubeId ||
        resource.resourceUrl?.includes('example') ||
        resource.resourceUrl === '#';

    if (isFakeUrl) {
        return (
            <div className="relative w-full aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden flex items-center justify-center">
                <img
                    src={resource.thumbnail}
                    alt={resource.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
                <div className="relative z-10 text-center text-white px-6">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                        <Play size={36} className="text-white fill-white ml-1" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Video Preview</h3>
                    <p className="text-sm text-gray-300 mb-4">
                        This is a sample resource. In production, the actual video would be embedded here.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                        <Clock size={14} />
                        {resource.duration}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden">
            {!playing ? (
                <div
                    className="relative w-full h-full cursor-pointer group"
                    onClick={() => setPlaying(true)}
                >
                    <img
                        src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                        alt={resource.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = resource.thumbnail;
                        }}
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl"
                        >
                            <Play size={32} className="text-white fill-white ml-1" />
                        </motion.div>
                    </div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white text-sm">
                        <Clock size={14} />
                        {resource.duration}
                    </div>
                </div>
            ) : (
                <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                    title={resource.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            )}
        </div>
    );
};

// ─── Article/Guide Reader Component ────────────────────────────────
const ArticleReader = ({ resource }) => {
    const contentRef = useRef(null);
    const [readProgress, setReadProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (!contentRef.current) return;
            const element = contentRef.current;
            const rect = element.getBoundingClientRect();
            const elementHeight = element.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrolled = Math.max(0, -rect.top + windowHeight);
            const progress = Math.min(100, (scrolled / elementHeight) * 100);
            setReadProgress(Math.round(progress));
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const hasContent = resource.content && resource.content.trim().length > 0;

    return (
        <div>
            {/* Reading Progress Bar */}
            <div className="sticky top-16 z-40 w-full h-1 bg-gray-200 dark:bg-gray-700 mb-6">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                    style={{ width: `${readProgress}%` }}
                    transition={{ duration: 0.1 }}
                />
            </div>

            {/* Reading Progress Badge */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock size={14} />
                    {resource.duration}
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                    <TrendingUp size={14} className="text-blue-500" />
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {readProgress}% read
                    </span>
                </div>
            </div>

            {/* Article Content */}
            <div
                ref={contentRef}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm"
            >
                {hasContent ? (
                    <div className="prose prose-lg dark:prose-invert max-w-none
                        prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                        prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                        prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                        prose-li:text-gray-700 dark:prose-li:text-gray-300
                        prose-strong:text-gray-900 dark:prose-strong:text-white
                        prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:rounded prose-code:px-1
                        prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20
                        prose-a:text-blue-600 dark:prose-a:text-blue-400
                    ">
                        <ReactMarkdown>{resource.content}</ReactMarkdown>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📄</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Full Content Coming Soon
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            This is a preview. The complete article content will be available shortly.
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">
                            {resource.description}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Checklist Component ────────────────────────────────────────────
const ChecklistViewer = ({ resource, isCompleted, onComplete }) => {
    const storageKey = `checklist_${resource._id}`;

    const [checkedItems, setCheckedItems] = useState(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const totalItems = resource.checklistItems?.length || 0;
    const completedItems = checkedItems.length;
    const progressPercent = totalItems > 0
        ? Math.round((completedItems / totalItems) * 100)
        : 0;
    const allDone = completedItems === totalItems && totalItems > 0;

    const toggleItem = (index) => {
        if (isCompleted) return;
        const newChecked = checkedItems.includes(index)
            ? checkedItems.filter(i => i !== index)
            : [...checkedItems, index];

        setCheckedItems(newChecked);
        localStorage.setItem(storageKey, JSON.stringify(newChecked));
    };

    const resetAll = () => {
        setCheckedItems([]);
        localStorage.removeItem(storageKey);
    };

    return (
        <div>
            {/* Progress Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Your Progress
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {completedItems} of {totalItems} items completed
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-black text-gray-900 dark:text-white">
                            {progressPercent}%
                        </p>
                        {!isCompleted && completedItems > 0 && (
                            <button
                                onClick={resetAll}
                                className="text-xs text-red-500 hover:underline mt-1"
                            >
                                Reset all
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${allDone || isCompleted
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : 'bg-gradient-to-r from-blue-500 to-purple-600'
                            }`}
                    />
                </div>

                {/* All Done Banner */}
                {allDone && !isCompleted && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl text-center"
                    >
                        <p className="text-green-700 dark:text-green-400 font-bold text-lg">
                            🎉 All items checked! Mark as complete to earn your points!
                        </p>
                    </motion.div>
                )}

                {isCompleted && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl text-center"
                    >
                        <p className="text-green-700 dark:text-green-400 font-bold">
                            ✅ You've completed this checklist!
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Checklist Items */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="space-y-3">
                    {resource.checklistItems?.map((item, index) => {
                        const isChecked = checkedItems.includes(index) || isCompleted;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => toggleItem(index)}
                                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all group ${isChecked
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
                                    }`}
                            >
                                {/* Checkbox */}
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isChecked
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-500'
                                    }`}>
                                    {isChecked && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 300 }}
                                        >
                                            <CheckCircle2 size={14} className="text-white" />
                                        </motion.div>
                                    )}
                                </div>

                                {/* Item Number & Text */}
                                <div className="flex items-start gap-3 flex-1">
                                    <span className={`flex-shrink-0 text-xs font-black mt-0.5 w-6 ${isChecked
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-gray-400'
                                        }`}>
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span className={`text-sm font-medium leading-relaxed ${isChecked
                                        ? 'line-through text-gray-500 dark:text-gray-400'
                                        : 'text-gray-800 dark:text-gray-200'
                                        }`}>
                                        {item}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// ─── Main Resource Detail Page ──────────────────────────────────────
const ResourceDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [resource, setResource] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarking, setBookmarking] = useState(false);

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

    useEffect(() => {
        fetchResource();
    }, [slug]);

    const fetchResource = async () => {
        try {
            setLoading(true);
            const response = await resourceService.getResource(slug);
            setResource(response.data.resource);
            setIsCompleted(response.data.isCompleted);

            // Check if bookmarked
            const bookmarks = await bookmarkService.getResourceBookmarks();
            const bookmarkedIds = bookmarks.data.resources.map(r => r._id);
            setIsBookmarked(bookmarkedIds.includes(response.data.resource._id));
        } catch (error) {
            toast.error('Resource not found');
            navigate('/resources');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        if (isCompleted || completing) return;
        setCompleting(true);
        try {
            const response = await resourceService.completeResource(resource._id);
            const { points } = response.data;

            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']
            });

            toast.success(`🎉 Completed! +${points} points earned!`, {
                duration: 4000,
                icon: '🏆'
            });

            setIsCompleted(true);
        } catch (error) {
            if (error.response?.data?.message === 'Resource already completed') {
                setIsCompleted(true);
                toast('Already completed!', { icon: '✅' });
            } else {
                toast.error('Failed to mark as complete');
            }
        } finally {
            setCompleting(false);
        }
    };

    const handleShare = async () => {
        try {
            await navigator.share({
                title: resource.title,
                text: resource.description,
                url: window.location.href
            });
        } catch {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleBookmark = async () => {
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

    if (loading) {
        return (
            <div className={darkMode ? 'dark' : ''}>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
                        <LoadingSkeleton className="h-10 w-48" />
                        <LoadingSkeleton className="h-64 w-full" />
                        <LoadingSkeleton className="h-96 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!resource) return null;

    const TypeIcon = typeConfig[resource.type]?.icon || BookOpen;
    const typeGradient = typeConfig[resource.type]?.color || 'from-blue-500 to-purple-600';
    const typeLightColor = typeConfig[resource.type]?.lightColor || '';

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* ── Back Button ── */}
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => navigate('/resources')}
                        className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                    >
                        <ArrowLeft size={20} />
                        Back to Resources
                    </motion.button>

                    {/* ── Hero Header ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-gradient-to-r ${typeGradient} rounded-3xl p-8 mb-6 text-white relative overflow-hidden`}
                    >
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                        <div className="relative z-10">
                            {/* Type & Category */}
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-xl rounded-full text-sm font-bold border border-white/30">
                                    <TypeIcon size={14} />
                                    {typeConfig[resource.type]?.label}
                                </span>
                                <span className="px-3 py-1.5 bg-white/20 backdrop-blur-xl rounded-full text-sm font-bold border border-white/30">
                                    {categoryIcons[resource.category]} {resource.category}
                                </span>
                                <span className="px-3 py-1.5 bg-white/20 backdrop-blur-xl rounded-full text-sm font-bold border border-white/30">
                                    {resource.level}
                                </span>
                                {resource.featured && (
                                    <span className="flex items-center gap-1 px-3 py-1.5 bg-yellow-400/30 rounded-full text-sm font-bold border border-yellow-300/30">
                                        <Star size={12} className="fill-yellow-300 text-yellow-300" />
                                        Featured
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl md:text-3xl font-heading font-bold mb-3 leading-tight">
                                {resource.title}
                            </h1>

                            {/* Description */}
                            <p className="text-base opacity-90 mb-6 leading-relaxed max-w-2xl">
                                {resource.description}
                            </p>

                            {/* Meta Info */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                                    <Clock size={16} className="mb-1" />
                                    <p className="text-xs opacity-80">Duration</p>
                                    <p className="font-bold text-sm">{resource.duration}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                                    <Zap size={16} className="mb-1" />
                                    <p className="text-xs opacity-80">Points</p>
                                    <p className="font-bold text-sm">+{resource.estimatedPoints} pts</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                                    <Users size={16} className="mb-1" />
                                    <p className="text-xs opacity-80">Completed</p>
                                    <p className="font-bold text-sm">{resource.completionCount}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-xl rounded-xl p-3 border border-white/20">
                                    <Target size={16} className="mb-1" />
                                    <p className="text-xs opacity-80">Level</p>
                                    <p className="font-bold text-sm">{resource.level}</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                {/* Complete Button */}
                                <motion.button
                                    whileHover={{ scale: isCompleted ? 1 : 1.03 }}
                                    whileTap={{ scale: isCompleted ? 1 : 0.97 }}
                                    onClick={handleComplete}
                                    disabled={isCompleted || completing}
                                    className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${isCompleted
                                        ? 'bg-green-400/30 border-2 border-green-300/50 cursor-default'
                                        : completing
                                            ? 'bg-white/20 cursor-wait'
                                            : 'bg-white text-gray-900 hover:shadow-xl'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <>
                                            <CheckCircle2 size={18} className="text-green-300" />
                                            Completed! ✨
                                        </>
                                    ) : completing ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            >
                                                <Sparkles size={18} />
                                            </motion.div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={18} className="text-blue-600" />
                                            <span className="text-blue-600">Mark as Complete</span>
                                        </>
                                    )}
                                </motion.button>

                                {/* Share Button */}
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleShare}
                                    className="px-6 py-3 bg-white/10 border border-white/30 backdrop-blur-xl rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-white/20 transition-all"
                                >
                                    <Share2 size={18} />
                                    Share
                                </motion.button>

                                {/* Bookmark Button */}
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleBookmark}
                                    disabled={bookmarking}
                                    className={`px-6 py-3 backdrop-blur-xl rounded-xl font-bold text-sm flex items-center gap-2 transition-all border ${isBookmarked
                                        ? 'bg-yellow-400/20 border-yellow-300/50 text-yellow-200'
                                        : 'bg-white/10 border-white/30 hover:bg-white/20'
                                        }`}
                                >
                                    <Bookmark size={18} className={isBookmarked ? 'fill-yellow-300 text-yellow-300' : ''} />
                                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                                </motion.button>

                            </div>
                        </div>
                    </motion.div>

                    {/* ── Instructor Card ── */}
                    {resource.instructor?.name && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm mb-6 flex items-center gap-4"
                        >
                            <div className={`w-14 h-14 bg-gradient-to-br ${typeGradient} rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0 shadow-lg`}>
                                {resource.instructor.name[0]}
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                                    Instructor / Author
                                </p>
                                <p className="font-bold text-gray-900 dark:text-white text-lg">
                                    {resource.instructor.name}
                                </p>
                                {resource.instructor.bio && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {resource.instructor.bio}
                                    </p>
                                )}
                            </div>
                            {isCompleted && (
                                <div className="ml-auto flex-shrink-0">
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                        <CheckCircle2 size={24} className="text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ── Main Content Area ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* VIDEO */}
                        {resource.type === 'video' && (
                            <div className="space-y-6">
                                <VideoPlayer resource={resource} />

                                {/* Video Details */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                        About this Video
                                    </h2>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {resource.description}
                                    </p>

                                    {/* Tags */}
                                    {resource.tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {resource.tags.map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ARTICLE or GUIDE */}
                        {(resource.type === 'article' || resource.type === 'guide') && (
                            <ArticleReader resource={resource} />
                        )}

                        {/* CHECKLIST */}
                        {resource.type === 'checklist' && (
                            <ChecklistViewer
                                resource={resource}
                                isCompleted={isCompleted}
                                onComplete={handleComplete}
                            />
                        )}
                    </motion.div>

                    {/* ── Tags ── */}
                    {resource.tags?.length > 0 && resource.type !== 'video' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
                        >
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                                Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {resource.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Bottom Complete CTA ── */}
                    {!isCompleted && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className={`mt-8 bg-gradient-to-r ${typeGradient} rounded-3xl p-8 text-white text-center`}
                        >
                            <Award size={40} className="mx-auto mb-4 text-yellow-300" />
                            <h2 className="text-2xl font-bold mb-2">
                                Done with this {typeConfig[resource.type]?.label}?
                            </h2>
                            <p className="opacity-90 mb-6">
                                Mark it as complete to earn <span className="font-black text-yellow-300">+{resource.estimatedPoints} points</span>
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleComplete}
                                disabled={completing}
                                className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:shadow-2xl transition-all"
                            >
                                {completing ? 'Saving...' : `Complete & Earn ${resource.estimatedPoints} Points →`}
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ── Completed State ── */}
                    {isCompleted && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl p-8 text-white text-center"
                        >
                            <CheckCircle2 size={48} className="mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2">
                                You've completed this resource! 🎉
                            </h2>
                            <p className="opacity-90 mb-6">
                                Keep learning to earn more points and level up!
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/resources')}
                                className="px-8 py-4 bg-white text-green-700 rounded-xl font-bold text-lg hover:shadow-2xl transition-all"
                            >
                                Explore More Resources →
                            </motion.button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResourceDetail;