import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Moon, Sun, Sparkles, Check,
    Trash2, X, GraduationCap, Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import toast from 'react-hot-toast';

const Navbar = ({ darkMode, toggleDarkMode }) => {
    const { user, isMentor, isMentorApproved } = useAuth();
    const location = useLocation();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (showNotifications) fetchNotifications();
    }, [showNotifications]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await notificationService.getUnreadCount();
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationService.getNotifications({ limit: 10 });
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId, e) => {
        e.stopPropagation();
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read!');
        } catch {
            toast.error('Failed to mark all as read');
        }
    };

    const handleDelete = async (notificationId, e) => {
        e.stopPropagation();
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            const deletedNotif = notifications.find(n => n._id === notificationId);
            if (deletedNotif && !deletedNotif.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch {
            toast.error('Failed to delete notification');
        }
    };

    const handleClearAll = async () => {
        try {
            await notificationService.clearAll();
            setNotifications([]);
            setUnreadCount(0);
            toast.success('All notifications cleared!');
        } catch {
            toast.error('Failed to clear notifications');
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await notificationService.markAsRead(notification._id);
            setNotifications(prev =>
                prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        if (notification.link) {
            window.location.href = notification.link;
        }
        setShowNotifications(false);
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    // ─── Nav Links based on role ───────────────────────────
    const navLinks = isMentor && isMentorApproved
        ? [
            { to: '/mentor/dashboard', label: 'Dashboard' },
            { to: '/mentors', label: 'Directory' },
        ]
        : [
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/businesses', label: 'Explore' },
            { to: '/resources', label: 'Learn' },
            { to: '/mentors', label: 'Mentors' },
            { to: '/bookmarks', label: 'Bookmarks' },
        ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to={
                        isMentor && isMentorApproved
                            ? '/mentor/dashboard'
                            : '/dashboard'
                    }>
                        <div className="flex items-center gap-3 cursor-pointer">
                            <div className={`w-10 h-10 bg-gradient-to-br ${isMentor ? 'from-purple-500 to-blue-600' : 'from-blue-500 to-purple-600'} rounded-xl flex items-center justify-center`}>
                                {isMentor
                                    ? <GraduationCap className="text-white" size={20} />
                                    : <Sparkles className="text-white" size={20} />
                                }
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                                    EntreSkill Hub
                                </h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                    {isMentor ? 'Mentor Portal' : 'Dashboard'}
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Nav Links — desktop */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.to;
                            return (
                                <Link key={link.to} to={link.to}>
                                    <motion.div
                                        whileHover={{ scale: 1.03 }}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isActive
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        {link.label}
                                        {link.label === 'Mentors' && (
                                            <span className="ml-1.5 px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded-full font-bold">
                                                New
                                            </span>
                                        )}
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">

                        {/* Notifications */}
                        <div className="relative" ref={dropdownRef}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <Bell
                                    size={20}
                                    className={`transition-colors ${unreadCount > 0
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-gray-600 dark:text-gray-400'
                                        }`}
                                />
                                <AnimatePresence>
                                    {unreadCount > 0 && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold px-1"
                                        >
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>

                            {/* Notifications Dropdown */}
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                                    >
                                        {/* Header */}
                                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white">
                                                    Notifications
                                                </h3>
                                                {unreadCount > 0 && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {unreadCount} unread
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={handleMarkAllAsRead}
                                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                                                    >
                                                        <Check size={12} />
                                                        Mark all read
                                                    </button>
                                                )}
                                                {notifications.length > 0 && (
                                                    <button
                                                        onClick={handleClearAll}
                                                        className="text-xs text-red-500 hover:underline font-semibold flex items-center gap-1"
                                                    >
                                                        <Trash2 size={12} />
                                                        Clear all
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* List */}
                                        <div className="max-h-96 overflow-y-auto">
                                            {loading ? (
                                                <div className="p-8 text-center">
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                        className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"
                                                    />
                                                </div>
                                            ) : notifications.length === 0 ? (
                                                <div className="p-8 text-center">
                                                    <div className="text-4xl mb-3">🔔</div>
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                                        No notifications yet
                                                    </p>
                                                </div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <motion.div
                                                        key={notif._id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        onClick={() => handleNotificationClick(notif)}
                                                        className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer group transition-colors ${!notif.isRead
                                                            ? 'bg-blue-50/50 dark:bg-blue-900/10'
                                                            : ''
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex-shrink-0 text-2xl">
                                                                {notif.icon}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <p className={`text-sm font-semibold ${!notif.isRead
                                                                        ? 'text-gray-900 dark:text-white'
                                                                        : 'text-gray-700 dark:text-gray-300'
                                                                        }`}>
                                                                        {notif.title}
                                                                    </p>
                                                                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        {!notif.isRead && (
                                                                            <button
                                                                                onClick={(e) => handleMarkAsRead(notif._id, e)}
                                                                                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-500"
                                                                            >
                                                                                <Check size={12} />
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={(e) => handleDelete(notif._id, e)}
                                                                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                                                                        >
                                                                            <X size={12} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                                                    {notif.message}
                                                                </p>
                                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                                    {getTimeAgo(notif.createdAt)}
                                                                </p>
                                                            </div>
                                                            {!notif.isRead && (
                                                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>

                                        {notifications.length > 0 && (
                                            <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                                                <button className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                                                    View all notifications
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Dark Mode Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleDarkMode}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            {darkMode
                                ? <Sun size={20} className="text-yellow-500" />
                                : <Moon size={20} className="text-gray-600" />
                            }
                        </motion.button>

                        {/* Profile */}
                        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                            <div className={`w-9 h-9 bg-gradient-to-br ${isMentor ? 'from-purple-500 to-blue-600' : 'from-blue-500 to-purple-600'} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                                {user?.fullName?.[0] || 'U'}
                            </div>
                            <div className="hidden lg:block">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {user?.fullName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                    {user?.role}
                                    {isMentor && (
                                        <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${user?.mentorVerificationStatus === 'approved'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {user?.mentorVerificationStatus}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;