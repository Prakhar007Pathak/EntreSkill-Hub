import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Calendar, Clock, Video, MessageSquare,
    CheckCircle, XCircle, AlertCircle,
    ArrowLeft, Loader2, GraduationCap, Eye
} from 'lucide-react';
import mentorService from '../services/mentorService';
import Navbar from '../components/dashboard/Navbar';
import toast from 'react-hot-toast';

// ─── Status Config ─────────────────────────────────────────
const statusConfig = {
    requested: {
        label: 'Pending',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: AlertCircle
    },
    scheduled: {
        label: 'Scheduled',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: Calendar
    },
    completed: {
        label: 'Completed',
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: CheckCircle
    },
    cancelled: {
        label: 'Cancelled',
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        icon: XCircle
    },
    rejected: {
        label: 'Rejected',
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: XCircle
    }
};

const MySessions = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await mentorService.getUserSessions();
            setSessions(res.data.sessions);
        } catch (err) {
            toast.error('Failed to load sessions');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'requested', label: 'Pending' },
        { id: 'scheduled', label: 'Upcoming' },
        { id: 'completed', label: 'Completed' }
    ];

    const filteredSessions = activeTab === 'all'
        ? sessions
        : sessions.filter(s => s.status === activeTab);

    const getTabCount = (tabId) => {
        if (tabId === 'all') return sessions.length;
        return sessions.filter(s => s.status === tabId).length;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-purple-600 font-medium mb-4 transition-colors"
                    >
                        <ArrowLeft size={18} /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
                    <p className="text-gray-600 mt-1">Track all your mentor sessions</p>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === tab.id
                                ? 'bg-purple-500 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.label}
                            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-100 text-gray-500'
                                }`}>
                                {getTabCount(tab.id)}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Sessions List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={32} className="animate-spin text-purple-500" />
                    </div>
                ) : filteredSessions.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm"
                    >
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <GraduationCap size={28} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No sessions found</h3>
                        <p className="text-gray-500 mb-6 text-sm">
                            {activeTab === 'all'
                                ? 'Connect with a mentor to book your first session'
                                : `No ${activeTab} sessions at the moment`}
                        </p>
                        {activeTab === 'all' && (
                            <button
                                onClick={() => navigate('/mentors')}
                                className="px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-all"
                            >
                                Find Mentors
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {filteredSessions.map((session, index) => {
                            const config = statusConfig[session.status] || statusConfig.requested;
                            const StatusIcon = config.icon;
                            const mentor = session.mentorId;

                            return (
                                <motion.div
                                    key={session._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`bg-white rounded-2xl border-2 ${config.border} p-6 shadow-sm hover:shadow-md transition-all`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left: Info */}
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            {/* Mentor Avatar */}
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <span className="text-white font-bold text-sm">
                                                    {mentor?.fullName
                                                        ?.split(' ')
                                                        .map(n => n[0])
                                                        .join('')
                                                        .toUpperCase()
                                                        .slice(0, 2) || 'M'}
                                                </span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 truncate text-base">
                                                    {session.topic}
                                                </h3>
                                                <p className="text-gray-500 text-sm mt-0.5">
                                                    with{' '}
                                                    <span className="font-medium text-gray-700">
                                                        {mentor?.fullName || 'Mentor'}
                                                    </span>
                                                </p>

                                                {/* Badges */}
                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    {/* Type Badge */}
                                                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${session.type === 'qa'
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-purple-100 text-purple-700'
                                                        }`}>
                                                        {session.type === 'qa'
                                                            ? <MessageSquare size={10} />
                                                            : <Video size={10} />
                                                        }
                                                        {session.type === 'qa' ? 'Q&A' : 'Video Call'}
                                                    </span>

                                                    {/* Status Badge */}
                                                    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${config.color} ${config.bg}`}>
                                                        <StatusIcon size={10} />
                                                        {config.label}
                                                    </span>

                                                    {/* Scheduled Time */}
                                                    {session.scheduledAt && (
                                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                                            <Clock size={11} />
                                                            {new Date(session.scheduledAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    )}

                                                    {/* Duration */}
                                                    {session.duration && (
                                                        <span className="text-xs text-gray-400">
                                                            {session.duration} min
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Message */}
                                                {session.message && (
                                                    <p className="text-gray-500 text-xs mt-2 italic line-clamp-1">
                                                        "{session.message}"
                                                    </p>
                                                )}

                                                {/* Rejection Reason */}
                                                {session.status === 'rejected' && session.rejectionReason && (
                                                    <div className="mt-2 flex items-start gap-1.5">
                                                        <XCircle size={12} className="text-red-500 flex-shrink-0 mt-0.5" />
                                                        <p className="text-red-500 text-xs">
                                                            Reason: {session.rejectionReason}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Q&A question count for scheduled Q&A sessions */}
                                                {session.type === 'qa' && session.status === 'scheduled' && (
                                                    <p className="text-blue-600 text-xs mt-2 font-medium">
                                                        💬 {session.questions?.length || 0} question(s) asked
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: Action Button */}
                                        <div className="flex-shrink-0">
                                            {session.status === 'scheduled' && session.type === 'video_call' && session.jitsiRoomUrl && (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => navigate(`/session-room/${session._id}`)}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all"
                                                >
                                                    <Video size={14} />
                                                    Join Call
                                                </motion.button>
                                            )}

                                            {session.status === 'scheduled' && session.type === 'qa' && (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => navigate(`/qa-room/${session._id}`)}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all"
                                                >
                                                    <Eye size={14} />
                                                    Open Q&A
                                                </motion.button>
                                            )}

                                            {session.status === 'completed' && session.type === 'qa' && (
                                                <button
                                                    onClick={() => navigate(`/qa-room/${session._id}`)}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all"
                                                >
                                                    <Eye size={14} />
                                                    View Q&A
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MySessions;